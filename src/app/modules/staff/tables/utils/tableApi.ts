import { db } from "@/config/db/firebase";
import { doc, onSnapshot } from "firebase/firestore";

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
        .filter((staffMember: any) => staffMember.status === "online")
        .map((staffMember: any) => ({
          name: staffMember.name,
          notificationToken: staffMember.notificationToken,
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
