"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc } from "firebase/firestore";
export async function getTableData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "restaurant");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().tables;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function getMenuData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "restaurant");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log(docSnap.data().data);
      return docSnap.data().menu;
    } else {
      // Handle the case when the document does not exist
      return null;
    }
  } catch {
    return false;
  }
}
