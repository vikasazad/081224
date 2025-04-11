"use client";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/config/db/firebase";
export function get7daysDataFromAllLive(
  email: string,
  subCollection: string,
  callback: (data: any) => void
) {
  const docRef = doc(db, email, subCollection);

  try {
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(false);
        return;
      }

      const data = docSnap.data();
      const today: any = new Date();
      const start: any = new Date(today.getFullYear(), 0, 0);
      const diff = today - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const currentDayOfYear = Math.floor(diff / oneDay);

      const result: any = {
        days: [],
      };

      // Loop through all types (rooms, food, services, issues)
      for (const type in data) {
        const categories = data[type]?.categories || {};

        // Create a result entry for each type (rooms, food, etc.)
        result[type] = {};

        for (const categoryName in categories) {
          const categoryData = categories[categoryName];
          const totalEarnings = new Array(7).fill(0); // Initialize array for last 7 days of earnings
          const totalBookings = new Array(7).fill(0); // Initialize array for last 7 days of bookings

          for (let i = 0; i < 7; i++) {
            const day = currentDayOfYear - i;
            if (categoryData.days?.[day]?.totalEarnings) {
              totalEarnings[6 - i] = categoryData.days[day].totalEarnings;
              totalBookings[6 - i] = categoryData.days[day].totalBookings;
              // Track the days globally for all categories
              if (!result.days.includes(day)) {
                result.days.unshift(day);
              }
            }
          }

          // Store the earnings for each category under the respective type
          result[type][categoryName] = totalEarnings;
          result[type][`${categoryName} Bookings`] = totalBookings;
        }
      }

      callback(result);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up real-time listener:", error);
    callback(false);
    throw error;
  }
}

export function getLiveDataRealtime(
  email: string,
  callback: (data: any) => void
) {
  const docRefHotel = doc(db, email, "hotel");
  const docRefRestaurant = doc(db, email, "restaurant");

  try {
    const unsubscribeHotel = onSnapshot(docRefHotel, (docSnapHotel) => {
      const unsubscribeRestaurant = onSnapshot(
        docRefRestaurant,
        (docSnapRestaurant) => {
          const result: any = {};

          if (docSnapHotel.exists()) {
            result.hotel = docSnapHotel.data()?.live || null;
          }

          if (docSnapRestaurant.exists()) {
            result.restaurant = docSnapRestaurant.data()?.live || null;
          }

          if (
            Object.keys(result).length === 0 ||
            (result.hotel === null && result.restaurant === null)
          ) {
            callback(false);
            return;
          }

          callback(result);
        }
      );

      return () => {
        unsubscribeHotel();
        unsubscribeRestaurant();
      };
    });

    return unsubscribeHotel;
  } catch (error) {
    console.error("Error setting up real-time listener:", error);
    callback(false);
    throw error;
  }
}

export function setStatsRealtime(
  email: string,
  callback: (error?: any) => void
) {
  const docRefHotel = doc(db, email, "hotel");
  const docRefRestaurant = doc(db, email, "restaurant");
  const docRefInfo = doc(db, email, "info");

  try {
    const unsubscribe = onSnapshot(docRefInfo, async (docSnapInfo) => {
      const [docSnapHotel, docSnapRestaurant] = await Promise.all([
        getDoc(docRefHotel),
        getDoc(docRefRestaurant),
      ]);

      // Update hotel stats
      if (docSnapHotel.exists()) {
        const data = docSnapHotel.data().live?.roomsData?.roomDetail;
        const _booked = docSnapHotel.data().live?.rooms?.length;
        let _availableR = 0;
        Object.values(data).forEach((el: any) => {
          _availableR = _availableR + el.length;
        });

        await updateDoc(docRefHotel, {
          "live.roomsData.stats.available": _availableR,
          "live.roomsData.stats.booked": _booked,
        });
      }

      // Update restaurant stats
      if (docSnapRestaurant.exists()) {
        const data = docSnapRestaurant.data().live.tablesData.tableDetails;
        const _booked = docSnapRestaurant.data().live?.tables?.length || 0;
        let _availableH = 0;
        Object.values(data).forEach((el: any) => {
          _availableH = _availableH + el.length;
        });

        await updateDoc(docRefRestaurant, {
          "live.tablesData.stats.available": _availableH,
          "live.tablesData.stats.booked": _booked,
        });
      }

      // Update staff stats
      if (docSnapInfo.exists()) {
        const data = docSnapInfo.data().staff;
        let online = 0,
          offline = 0;
        data.forEach((el: any) => {
          if (el.status === "online") {
            online = online + 1;
          } else {
            offline = offline + 1;
          }
        });

        await updateDoc(docRefHotel, {
          "live.roomsData.staff.online": online,
          "live.roomsData.staff.offline": offline,
        });
      }

      callback();
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up real-time listener:", error);
    callback(error);
    throw error;
  }
}
