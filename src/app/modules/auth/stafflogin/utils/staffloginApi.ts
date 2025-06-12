"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function saveToken(token: string) {
  try {
    const session: any = await auth();
    if (!session || !session.user) {
      return { success: false, error: "No session found" };
    }
    const userEmail = session.user.email;
    const userRole = session.user.role;
    if (!userEmail) {
      return { success: false, error: "User email is undefined" };
    }
    const docRef = doc(db, userEmail, "info");
    if (userRole === "admin") {
      try {
        await updateDoc(docRef, {
          "personalInfo.notificationToken": token,
        });
        return { success: true, message: "Admin token saved successfully" };
      } catch (error) {
        console.error("Error saving admin token:", error);
        return { success: false, error: "Failed to save admin token" };
      }
    } else if (
      userRole === "staff" ||
      userRole === "concierge" ||
      userRole === "attendant" ||
      userRole === "manager"
    ) {
      try {
        // Step 1: Retrieve the current staff array
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          return { success: false, error: "User document not found" };
        }
        const data = docSnap.data();
        const staff = data.staff || [];
        if (!Array.isArray(staff)) {
          return { success: false, error: "Invalid staff data structure" };
        }
        // Step 2: Find and update the specific staff member
        const staffEmail = session.user.staff?.email;
        if (!staffEmail) {
          return { success: false, error: "Staff email not found in session" };
        }
        const updatedStaff = staff.map((member: any) => {
          if (member.email === staffEmail) {
            return {
              ...member,
              notificationToken: token,
            };
          }
          return member;
        });
        // Check if staff member was found and updated
        const staffFound = updatedStaff.some(
          (member: any) =>
            member.email === staffEmail && member.notificationToken === token
        );
        if (!staffFound) {
          console.error("Staff member not found in staff array");
          return { success: false, error: "Staff member not found" };
        }
        // Step 3: Update the staff array in Firestore
        await updateDoc(docRef, {
          staff: updatedStaff,
        });
        return { success: true, message: "Staff token saved successfully" };
      } catch (error) {
        console.error("Error saving staff token:", error);
        return { success: false, error: "Failed to save staff token" };
      }
    } else {
      console.error("Invalid user role:", userRole);
      return { success: false, error: "Invalid user role" };
    }
  } catch (error) {
    console.error("Unexpected error in saveToken:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}
