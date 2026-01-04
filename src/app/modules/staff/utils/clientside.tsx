"use client";

import { db, storage } from "@/config/db/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";

// Helper function to create empty result structure
function createEmptyResult() {
  return {
    hotelOverview: {
      todayCheckIn: [],
      ongoing: [],
      todayCheckOut: [],
      vacant: [],
      maintenance: [],
      status: {},
    },
    restaurantOverview: {
      occupied: [],
      reserved: [],
      available: [],
      cleaning: [],
      status: {},
    },
    deliveryOverview: [],
    takeawayOverview: [],
    businessInfo: {},
    webhook: {},
  };
}

// Helper function to check if room should check in today
function isTodayCheckIn(checkInDate: string): boolean {
  const checkInTime = new Date(checkInDate);
  return checkInTime.toDateString() === new Date().toDateString();
}

// Helper function to check if room should check out today
function isTodayCheckOut(checkOutDate: string): boolean {
  const checkOutTime = new Date(checkOutDate);
  return checkOutTime.toDateString() === new Date().toDateString();
}

// Helper function to process hotel data
function processHotelData(hotelSnapshot: any, result: any) {
  if (!hotelSnapshot.exists()) return;

  const hotelData = hotelSnapshot.data();
  const live = hotelData.live;

  result.deliveryOverview = hotelData.delivery || [];
  result.takeawayOverview = hotelData.takeaway || [];
  result.hotelOverview.todayCheckIn = (hotelData.reservation || []).filter(
    (reservation: any) =>
      reservation?.checkIn && isTodayCheckIn(reservation.checkIn)
  );
  result.hotelOverview.ongoing = live?.rooms || [];
  result.hotelOverview.status = live?.roomsData?.status || {};

  // Process ongoing rooms for today's checkouts
  live?.rooms?.forEach((room: any) => {
    if (
      room?.bookingDetails?.checkOut &&
      isTodayCheckOut(room.bookingDetails.checkOut)
    ) {
      result.hotelOverview.todayCheckOut.push(room);
    }
  });

  // Process room details for vacant and maintenance rooms
  const roomDetails = live?.roomsData?.roomDetail || {};
  Object.values(roomDetails).forEach((rooms: any) => {
    rooms?.forEach((room: any) => {
      if (room.status === "available") {
        result.hotelOverview.vacant.push(room);
      } else if (room.status === "fixing required") {
        result.hotelOverview.maintenance.push(room);
      }
    });
  });
}

// Helper function to process restaurant data
function processRestaurantData(restaurantSnapshot: any, result: any) {
  if (!restaurantSnapshot.exists()) return;

  const restaurantData = restaurantSnapshot.data();
  const live = restaurantData.live;

  result.restaurantOverview.reserved = restaurantData.reservation || [];
  result.restaurantOverview.status = live?.tablesData?.status || {};

  // Process occupied tables
  live?.tables?.forEach((table: any) => {
    if (table?.diningDetails?.status === "occupied") {
      result.restaurantOverview.occupied.push(table);
    }
  });

  // Process table details for available and cleaning tables
  const tableDetails = live?.tablesData?.tableDetails || {};
  Object.values(tableDetails).forEach((tables: any) => {
    tables?.forEach((table: any) => {
      if (table.status === "available") {
        result.restaurantOverview.available.push(table);
      } else if (table.status === "cleaning") {
        result.restaurantOverview.cleaning.push(table);
      }
    });
  });
}

// Helper function to process business info
function processBusinessInfo(infoSnapshot: any, result: any) {
  if (infoSnapshot.exists()) {
    result.businessInfo = infoSnapshot.data().business || {};
  }
}

// Helper function to process webhook data (collection snapshot)
function processWebhookData(webhookSnapshot: any, result: any) {
  if (webhookSnapshot.empty) {
    result.webhook = {};
    return;
  }

  // Process all documents in the assignments collection
  const assignments: any = {};
  webhookSnapshot.docs.forEach((doc: any) => {
    assignments[doc.id] = doc.data();
  });

  result.webhook = assignments;
}

// Main function with refactored subscription management
export function handleRoomStaffInformation(
  callback: (result: any | null) => void
) {
  const docRefHotel = doc(db, "vikumar.azad@gmail.com", "hotel");
  const docRefRestaurant = doc(db, "vikumar.azad@gmail.com", "restaurant");
  const docRefBusinessInfo = doc(db, "vikumar.azad@gmail.com", "info");
  const colRefWebhookAssignments = collection(
    db,
    "vikumar.azad@gmail.com",
    "webhook",
    "assignments"
  );

  // Store latest snapshots
  let hotelSnapshot: any = null;
  let restaurantSnapshot: any = null;
  let infoSnapshot: any = null;
  let webhookSnapshot: any = null;
  // Function to process all data when any snapshot updates
  function processAllData() {
    if (
      !hotelSnapshot ||
      !restaurantSnapshot ||
      !infoSnapshot ||
      !webhookSnapshot
    ) {
      return; // Wait for all snapshots to be available
    }

    try {
      const result = createEmptyResult();

      processBusinessInfo(infoSnapshot, result);
      processHotelData(hotelSnapshot, result);
      processRestaurantData(restaurantSnapshot, result);
      processWebhookData(webhookSnapshot, result);
      callback(result);
    } catch (error) {
      console.error("Error processing Firestore data:", error);
      callback(null);
    }
  }

  // Set up listeners for all three documents
  const unsubscribeHotel = onSnapshot(
    docRefHotel,
    (snapshot) => {
      hotelSnapshot = snapshot;
      processAllData();
    },
    (error) => {
      console.error("Error in hotel snapshot listener:", error);
      callback(null);
    }
  );

  const unsubscribeRestaurant = onSnapshot(
    docRefRestaurant,
    (snapshot) => {
      restaurantSnapshot = snapshot;
      processAllData();
    },
    (error) => {
      console.error("Error in restaurant snapshot listener:", error);
      callback(null);
    }
  );

  const unsubscribeInfo = onSnapshot(
    docRefBusinessInfo,
    (snapshot) => {
      infoSnapshot = snapshot;
      processAllData();
    },
    (error) => {
      console.error("Error in info snapshot listener:", error);
      callback(null);
    }
  );

  const unsubscribeWebhook = onSnapshot(
    colRefWebhookAssignments,
    (snapshot) => {
      webhookSnapshot = snapshot;
      processAllData();
    },
    (error) => {
      console.error("Error in webhook snapshot listener:", error);
      callback(null);
    }
  );

  // Return cleanup function that unsubscribes from all listeners
  return () => {
    unsubscribeHotel();
    unsubscribeRestaurant();
    unsubscribeInfo();
    unsubscribeWebhook();
  };
}

export const calculateOrderTotal = (order: any) => {
  const itemsTotal = order.reduce(
    (total: number, item: any) => total + parseFloat(item.price),
    0
  );

  return itemsTotal;
};

export const calculateTax = (
  pricePerNight: number,
  subtotalAmount: number,
  taxType: string,
  taxDetails: any
) => {
  const taxTypeData = taxDetails[taxType];
  if (!taxTypeData) {
    throw new Error(`Invalid tax type: ${taxType}`);
  }

  let gstPercentage = 0;

  // Check if there's an "all" key for flat rate
  if (taxTypeData["all"]) {
    gstPercentage = parseFloat(taxTypeData["all"]);
  } else {
    // Look for price-based keys dynamically
    const priceKeys = Object.keys(taxTypeData).filter(
      (key) =>
        key.includes("below") ||
        key.includes("above") ||
        key.includes("under") ||
        key.includes("over")
    );

    if (priceKeys.length === 0) {
      throw new Error(`No valid tax rate found for tax type: ${taxType}`);
    }

    // Process each price-based key to find the applicable rate
    for (const key of priceKeys) {
      const lowerKey = key.toLowerCase();

      // Extract price threshold from the key
      const priceMatch = key.match(/(\d+(?:\.\d+)?)/);
      if (!priceMatch) continue;

      const threshold = parseFloat(priceMatch[1]);

      // Check if price/night falls within this bracket
      if (lowerKey.includes("below") || lowerKey.includes("under")) {
        if (pricePerNight <= threshold) {
          gstPercentage = parseFloat(taxTypeData[key]);
          break;
        }
      } else if (lowerKey.includes("above") || lowerKey.includes("over")) {
        if (pricePerNight > threshold) {
          gstPercentage = parseFloat(taxTypeData[key]);
          break;
        }
      }
    }

    // If no bracket matched, try to find a default or fallback rate
    if (gstPercentage === 0) {
      // Look for the lowest threshold as fallback
      const sortedKeys = priceKeys.sort((a, b) => {
        const aPrice = parseFloat(a.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
        const bPrice = parseFloat(b.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
        return aPrice - bPrice;
      });

      if (sortedKeys.length > 0) {
        gstPercentage = parseFloat(taxTypeData[sortedKeys[0]]);
      }
    }
  }

  if (gstPercentage === 0) {
    throw new Error(
      `Could not determine tax rate for ${taxType} with price/night: ${pricePerNight}`
    );
  }

  // Calculate amounts
  const gstAmount = Math.round((subtotalAmount * gstPercentage) / 100);
  const cgstPercentage = gstPercentage / 2;
  const sgstPercentage = gstPercentage / 2;
  const cgstAmount = (subtotalAmount * cgstPercentage) / 100;
  const sgstAmount = (subtotalAmount * sgstPercentage) / 100;

  return {
    gstAmount: Math.round(gstAmount * 100) / 100,
    gstPercentage,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    cgstPercentage,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    sgstPercentage,
  };
};

export const calculateFinalAmount = (item: any) => {
  // console.log("Calculating Final Amount...", item);

  let bookingTotal = 0;
  if (item.bookingDetails?.location) {
    if (item.bookingDetails?.payment?.paymentStatus === "pending") {
      const gstAmount = Number(
        item.bookingDetails.payment?.gst?.gstAmount || "0"
      );
      bookingTotal = Number(item.bookingDetails?.payment?.price) + gstAmount;
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

  const checklistTotal =
    item?.checklist?.payment?.paymentStatus === "pending"
      ? item?.checklist?.payment?.totalPrice
      : 0;

  // Return the combined total
  const combinedFinalAmount =
    diningTotal + servicesTotal + bookingTotal + checklistTotal;
  // console.log("Combined Final Amount:", combinedFinalAmount);
  return combinedFinalAmount;
};

// Function to fetch images from Firebase Storage for a specific reservation
export const fetchCheckInImages = async (
  reservationId: string
): Promise<string[]> => {
  try {
    if (!reservationId) {
      console.warn("No reservation ID provided");
      return [];
    }

    // Reference to the checkin folder for this reservation
    const storageRef = ref(storage, `checkin/${reservationId}`);

    // List all files in the folder
    const result = await listAll(storageRef);

    if (result.items.length === 0) {
      return [];
    }

    // Get download URLs for all images
    const urlPromises = result.items.map((imageRef) =>
      getDownloadURL(imageRef)
    );
    const urls = await Promise.all(urlPromises);

    return urls;
  } catch (error) {
    console.error(
      `Error fetching check-in images for reservation ${reservationId}:`,
      error
    );
    return [];
  }
};
