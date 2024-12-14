"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getRoomData() {
  const session = await auth();
  const user = session?.user?.email;

  // Ensure user is defined
  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data: any = {
        foodMenuItems: [],
        hotelRoomIssues: [],
        hotelServices: [],
      };

      // Process menu items if menu data exists
      if (docSnap.data().menu) {
        const category = docSnap.data().menu.categories;
        category.forEach((menu: any) =>
          menu.menuItems.forEach((item: any) => {
            const portionSizes = Object.keys(item.price); // Get portion sizes
            portionSizes.forEach((portion) => {
              const obj = {
                id: item.id,
                name: item.name,
                quantity: portion, // Portion size
                price: item.price[portion], // Corresponding price
              };
              data.foodMenuItems.push(obj);
            });
          })
        );
      }

      // Process room issues if issue data exists
      if (docSnap.data().issues) {
        const issues = docSnap.data().issues;
        Object.entries(issues).forEach(([key, value]: any) => {
          value.forEach((subtype: any) => {
            const obj = {
              name: key,
              issueSubtype: subtype,
              description: false,
            };
            data.hotelRoomIssues.push(obj);
          });
        });
      }

      // Process services if services data exists
      if (docSnap.data().services) {
        const categories = docSnap.data().services.categories;
        Object.values(categories).forEach((category: any) =>
          Object.values(category).forEach((service: any) => {
            service.forEach((detail: any) => {
              const obj = {
                name: detail.typeName || "Service",
                startTime: detail.startTime || "N/A",
                endTime: detail.endTime || "N/A",
                price: detail.price || 0,
              };
              data.hotelServices.push(obj);
            });
          })
        );
      }

      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return false;
  }
}

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
      const data: any = {
        foodMenuItems: [],
        hotelTableIssues: [],
      };
      if (docSnap.data().menu) {
        const category = docSnap.data().menu.categories;
        category.map((menu: any) =>
          menu.menuItems.map((item: any) => {
            const portionSizes = Object.keys(item.price); // Get the portion sizes (e.g., ["Single"], ["Half", "Full"], ["Medium", "Large"])
            portionSizes.map((portion) => {
              const obj = {
                id: item.id,
                name: item.name,
                quantity: portion, // Portion size (e.g., "Single", "Half", "Full", etc.)
                price: item.price[portion], // Corresponding price for the portion size
              };
              data.foodMenuItems.push(obj);
            });
          })
        );
      }

      if (docSnap.data().issues) {
        const arr = docSnap.data().issues;
        Object.entries(arr).forEach(([key, value]: any) => {
          value.forEach((subtype: any) => {
            const obj = {
              name: key,
              issueSubtype: subtype,
              description: false,
            };
            data.hotelTableIssues.push(obj);
          });
        });
      }

      return data;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function saveToken(token: string) {
  const session: any = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "info");
  if (session?.user?.role === "admin") {
    try {
      const docRef = doc(db, user, "info");
      await updateDoc(docRef, {
        "personalInfo.notificationToken": token,
      });
    } catch {
      return false;
    }
  } else {
    try {
      // Step 1: Retrieve the current staff array
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        // Step 2: Find and update the specific staff member
        const updatedStaff = staff.map((member: any) => {
          if (member.email === session?.user?.staff?.email) {
            return {
              ...member,
              notificationToken: token,
            };
          }
          return member;
        });

        // Step 3: Update the staff array in Firestore
        await updateDoc(docRef, {
          staff: updatedStaff,
        });

        console.log("Notification token updated successfully for Sarah Lee");
      } else {
        console.error("Document does not exist");
      }
    } catch (error) {
      console.error("Error updating notification token:", error);
    }
  }
}

export async function setOfflineItem(tableData: any) {
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
      const data = docSnap.data().live.tables;

      const tablePhone = tableData?.diningDetails?.customer?.phone;
      // console.log("YYYYYYY", tablePhone);

      if (!tablePhone) {
        console.error("Phone number is missing in tableData");
        return false;
      }

      const updatedData = data.map((item: any) => {
        if (item.diningDetails?.customer?.phone === tablePhone) {
          return {
            ...item,
            ...tableData,
          };
        }
        return item;
      });

      // return updatedData;

      await updateDoc(docRef, {
        "live.tables": updatedData,
      });

      console.log("Data successfully updated and saved to Firestore.");
      return true;
    } else {
      console.error("Document does not exist.");
    }
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}
