import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Simple hello world callable function
export const helloWorld = functions.https.onCall((request) => {
  const name = request.data.name || "World";
  return {
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  };
});

export const checkAssignmentTimeouts = onSchedule(
  "every 1 minutes",
  async () => {
    try {
      console.log("Starting assignment timeout check...");

      const businessEmail = "vikumar.azad@gmail.com";

      // Get business timeout setting
      const businessInfoRef = db.doc(`${businessEmail}/info`);
      const businessInfoSnap = await businessInfoRef.get();

      if (!businessInfoSnap.exists) {
        console.log("No business info found");
        return;
      }

      const businessData = businessInfoSnap.data();
      const timeoutMinutes = businessData?.business?.whatsappTimeout || 10;

      console.log(`Business timeout: ${timeoutMinutes} minutes`);

      // Calculate cutoff timestamp
      const now = Date.now();
      const cutoffTime = now - timeoutMinutes * 60 * 1000;

      // Query ONLY pending assignments older than cutoff
      const assignmentsQuery = db
        .collection(`${businessEmail}/webhook/assignments`)
        .where("status", "==", "pending")
        .where("timestamp", "<=", cutoffTime)
        .limit(500); // Process up to 500 in one batch

      const snapshot = await assignmentsQuery.get();

      if (snapshot.empty) {
        console.log("No timed-out assignments found");
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
      console.log(`Marked ${snapshot.size} assignment(s) as timed out`);
    } catch (error) {
      console.error("Error checking assignment timeouts:", error);
    }
  }
);
