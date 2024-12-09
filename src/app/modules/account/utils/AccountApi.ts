"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getManagementData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "info");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return { data: null };
  }
}
