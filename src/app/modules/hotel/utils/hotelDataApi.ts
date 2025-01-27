"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getHotelData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "hotel");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { rooms: docSnap.data().rooms, services: docSnap.data().services };
  } else {
    return { data: null, subCollection: "hotel" };
  }
}

export async function handleRoomInformation() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    // console.log("HERE", user);
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data: any = {
        overview: {
          todayCheckIn: [],
          ongoing: [],
          todayCheckOut: [],
          vacant: [],
          maintenance: [],
        },
      };
      const reservation = docSnap.data().reservation;
      const live = docSnap.data().live;
      const history = docSnap.data().history;
      data.overview.todayCheckIn = reservation;
      data.overview.ongoing = live.rooms;
      live.rooms.map((item: any) => {
        if (item.checkOut) {
          const checkOutTime = new Date(JSON.parse(item.checkOut));
          if (checkOutTime.toDateString() === new Date().toDateString()) {
            data.overview.todayCheckOut.push(item);
          }
        }
      });

      // live.roomsData.roomDetail.map((item: any) => {
      //   if (item.status === "available") {
      //     data.overview.vacant.push(item);
      //   }
      //   if (item.status === "fixing required") {
      //     data.overview.maintenance.push(item);
      //   }
      // });

      data.live = live;
      data.history = history;
      console.log(data);

      return data;
    } else {
      console.log("here");
      return false;
    }
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return false;
  }
}

export async function saveRoomInfo(roomData: any, roomType: string) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return {
      success: false,
      error: "Failed to update table information",
    };
  }

  try {
    const docRef = doc(db, user, "hotel");
    const room = roomData.roomNo.map((data: any) => {
      return {
        roomNo: data,
        status: "available",
        roomType: roomType,
        price: roomData.price,
        images: roomData.images,
        inclusions: roomData.amenities,
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
    });
    console.log("ROOMMMMMMMMMMM", room);
    await updateDoc(docRef, {
      [`rooms.${roomType}`]: roomData, // Fixed dynamic field
    });
    await updateDoc(docRef, {
      [`live.roomsData.roomDetail.${roomType}`]: room, // Fixed dynamic field
    });
  } catch {
    // console.error("ERROR setting offline data:", error);
    return {
      success: false,
      error: "Failed to update table information",
    };
  }
}

export async function getAvailableRooms() {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().live?.roomsData?.roomDetail;
    } else {
      console.log("here");
      return false;
    }
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return false;
  }
}

export async function saveRoomUpgrades(roomData: any) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const _roomData = [
    {
      typeName: "Room Upgrades",
      description: "You can upgrade into new room with minimal price",
      availableOptions: roomData,
    },
  ];
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      "services.categories.Room upgrades.roomupgrades": _roomData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
export async function saveWellnessServices(
  serviceData: any,
  serviceType: string
) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      [`services.categories.Wellness.${serviceType}`]: serviceData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
export async function saveRecreationalServices(
  serviceData: any,
  serviceType: string
) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      [`services.categories.Recreational.${serviceType}`]: serviceData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
export async function saveTransportationServices(
  serviceData: any,
  serviceType: string
) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      [`services.categories.Transportation.${serviceType}`]: serviceData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
export async function savePersonalShoppingServices(
  serviceData: any,
  serviceType: string
) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      [`services.categories.Personal Shopping.${serviceType}`]: serviceData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
export async function saveToursServices(serviceData: any, serviceType: string) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      [`services.categories.Tours.${serviceType}`]: serviceData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
export async function saveLaundryServices(
  serviceData: any,
  serviceType: string
) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    await updateDoc(docRef, {
      [`services.categories.Laundry.${serviceType}`]: serviceData, // Fixed dynamic field
    });
  } catch {
    return false;
  }
}
