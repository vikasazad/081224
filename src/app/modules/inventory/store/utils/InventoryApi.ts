"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getInventoryData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "inventory");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { inventory: docSnap.data() };
  } else {
    return { inventory: null };
  }
}
