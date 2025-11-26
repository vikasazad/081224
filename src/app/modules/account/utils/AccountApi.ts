"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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

export async function saveStaffData(data: any) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "info");
    await updateDoc(docRef, {
      staff: data,
    });
    return true;
  } catch (error) {
    console.error("Error saving staff data:", error);
    return false;
  }
}

export async function saveSettingsData(data: any) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "info");
    await updateDoc(docRef, {
      "business.feedbackWindow": data.feedbackWindowTiming,
      "business.whatsappTimeout": data.whatsappTimeout,
      "business.kitchenTimerConfig": data.kitchenTimerConfig,
    });
    return true;
  } catch (error) {
    console.error("Error saving settings data:", error);
    return false;
  }
}
