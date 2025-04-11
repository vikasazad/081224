"use client";
import { db } from "@/config/db/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export function getKitchenAndMenuData(
  callback: (data: { kitchen: any; menu: any } | null) => void
) {
  try {
    // Create listeners for both documents
    // const restaurantRef = doc(db, "vikumar.azad@gmail.com", "restaurant");
    const hotelRef = doc(db, "vikumar.azad@gmail.com", "hotel");
    // Use separate onSnapshot listeners for each document
    let hotelData: any = null;

    // Function to update callback when both documents are available
    const updateCallback = () => {
      if (hotelData !== null) {
        callback({
          menu: hotelData?.menu,
          kitchen: hotelData?.kitchen,
        });
      }
    };

    // Set up listener for restaurant document

    // Set up listener for hotel document
    const hotelUnsubscribe = onSnapshot(
      hotelRef,
      (hotelSnap) => {
        if (!hotelSnap.exists()) {
          console.error("Hotel document not found");
          callback(null);
        } else {
          hotelData = hotelSnap.data();
          updateCallback();
        }
      },
      (error) => {
        console.error("Error getting hotel updates:", error);
        callback(null);
      }
    );

    // Return a function that unsubscribes from both listeners
    const unsubscribe = () => {
      hotelUnsubscribe();
    };

    return unsubscribe;
  } catch (error) {
    console.error("Error setting    up real-time listener:", error);
    callback(null);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: any,
  startedAt?: string,
  completedAt?: string
) {
  try {
    const hotelRef = doc(db, "vikumar.azad@gmail.com", "hotel");

    const updateData: any = {
      [`kitchen.orders.${orderId}.status`]: newStatus,
    };

    // Add timestamps if provided
    if (startedAt) {
      updateData[`kitchen.orders.${orderId}.startedAt`] = startedAt;
    }
    if (completedAt) {
      updateData[`kitchen.orders.${orderId}.completedAt`] = completedAt;
    }

    await updateDoc(hotelRef, updateData);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export const updateMenuItemsAvailability = async (data: any) => {
  // console.log("ROO<DADTA", roomData);
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "hotel");

    await updateDoc(docRef, {
      "menu.categories": data,
    });

    console.log("Data successfully updated and saved to Firestore.");
    return true;
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
};
