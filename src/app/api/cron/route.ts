import { db } from "@/config/db/firebase";
import { doc, getDoc } from "firebase/firestore";
import { sendWhatsAppFlow } from "@/lib/flow/flow";
import { DateTime } from "luxon";

interface GuestData {
  phone: string;
  name: string;
  roomNo: string;
}

export async function GET() {
  try {
    const key = process.env.DB_KEY;
    const workEnv = process.env.WORK_ENV;

    // Create todayDate based on environment
    let todayDate: string;
    if (workEnv === "production") {
      // Production: Use hotel timezone (Asia/Kolkata) for consistent date handling
      todayDate = DateTime.now().setZone("Asia/Kolkata").toISODate() as string;
    } else {
      // Development: Keep current behavior (local timezone)
      todayDate = new Date().toISOString().split("T")[0];
    }

    if (!key) {
      return new Response("Not able to get the key", { status: 500 });
    }

    const docRef = doc(db, key, "hotel");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response("Not able to get the document", { status: 500 });
    }

    const guestData: GuestData[] = [];
    const rooms = docSnap.data()?.live?.rooms || [];

    rooms.forEach((room: any) => {
      // Check if room has required data
      const phoneNumber = room.bookingDetails?.customer?.phone;
      const guestName = room.bookingDetails?.customer?.name || "Guest";
      const roomNo = room.bookingDetails?.location || "Unknown";

      if (!phoneNumber) return;

      // Check if room has feedback array
      const feedbackArray = room.bookingDetails?.feedback;

      // If no feedback array, include the guest data
      if (
        !feedbackArray ||
        !Array.isArray(feedbackArray) ||
        feedbackArray.length === 0
      ) {
        guestData.push({
          phone: phoneNumber,
          name: guestName,
          roomNo: roomNo,
        });
        return;
      }

      // Check if there's any feedback for today's date
      const hasTodaysFeedback = feedbackArray.some((feedback: any) => {
        if (!feedback.time) return false;

        let feedbackDate: string;
        if (workEnv === "production") {
          // Production: Convert feedback time to Asia/Kolkata timezone
          feedbackDate = DateTime.fromJSDate(new Date(feedback.time))
            .setZone("Asia/Kolkata")
            .toISODate() as string;
        } else {
          // Development: Keep current behavior (UTC)
          feedbackDate = new Date(feedback.time).toISOString().split("T")[0];
        }

        return feedbackDate === todayDate;
      });

      // If no feedback for today, include the guest data
      if (!hasTodaysFeedback) {
        guestData.push({
          phone: phoneNumber,
          name: guestName,
          roomNo: roomNo,
        });
      }
    });

    // Only send messages in production environment
    let messageSentCount = 0;
    const messageResults: any[] = [];

    if (guestData.length > 0) {
      console.log(`Sending WhatsApp messages to ${guestData.length} guests`);

      for (const guest of guestData) {
        try {
          const messageSent = await sendWhatsAppFlow(
            `+91${guest.phone}`,
            guest.name,
            guest.roomNo
          );

          if (messageSent) {
            messageSentCount++;
          }

          messageResults.push({
            phone: guest.phone,
            name: guest.name,
            roomNo: guest.roomNo,
            sent: messageSent,
          });
        } catch (error) {
          console.error(`Failed to send message to ${guest.phone}:`, error);
          messageResults.push({
            phone: guest.phone,
            name: guest.name,
            roomNo: guest.roomNo,
            sent: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        environment: workEnv,
        guestData,
        count: guestData.length,
        date: todayDate,
        messagesEnabled: workEnv === "development",
        messagesSent: messageSentCount,
        messageResults: workEnv === "development" ? messageResults : [],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
