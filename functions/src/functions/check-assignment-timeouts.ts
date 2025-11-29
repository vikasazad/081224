import * as admin from "firebase-admin";
import { DEFAULT_TIMEOUT_MINUTES, MAX_ASSIGNMENTS_PER_BATCH } from "../config";
import { sendWhatsAppTextMessage } from "../services/whatsapp.service";
import { markStaffInactive } from "../services/staff.service";
import { notifyReceptionists } from "../services/notification.service";
import { Assignment } from "../types";

const db = admin.firestore();

/**
 * Check and process assignment timeouts
 * @param {string} apiKey - WhatsApp API key
 */
export async function checkAssignmentTimeouts(apiKey: string): Promise<void> {
  try {
    console.log("Starting assignment timeout check...");

    const businessEmail = "vikumar.azad@gmail.com";

    // Get business timeout setting
    const businessInfoRef = db.doc(`${businessEmail}/info`);
    const businessInfoSnap = await businessInfoRef.get();

    if (!businessInfoSnap.exists) {
      return;
    }

    const businessData = businessInfoSnap.data();
    const timeoutMinutes =
      businessData?.business?.whatsappTimeout || DEFAULT_TIMEOUT_MINUTES;

    // Calculate cutoff timestamp
    const now = Date.now();
    const cutoffTime = now - timeoutMinutes * 60 * 1000;

    // Query ONLY pending assignments older than cutoff
    const assignmentsQuery = db
      .collection(`${businessEmail}/webhook/assignments`)
      .where("status", "==", "pending")
      .where("timestamp", "<=", cutoffTime)
      .limit(MAX_ASSIGNMENTS_PER_BATCH);

    const snapshot = await assignmentsQuery.get();

    if (snapshot.empty) {
      return;
    }

    // Use batch write for efficiency (supports up to 500 operations)
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "timeout",
        timedOutAt: now,
      });
    });

    await batch.commit();

    // Process each timed-out assignment
    for (const doc of snapshot.docs) {
      const assignment = doc.data() as Assignment;
      const orderId = assignment.orderId || doc.id;
      const staffContact = assignment.staffContact;
      const customerName = assignment.customerName || "Unknown Customer";
      const roomNumber = assignment.roomNumber || "N/A";

      if (!staffContact) {
        continue;
      }

      // 1. Mark staff as inactive
      await markStaffInactive(staffContact, businessEmail);

      // 2. Send WhatsApp message to staff
      const timeoutMessage =
        "Assignment request timed out. You have been marked as " +
        "inactive. Send 'active' to become available for new assignments.";
      await sendWhatsAppTextMessage(staffContact, timeoutMessage, apiKey);

      // 3. Notify receptionists
      const receptionistMessage =
        `Assignment for order ${orderId} (${customerName}, ` +
        `Room ${roomNumber}) has timed out. ` +
        `Staff ${staffContact} marked as inactive. ` +
        "Please reassign manually.";
      await notifyReceptionists(
        businessEmail,
        "Assignment Timeout",
        receptionistMessage,
        apiKey
      );
    }

    console.log(
      `Completed timeout processing for ${snapshot.size} assignment(s)`
    );
  } catch (error) {
    console.error("Error checking assignment timeouts:", error);
  }
}
