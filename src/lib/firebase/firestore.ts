"use server";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/db/firebase";
import { NewUser } from "@/types/auth/typesAuth";
import Razorpay from "razorpay";
// import { auth } from "@/auth";

export async function registerUser(email: string, newUser: NewUser) {
  try {
    await setDoc(doc(db, email, "info"), {
      //setdoc is to create if not or if exists then overwrite // to add new sub-collection this function can be used
      ...newUser,
    });
    return "User registered Successfully";
  } catch (error) {
    console.log("eror");
    console.log(error);
    return false;
  }
}
export async function add(email: string, newUser: any, field: string) {
  try {
    await setDoc(doc(db, email, field), {
      //setdoc is to create if not or if exists then overwrite // to add new sub-collection this function can be used
      ...newUser,
    });
    return "User registered Successfully";
  } catch (error) {
    console.log("eror");
    console.log(error);
    return false;
  }
}

export async function update(email: string, newUser: any, field: string) {
  try {
    const docRef = doc(db, email, field);
    await updateDoc(docRef, {
      menu: newUser,
    });
    return "User registered Successfully";
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function findIfStaffLogin(
  primaryEmail: string,
  staffEmail: string
) {
  try {
    const docRef = doc(db, primaryEmail, "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const staffArr = docSnap.data().staff;
      const isUserExists = staffArr.findIndex(
        (val: any) => val.email === staffEmail
      );
      if (staffArr[isUserExists]) {
        return staffArr[isUserExists];
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function findUserByEmail(email: string) {
  try {
    const docRef = doc(db, email, "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function get7daysDataFromAll(
  email: string,
  subCollection: string
) {
  try {
    const docRef = doc(db, email, subCollection);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const today: any = new Date();
      const start: any = new Date(today.getFullYear(), 0, 0);
      const diff = today - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const currentDayOfYear = Math.floor(diff / oneDay);

      const result: any = {
        days: [], // Track the days for all categories
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

      return result;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching 7 days data from all categories:", error);
    return false;
  }
}

export async function get7daysData(
  email: string,
  subCollection: string,
  type: string
) {
  try {
    const docRef = doc(db, email, subCollection);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const today: any = new Date();
      const start: any = new Date(today.getFullYear(), 0, 0);
      const diff = today - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const currentDayOfYear = Math.floor(diff / oneDay);
      const result: any = {
        [type]: {
          days: [],
        },
      };
      const categories = data[type]?.categories || {};
      for (const categoryName in categories) {
        const categoryData = categories[categoryName];
        const totalEarnings = new Array(7).fill(0);
        const totalBookings = new Array(7).fill(0); // Initialize array for last 7 days of earnings

        for (let i = 0; i < 7; i++) {
          const day = currentDayOfYear - i;
          if (categoryData.days?.[day]?.totalEarnings) {
            totalEarnings[6 - i] = categoryData.days[day].totalEarnings;
            totalBookings[6 - i] = categoryData.days[day].totalBookings;

            if (!result[type].days.includes(day)) {
              result[type].days.unshift(day);
            }
          }
        }

        result[type][categoryName] = totalEarnings;
        result[type][`${categoryName} Bookings`] = totalBookings;
      }

      return result;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching total earnings data:", error);
    return false;
  }
}

export async function getLiveData(email: string) {
  try {
    const docRefHotel = doc(db, email, "hotel");
    const docRefRestaurant = doc(db, email, "restaurant");

    const [docSnapHotel, docSnapRestaurant] = await Promise.all([
      getDoc(docRefHotel),
      getDoc(docRefRestaurant),
    ]);

    const result: any = {};

    if (docSnapHotel.exists()) {
      result.hotel = docSnapHotel.data()?.live || null;
    }

    if (docSnapRestaurant.exists()) {
      result.restaurant = docSnapRestaurant.data()?.live || null;
    }

    // Return false if neither document exists or if both 'live' fields are null
    if (
      Object.keys(result).length === 0 ||
      (result.hotel === null && result.restaurant === null)
    ) {
      return false;
    }

    return result;
  } catch (error) {
    console.error("Error in getLiveData:", error);
    return false;
  }
}

export async function setStats(email: string) {
  console.log("h1");
  try {
    const docRefHotel = doc(db, email, "hotel");
    const docRefRestaurant = doc(db, email, "restaurant");
    const docRefInfo = doc(db, email, "info");

    const [docSnapHotel, docSnapRestaurant, docSnapInfo] = await Promise.all([
      getDoc(docRefHotel),
      getDoc(docRefRestaurant),
      getDoc(docRefInfo),
    ]);

    if (docSnapHotel.exists()) {
      const data = docSnapHotel.data().live?.roomsData?.roomDetail;
      const _booked = docSnapHotel.data().live?.rooms?.length;
      // console.log(Object.values(data));
      let _availableR: number = 0;
      Object.values(data).forEach((el: any) => {
        _availableR = _availableR + el.length;
      });
      // console.log("h2", _availableR, _booked);

      await updateDoc(docRefHotel, {
        "live.roomsData.stats.available": _availableR,
        "live.roomsData.stats.booked": _booked,
      });
    }
    if (docSnapRestaurant.exists()) {
      const data = docSnapRestaurant.data().live.tablesData.tableDetails;
      const _booked = docSnapRestaurant.data().live?.tables?.length || 0;
      let _availableH: number = 0;
      Object.values(data).forEach((el: any) => {
        _availableH = _availableH + el.length;
      });
      // console.log("h3", _availableH, _booked);
      await updateDoc(docRefRestaurant, {
        "live.tablesData.stats.available": _availableH,
        "live.tablesData.stats.booked": _booked,
      });
    }
    if (docSnapInfo.exists()) {
      const data = docSnapInfo.data().staff;
      let online: number = 0,
        offline: number = 0;
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
  } catch (error) {
    console.log(error);
  }
}

export async function getDataFromVikumar() {
  try {
    // Get data from vikumar's hotel document
    const sourceDocRef = doc(db, "vikumar.azad@gmail.com", "socialMedia");
    const sourceDocSnap = await getDoc(sourceDocRef);

    if (sourceDocSnap.exists()) {
      // Create a reference to the forTesting document
      const targetDocRef = doc(db, "forTesting", "socialMedia");

      // Copy the data to forTesting
      await setDoc(targetDocRef, sourceDocSnap.data());

      return sourceDocSnap.data();
    } else {
      console.error("Source document does not exist!");
      return false;
    }
  } catch (error) {
    console.error("Error copying document:", error);
    return false;
  }
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  variables: string[]
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    const formattedPhone = phoneNumber.replace(/\D/g, "");

    const response = await fetch(
      `https://graph.facebook.com/v22.0/616505061545755/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: "booking",
            language: { code: "en_US" },
            components: [
              {
                type: "header",
                parameters: [{ type: "text", text: "Pawan Rai" }], // Reservation number as header
              },
              {
                type: "body",
                parameters: variables.map((value) => ({
                  type: "text",
                  text: value,
                })),
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();
    console.log("WhatsApp API Response:", data); // Add logging for debugging

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to send message");
    }

    return { success: true, message: "Message sent successfully!", data };
  } catch (error: any) {
    console.error("WhatsApp API Error:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
}

export async function createPaymentLink() {
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY as string,
    key_secret: process.env.NEXT_PUBLIC_RAZORPAY_API_SECRET as string,
  });
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: 1000,
      currency: "INR",
      accept_partial: true,
      first_min_partial_amount: 100,
      expire_by: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60 + 15 * 60,
      reference_id: "8ejsh89",
      description: "Payment for policy no #23456",
      customer: {
        name: "Gaurav Kumar",
        contact: "+919000090000",
        email: "gaurav.kumar@example.com",
      },
    });

    return paymentLink;
  } catch (error) {
    console.log(error);
  }
}
