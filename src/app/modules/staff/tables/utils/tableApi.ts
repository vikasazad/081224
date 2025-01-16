import { db } from "@/config/db/firebase";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
interface StaffMember {
  name: string;
  token: string;
  orders: string[];
}

export const calculateOrderTotal = (order: any) => {
  // console.log("Calculating Order Total...", order);
  const Total =
    order.reduce((total: number, orderItem: any) => {
      return total + Number(orderItem.price);
    }, 0) || 0;

  // console.log("Total  Amount:", Total);

  return Total;
};

export const calculateTax = (order: any, tax: string) => {
  // console.log("Calculating Tax...", order);
  const total = calculateOrderTotal(order);
  // console.log("Order Total for Tax Calculation:", total);

  const roundedTax = Math.round((total * parseFloat(tax)) / 100);
  // console.log(`Calculated Tax (${tax}%):`, roundedTax);

  return roundedTax;
};

export const calculateFinalAmount = (item: any) => {
  // console.log("Calculating Final Amount...", item);

  let bookingTotal = 0;
  if (item.bookingDetails.location) {
    if (item.bookingDetails.payment.paymentStatus === "pending") {
      const gstAmount = Number(
        item.bookingDetails.payment?.gst?.gstAmount || "0"
      );
      bookingTotal = Number(item.bookingDetails.payment.price) + gstAmount;
    }
  }

  // console.log("Total Pending Booking Amount:", bookingTotal);

  // Calculate pending payments for diningDetails
  const diningTotal =
    item.diningDetails?.orders
      ?.map((order: any) => {
        if (order.payment.paymentStatus === "pending") {
          // console.log("Pending Dining Order Found:", order);
          const itemsTotal = order.items.reduce((total: number, item: any) => {
            // console.log("Pending Dining Item Price:", item.price);
            return total + parseFloat(item.price || "0");
          }, 0);

          const gstAmount = parseFloat(order.payment?.gst?.gstAmount || "0");
          // console.log("Dining GST Amount:", gstAmount);

          const orderTotal = itemsTotal + gstAmount;
          // console.log("Dining Order Total (Pending):", orderTotal);
          return orderTotal;
        }
        return 0;
      })
      .reduce((sum: number, value: number) => sum + value, 0) || 0;

  // console.log("Total Pending Dining Amount:", diningTotal);

  // Calculate pending payments for servicesUsed
  const servicesTotal =
    item?.servicesUsed
      ?.filter(
        (service: any) =>
          service.payment.paymentStatus === "pending" &&
          service.status !== "Cancelled"
      )
      .reduce((total: number, service: any) => {
        const price = parseFloat(service.payment?.price || "0");
        const gstAmount = parseFloat(service.payment?.gst?.gstAmount || "0");
        return total + price + gstAmount;
      }, 0) || 0;

  // console.log("Total Pending Services Amount:", servicesTotal);

  // Return the combined total
  const combinedFinalAmount = diningTotal + servicesTotal + bookingTotal;
  // console.log("Combined Final Amount:", combinedFinalAmount);
  return combinedFinalAmount;
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
            staffMember.status === "online" && staffMember.role === "concierge"
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
export async function setRooms(roomData: any) {
  // console.log("ROO<DADTA", roomData);
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "hotel");

    await updateDoc(docRef, {
      "live.rooms": roomData,
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}
export async function setHistory(tableData: any, tableType: string) {
  console.log(tableType);
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "restaurant");
    const customerPhone = tableData.diningDetails.customer.phone;

    if (!customerPhone) {
      console.error("Customer phone number is missing in tableData.");
      return false;
    }

    const table = {
      location: tableData.diningDetails.location,
      status: "available",
      capacity:
        tableType === "twoseater" ? 2 : tableType === "fourseater" ? 4 : 6,
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

    // Use arrayUnion to push the new data into the specific history array
    await updateDoc(docRef, {
      [`history.${tableType}`]: arrayUnion(tableData),
    });
    await updateDoc(docRef, {
      [`customers.${customerPhone}`]: arrayUnion(tableData),
    });
    await updateDoc(docRef, {
      [`live.tablesData.tableDetails.${tableType}`]: arrayUnion(table),
    });

    console.log("Data successfully updated and saved to Firestore.");
    removeTableData(tableData.diningDetails.location);
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}
export async function setHistoryRoom(roomData: any, roomType: string) {
  console.log(roomType);
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "hotel");
    const customerPhone = roomData.bookingDetails.customer.phone;

    if (!customerPhone) {
      console.error("Customer phone number is missing in roomData.");
      return false;
    }

    const room = {
      roomNo: roomData.bookingDetails.location,
      status: "available",
      roomType: roomData.bookingDetails.roomType,
      price: roomData.bookingDetails.payment.price,
      inclusions: roomData.bookingDetails.inclusions,
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

    // Use arrayUnion to push the new data into the specific history array
    await updateDoc(docRef, {
      [`history.${roomType}`]: arrayUnion(roomData),
    });
    await updateDoc(docRef, {
      [`customers.${customerPhone}`]: arrayUnion(roomData),
    });
    await updateDoc(docRef, {
      [`live.roomsData.roomDetail.${roomType}`]: arrayUnion(room),
    });

    console.log("Data successfully updated and saved to Firestore.");
    removeRoomData(roomData.bookingDetails.location);
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}

export async function removeRoomData(roomNo: string) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "hotel");

    // Fetch the current live.tables data
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      console.error("Document not found!");
      return false;
    }

    const data = docSnapshot.data();
    const liveRooms = data?.live?.rooms || [];

    // Filter out the tableData to remove the specified table by its ID (e.g., location or unique identifier)
    const updatedTables = liveRooms.filter(
      (room: any) => room.bookingDetails?.location !== roomNo
    );

    // Update Firestore with the remaining data
    await updateDoc(docRef, {
      "live.rooms": updatedTables,
    });

    console.log(`Table with ID '${roomNo}' removed successfully.`);
    return true;
  } catch (error) {
    console.error("ERROR removing table data:", error);
  }

  return false;
}
export async function removeTableData(tableId: string) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "restaurant");

    // Fetch the current live.tables data
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      console.error("Document not found!");
      return false;
    }

    const data = docSnapshot.data();
    const liveTables = data?.live?.tables || [];

    // Filter out the tableData to remove the specified table by its ID (e.g., location or unique identifier)
    const updatedTables = liveTables.filter(
      (table: any) => table.diningDetails?.location !== tableId
    );

    // Update Firestore with the remaining data
    await updateDoc(docRef, {
      "live.tables": updatedTables,
    });

    console.log(`Table with ID '${tableId}' removed successfully.`);
    return true;
  } catch (error) {
    console.error("ERROR removing table data:", error);
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
