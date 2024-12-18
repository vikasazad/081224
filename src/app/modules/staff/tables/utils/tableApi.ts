import { db } from "@/config/db/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
interface StaffMember {
  name: string;
  token: string;
  orders: string[];
}

export const calculateOrderTotal = (order: any) => {
  const itemsTotal = order.reduce(
    (total: number, item: any) => total + parseFloat(item.price),
    0
  );

  return itemsTotal;
};

export const calculateTax = (order: any, tax: string) => {
  const total = calculateOrderTotal(order);
  const rounded = Math.round((total * Number(tax)) / 100);
  return rounded;
};

export const calculateFinalAmount = (item: any) => {
  const final = item.diningDetails.orders.map((data: any) => {
    if (data.payment.paymentStatus === "pending") {
      const total = data.items.reduce((total: number, order: any) => {
        return total + parseFloat(order.price || "0");
      }, 0);
      const gstAmount = parseFloat(data.payment?.gst?.gstAmount || "0");

      return total + gstAmount;
    }
    return undefined; // Explicitly return undefined for clarity
  });

  // Filter out undefined values and calculate the sum
  const validValues = final.filter((value: any) => value !== undefined);
  const sum = validValues.reduce((acc: any, value: any) => acc + value, 0);

  return sum || 0; // Return 0 if no valid values
};

export function getOnlineStaffFromFirestore(callback: any) {
  const docRef = doc(db, "vikumar.azad@gmail.com", "info");

  try {
    const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
      if (!docSnap.exists()) {
        console.error("Document not found");
        callback(new Error("Document not found"), null);
        return;
      }

      const info = docSnap.data().staff;

      if (!info) {
        console.error("Invalid info object or staff list.");
        callback(new Error("Invalid info object or staff list."), null);
        return;
      }

      const onlineStaff = info
        .filter(
          (staffMember: any) =>
            staffMember.status === "online" && staffMember.role === "attendant"
        )
        .map((staffMember: any) => ({
          name: staffMember.name,
          notificationToken: staffMember.notificationToken,
          orders: staffMember.orders,
        }));

      callback(onlineStaff);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up real-time listener: ", error);
    callback(error);
    throw error;
  }
}

export async function updateOrdersForAttendant(
  attendantName: string,
  orderId: string
) {
  try {
    // Reference to the Firestore document containing staff info
    const docRef = doc(db, "vikumar.azad@gmail.com", "info");

    // Fetch the document to get the current staff data
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document not found");
      return;
    }

    const staff = docSnap.data().staff;

    if (!staff) {
      console.error("Invalid staff data");
      return;
    }

    // Find the new attendant by name
    const newAttendantIndex = staff.findIndex(
      (staffMember: any) =>
        staffMember.name === attendantName && staffMember.role === "attendant"
    );

    if (newAttendantIndex === -1) {
      console.error("New Attendant not found");
      return;
    }

    // Find the previous attendant who had this order
    const previousAttendantIndex = staff.findIndex(
      (staffMember: any) =>
        staffMember.role === "attendant" &&
        staffMember.orders?.includes(orderId)
    );

    // Modify the staff array
    if (newAttendantIndex !== -1) {
      // Add the orderId to the new attendant's orders
      staff[newAttendantIndex].orders = staff[newAttendantIndex].orders || [];
      staff[newAttendantIndex].orders.push(orderId);
    }

    // Remove the orderId from the previous attendant's orders if found
    if (
      previousAttendantIndex !== -1 &&
      previousAttendantIndex !== newAttendantIndex
    ) {
      staff[previousAttendantIndex].orders = staff[
        previousAttendantIndex
      ].orders.filter((id: string) => id !== orderId);
    }

    // Update the document with the modified staff array
    // console.log("staff", staff);
    await updateDoc(docRef, {
      staff: staff,
    });

    console.log("Order attendant updated successfully");
  } catch (error) {
    console.error("Error updating orders: ", error);
  }
}

export async function setAttendent(tableData: any) {
  console.log("tableData", tableData);
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "restaurant");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Get the existing live tables data
      const existingTables = docSnap.data().live.tables;

      // Find the index of the table with matching location
      const tableIndex = existingTables.findIndex(
        (table: any) =>
          table.diningDetails.location === tableData[0].diningDetails.location
      );

      // If a matching table is found, replace it with the new table data
      if (tableIndex !== -1) {
        existingTables[tableIndex] = tableData[0];

        // Update the document with the modified tables array
        // console.log("existingTables", existingTables);
        await updateDoc(docRef, {
          "live.tables": existingTables,
        });

        console.log("Table data successfully updated in Firestore.");
        return true;
      } else {
        // If no matching table is found, you might want to add the new table
        // or handle this case differently
        console.warn("No matching table location found.");
        return false;
      }
    } else {
      console.error("Document does not exist.");
      return false;
    }
  } catch (error) {
    console.error("ERROR updating table data:", error);
    return false;
  }
}

export function assignAttendantSequentially(
  availableStaff: StaffMember[]
): StaffMember | null {
  if (availableStaff.length === 0) return null;

  // Sort staff by number of current orders (ascending)
  const sortedStaff = [...availableStaff].sort(
    (a, b) => a.orders.length - b.orders.length
  );

  // Return the staff with the least number of orders
  return sortedStaff[0];
}

export async function setTables(tableData: any) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "restaurant");

    await updateDoc(docRef, {
      "live.tables": tableData,
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}

// export async function getOnlineStaffFromFirestore() {
//   const docRef = doc(db, "vikumar.azad@gmail.com", "info");

//   try {
//     const docSnap = await getDoc(docRef);

//     if (!docSnap.exists()) {
//       throw new Error("Document not found");
//     }

//     const info = docSnap.data().staff;

//     if (!info) {
//       throw new Error("Invalid info object or staff list.");
//     }

//     return info
//       .filter((staffMember: any) => staffMember.status === "online")
//       .map((staffMember: any) => ({
//         name: staffMember.name,
//         notificationToken: staffMember.notificationToken,
//       }));
//   } catch (error) {
//     console.error("Error fetching document: ", error);
//     throw error;
//   }
// }
