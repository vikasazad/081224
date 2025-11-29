import * as admin from "firebase-admin";
import { ReceptionistMember, ReceptionistToken } from "../types";
import { sendWhatsAppTextMessage } from "./whatsapp.service";

const db = admin.firestore();

/**
 * Get receptionist tokens for notifications
 * @param {string} businessEmail - The business email identifier
 * @return {Promise<ReceptionistToken[]>} Array of receptionist tokens
 */
export async function getReceptionistTokens(
  businessEmail: string
): Promise<ReceptionistToken[]> {
  try {
    const docRef = db.doc(`${businessEmail}/info`);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return [];
    }

    const data = docSnap.data();
    const staff = (data?.staff || []) as ReceptionistMember[];

    const receptionists = staff.filter(
      (member: ReceptionistMember) =>
        member.role === "receptionist" &&
        member.notificationToken &&
        member.contact
    );

    return receptionists.map((r: ReceptionistMember) => ({
      token: r.notificationToken as string,
      phoneNumber: r.contact as string,
    }));
  } catch (error) {
    console.error("Error getting receptionist tokens:", error);
    return [];
  }
}

/**
 * Send FCM notification
 * @param {string} token - The FCM token
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 */
export async function sendFCMNotification(
  token: string,
  title: string,
  message: string
): Promise<void> {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body: message,
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error sending FCM notification:", error);
  }
}

/**
 * Notify receptionists via FCM and WhatsApp
 * @param {string} businessEmail - The business email identifier
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} apiKey - The WhatsApp API key
 */
export async function notifyReceptionists(
  businessEmail: string,
  title: string,
  message: string,
  apiKey: string
): Promise<void> {
  try {
    const tokens = await getReceptionistTokens(businessEmail);

    if (tokens.length === 0) {
      return;
    }

    for (const token of tokens) {
      // Send FCM notification
      await sendFCMNotification(token.token, title, message);

      // Send WhatsApp
      await sendWhatsAppTextMessage(token.phoneNumber, message, apiKey);
    }
  } catch (error) {
    console.error("Error notifying receptionists:", error);
  }
}
