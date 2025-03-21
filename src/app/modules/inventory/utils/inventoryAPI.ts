import { db } from "@/config/db/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";

export async function saveInventoryItem(inventoryData: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");

    await updateDoc(docRef, {
      "store.items": arrayUnion(inventoryData),
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}

export async function saveEditedItem(updatedItems: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");

    // Update the document with the new items array
    console.log("UPDATEDITEMS", updatedItems);
    await updateDoc(docRef, {
      "store.items": updatedItems,
    });

    console.log("Item successfully edited in Firestore");
    return true;
  } catch (error) {
    console.error("Error editing item in Firestore:", error);
    throw error;
  }
}
export async function saveDeletedItem(inventoryData: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");
    await updateDoc(docRef, {
      "store.items": inventoryData,
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }
  return false;
}

export async function saveNewSky(sku: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");

    await updateDoc(docRef, {
      "store.sku": arrayUnion(sku),
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}

export async function addNewCategory(category: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");

    await updateDoc(docRef, {
      "store.categories": arrayUnion(category),
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}
export async function saveEditedCategory(updatedItems: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");
    // Update the document with the new items array
    await updateDoc(docRef, {
      "store.categories": updatedItems,
    });

    console.log("Item successfully edited in Firestore");
    return true;
  } catch (error) {
    console.error("Error editing item in Firestore:", error);
    throw error;
  }
}

export async function saveDeletedCategory(inventoryData: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");
    await updateDoc(docRef, {
      "store.categories": inventoryData,
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }
  return false;
}

export async function addNewSupplier(supplier: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");

    await updateDoc(docRef, {
      "store.suppliers": arrayUnion(supplier),
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}

export async function saveEditedSupplier(updatedItems: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");
    // Update the document with the new items array
    await updateDoc(docRef, {
      "store.suppliers": updatedItems,
    });

    console.log("Item successfully edited in Firestore");
    return true;
  } catch (error) {
    console.error("Error editing item in Firestore:", error);
    throw error;
  }
}

export async function saveDeletedSupplier(supplierData: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");
    await updateDoc(docRef, {
      "store.suppliers": supplierData,
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }
  return false;
}

export async function addNewTransaction(transaction: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");

    await updateDoc(docRef, {
      "store.recentTransactions": arrayUnion(transaction),
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}

export async function saveLowStockEditedItem(updatedItem: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist");
      return false;
    }

    let items = docSnap.data().store?.items || [];

    // Find and update the item in the suppliers array
    items = items.map((item: any) =>
      item.name === updatedItem.name ? { ...item, ...updatedItem } : item
    );

    // Save the updated array back to Firestore
    console.log("items", items);
    await updateDoc(docRef, {
      "store.items": items,
    });

    console.log("Item successfully edited in Firestore");
    return true;
  } catch (error) {
    console.error("Error editing item in Firestore:", error);
    throw error;
  }
}
