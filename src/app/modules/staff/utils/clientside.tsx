"use client";

import { db } from "@/config/db/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function handleRoomStaffInformation(
  callback: (result: any | null) => void
) {
  const docRefHotel = doc(db, "vikumar.azad@gmail.com", "hotel");
  const docRefRestaurant = doc(db, "vikumar.azad@gmail.com", "restaurant");

  // Create unsubscribe functions for both listeners
  const unsubscribeHotel = onSnapshot(
    docRefHotel,
    (docSnapHotel) => {
      const unsubscribeRestaurant = onSnapshot(
        docRefRestaurant,
        (docSnapRestaurant) => {
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
            };

            if (docSnapHotel.exists()) {
              const reservation = docSnapHotel.data().reservation;
              const live = docSnapHotel.data().live;
              result.hotelOverview.todayCheckIn = reservation;
              result.hotelOverview.ongoing = live.rooms;
              result.hotelOverview.status = live.roomsData.status;

              live.rooms.forEach((item: any) => {
                if (item.checkOut) {
                  const checkOutTime = new Date(item.checkOut);
                  if (
                    checkOutTime.toDateString() === new Date().toDateString()
                  ) {
                    result.hotelOverview.todayCheckOut.push(item);
                  }
                }
              });

              live.roomsData.roomDetail.forEach((item: any) => {
                if (item.status === "available") {
                  result.hotelOverview.vacant.push(item);
                }
                if (item.status === "fixing required") {
                  result.hotelOverview.maintenance.push(item);
                }
              });
            }

            if (docSnapRestaurant.exists()) {
              const reservation = docSnapRestaurant.data().reservation;
              const live = docSnapRestaurant.data().live;
              result.restaurantOverview.reserved = reservation;
              result.restaurantOverview.status = live.tablesData.status;

              live.tables.forEach((item: any) => {
                if (item.diningDetails.status === "occupied") {
                  result.restaurantOverview.occupied.push(item);
                }
              });

              Object.keys(live.tablesData.tableDetails).forEach((tableType) => {
                live.tablesData.tableDetails[tableType].forEach((item: any) => {
                  if (item.status === "available") {
                    result.restaurantOverview.available.push(item);
                  }
                  if (item.status === "cleaning") {
                    result.restaurantOverview.cleaning.push(item);
                  }
                });
              });
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

          // Unsubscribe from the restaurant snapshot listener
          return () => unsubscribeRestaurant();
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
