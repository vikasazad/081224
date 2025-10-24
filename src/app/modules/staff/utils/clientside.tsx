"use client";

import { db } from "@/config/db/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function handleRoomStaffInformation(
  callback: (result: any | null) => void
) {
  const docRefHotel = doc(db, "vikumar.azad@gmail.com", "hotel");
  const docRefRestaurant = doc(db, "vikumar.azad@gmail.com", "restaurant");
  const docRefBusinessInfo = doc(db, "vikumar.azad@gmail.com", "info");

  // Create unsubscribe functions for both listeners
  const unsubscribeHotel = onSnapshot(
    docRefHotel,
    (docSnapHotel) => {
      const unsubscribeRestaurant = onSnapshot(
        docRefRestaurant,
        (docSnapRestaurant) => {
          const unsubscribeInfo = onSnapshot(
            docRefBusinessInfo,
            (docSnapInfo) => {
              try {
                const result: any = {
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
                };

                if (docSnapInfo.exists()) {
                  result.businessInfo = docSnapInfo.data().business;
                }

                if (docSnapHotel.exists()) {
                  const reservation = docSnapHotel.data().reservation;
                  const live = docSnapHotel.data().live;
                  result.deliveryOverview = docSnapHotel.data().delivery;
                  result.takeawayOverview = docSnapHotel.data().takeaway;
                  result.hotelOverview.todayCheckIn = reservation;
                  result.hotelOverview.ongoing = live.rooms;
                  result.hotelOverview.status = live.roomsData.status;

                  live.rooms?.forEach((item: any) => {
                    if (item?.bookingDetails?.checkOut) {
                      const checkOutTime = new Date(
                        item.bookingDetails.checkOut
                      );
                      if (
                        checkOutTime.toDateString() ===
                        new Date().toDateString()
                      ) {
                        result.hotelOverview.todayCheckOut.push(item);
                      }
                    }
                  });

                  Object.keys(live.roomsData.roomDetail)?.forEach(
                    (roomType) => {
                      live.roomsData.roomDetail[roomType]?.forEach(
                        (item: any) => {
                          if (item.status === "available") {
                            result.hotelOverview.vacant.push(item);
                          }
                          if (item.status === "fixing required") {
                            result.hotelOverview.maintenance.push(item);
                          }
                        }
                      );
                    }
                  );
                }

                if (docSnapRestaurant.exists()) {
                  const reservation = docSnapRestaurant.data().reservation;
                  const live = docSnapRestaurant.data().live;
                  result.restaurantOverview.reserved = reservation;
                  result.restaurantOverview.status = live.tablesData.status;

                  live.tables?.forEach((item: any) => {
                    if (item.diningDetails?.status === "occupied") {
                      result.restaurantOverview.occupied.push(item);
                    }
                  });

                  Object.keys(live.tablesData.tableDetails)?.forEach(
                    (tableType) => {
                      live.tablesData.tableDetails[tableType]?.forEach(
                        (item: any) => {
                          if (item.status === "available") {
                            result.restaurantOverview.available.push(item);
                          }
                          if (item.status === "cleaning") {
                            result.restaurantOverview.cleaning.push(item);
                          }
                        }
                      );
                    }
                  );
                }

                if (
                  Object.keys(result).length === 0 ||
                  (result.hotelOverview === null &&
                    result.restaurantOverview === null)
                ) {
                  console.log("No data available");
                  callback(null);
                } else {
                  callback(result);
                }
              } catch (error) {
                console.error("Error processing Firestore data:", error);
                callback(null);
              }

              return () => unsubscribeInfo();
            },
            (error) => {
              console.error("Error in info snapshot listener:", error);
              callback(null);
            }
          );

          // Unsubscribe from the restaurant snapshot listener
          return () => {
            unsubscribeRestaurant();
            unsubscribeInfo();
          };
        },
        (error) => {
          console.error("Error in restaurant snapshot listener:", error);
          callback(null);
        }
      );

      // Return a function to unsubscribe from both listeners
      return () => {
        unsubscribeHotel();
        unsubscribeRestaurant();
      };
    },
    (error) => {
      console.error("Error in hotel snapshot listener:", error);
      callback(null);
    }
  );

  // Return a function to unsubscribe from both listeners
  return () => {
    unsubscribeHotel();
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
