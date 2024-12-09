"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc } from "firebase/firestore";

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

      live.roomsData.roomDetail.map((item: any) => {
        if (item.status === "available") {
          data.overview.vacant.push(item);
        }
        if (item.status === "fixing required") {
          data.overview.maintenance.push(item);
        }
      });

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
