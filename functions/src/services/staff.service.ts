/**
 * Staff management service
 */

import * as admin from "firebase-admin";
import { StaffMember } from "../types";

const db = admin.firestore();

/**
 * Mark staff member as inactive
 * @param {string} phoneNumber - The staff member's phone number
 * @param {string} businessEmail - The business email identifier
 */
export async function markStaffInactive(
  phoneNumber: string,
  businessEmail: string
): Promise<void> {
  try {
    const docRef = db.doc(`${businessEmail}/info`);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return;
    }

    const data = docSnap.data();
    const staff = (data?.staff || []) as StaffMember[];

    const staffMember = staff.find(
      (m) => m.contact === phoneNumber && m.role === "concierge"
    );

    if (!staffMember) {
      return;
    }

    const updatedStaff = staff.map((member: StaffMember) => {
      if (member.contact === phoneNumber) {
        return {
          ...member,
          active: false,
          lastInactiveTime: new Date().toISOString(),
        };
      }
      return member;
    });

    await docRef.update({ staff: updatedStaff });
  } catch (error) {
    console.error(`Error marking staff ${phoneNumber} inactive:`, error);
  }
}
