"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { removeTableData } from "../../staff/tables/utils/tableApi";
import { storage } from "@/config/db/firebase";
import { ref, listAll, deleteObject } from "firebase/storage";
export async function getTableData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "restaurant");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().tables;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function getMenuData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log(docSnap.data().data);
      return docSnap.data().menu;
    } else {
      // Handle the case when the document does not exist
      return null;
    }
  } catch {
    return false;
  }
}

export async function getKitchenData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().kitchen;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}
export async function getQRData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "restaurant");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data().tables;

    // Extract all table numbers
    let tableNumbers: string[] = [];

    data.forEach((category: any) => {
      Object.keys(category).forEach((key) => {
        const tableCategory = category[key];
        if (Array.isArray(tableCategory)) {
          tableCategory.forEach((table: any) => {
            if (table.tableNumber) {
              tableNumbers = tableNumbers.concat(table.tableNumber);
              tableNumbers.sort();
            }
          });
        }
      });
    });
    return tableNumbers;
  } else {
    console.error("Document not found!");
    return [];
  }
}

export async function getLiveTableData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "restaurant");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data().live?.tables;
      const tableNumbers: { location: string; capacity: string }[] = [];
      data.forEach((category: any) => {
        tableNumbers.push({
          location: category?.diningDetails?.location,
          capacity:
            category?.diningDetails?.capicity === "2"
              ? "twoseater"
              : category?.diningDetails?.capicity === "4"
              ? "fourseater"
              : "sixseater",
        });
      });
      return tableNumbers;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function handleTableRemoval(table: any) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "restaurant");
  await removeTableData(table.location);
  const addtable = {
    location: table.location,
    status: "available",
    capacity:
      table.capacity === "twoseater"
        ? "2"
        : table.capacity === "fourseater"
        ? "4"
        : "6",
    cleaning: {
      lastCleaned: "",
      cleanedBy: "",
      startTime: "",
      endTime: "",
    },
    maintenance: {
      issue: "",
      description: "",
      startTime: "",
      endTime: "",
      fixedBy: "",
    },
  };
  await updateDoc(docRef, {
    [`live.tablesData.tableDetails.${table.capacity}`]: arrayUnion(addtable),
  });
}

export async function saveMenuData(menuData: any, categoryName: string) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data().menu;
      const category = data.categories.findIndex(
        (category: any) => category.name === categoryName
      );
      data.categories[category].menuItems = menuData;
      // return data;
      await updateDoc(docRef, {
        menu: data,
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function createNewMenuCategory(
  categoryName: string,
  categoryLogo: any,
  menuItems: any[]
) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data().menu;

      // Generate new category ID
      const newCategoryId = (data.categories.length + 1).toString();

      // Create new category object
      const newCategory = {
        id: newCategoryId,
        name: categoryName,
        categoryLogo: categoryLogo,
        position: newCategoryId,
        menuItems: menuItems.map((item, index) => ({
          id: (index + 1).toString(),
          name: item.name,
          position: index + 1,
          description: item.description,
          images: item.images,
          portion: item.portion,
          price: item.price,
          cuisineName: item.cuisineName,
          categoryName: categoryName,
          nature: item.nature,
          discountType: item.discountType || "",
          discountAmount: item.discountAmount || "",
          tags: [],
          available: true,
        })),
      };
      // return newCategory;

      // Add new category to existing categories
      data.categories.push(newCategory);

      // Update the document
      await updateDoc(docRef, {
        menu: data,
      });
    }
    return true;
  } catch (error) {
    console.error("Error creating new category:", error);
    return false;
  }
}

export async function deleteMenuCategories(categoryNames: string[]) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data().menu;

      // Filter out the categories to be deleted
      data.categories = data.categories.filter(
        (category: any) => !categoryNames.includes(category.name)
      );

      // Update the document
      await updateDoc(docRef, {
        menu: data,
      });
    }

    await Promise.all(
      categoryNames.map(async (c) => {
        const { items } = await listAll(ref(storage, `menu/${c}`));
        await Promise.all(items.map(deleteObject));
      })
    );
    return true;
  } catch (error) {
    console.error("Error deleting categories:", error);
    return false;
  }
}
