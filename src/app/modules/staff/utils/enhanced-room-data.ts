"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { SignJWT } from "jose";
import { sendStaffAssignmentRequest } from "./whatsapp-staff-manager";

interface StaffMember {
  name: string;
  phone: string;
  notificationToken: string;
  orders: string[];
}

function generateOrderId(restaurantCode: string, roomNo: string) {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const orderId = `${restaurantCode}:R-${roomNo}:${randomNumber}`;
  return orderId;
}

export async function getOnlineConcierge() {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "info");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document not found");
      return false;
    }

    const info = docSnap.data().staff;

    if (!info) {
      console.error("Invalid info object or staff list.");
      return false;
    }

    const onlineStaff = info
      .filter(
        (staffMember: any) =>
          staffMember.status === "online" && staffMember.role === "concierge"
      )
      .map((staffMember: any) => ({
        name: staffMember.name,
        phone: staffMember.phone,
        notificationToken: staffMember.notificationToken,
        orders: staffMember.orders,
      }));

    const assignedStaff = assignAttendantSequentially(onlineStaff);
    return assignedStaff;
  } catch (error) {
    console.error("Error setting up real-time listener: ", error);
    return false;
  }
}

function assignAttendantSequentially(
  availableStaff: StaffMember[]
): StaffMember | null {
  if (availableStaff.length === 0) return null;

  // Sort staff by number of current orders (ascending)
  const sortedStaff = [...availableStaff].sort(
    (a, b) => a.orders.length - b.orders.length
  );

  // Return the staff with the least number of orders
  return sortedStaff[0];
}

export async function updateOrdersForAttendant(
  attendantName: string,
  orderId: string
) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "info");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document not found");
      return;
    }

    const staff = docSnap.data().staff;

    if (!staff) {
      console.error("Invalid staff data");
      return;
    }

    // Find the new attendant by name
    const newAttendantIndex = staff.findIndex(
      (staffMember: any) =>
        staffMember.name === attendantName && staffMember.role === "concierge"
    );

    if (newAttendantIndex === -1) {
      console.error("New Attendant not found");
      return;
    }

    // Find the previous attendant who had this order
    const previousAttendantIndex = staff.findIndex(
      (staffMember: any) =>
        staffMember.role === "concierge" &&
        staffMember.orders?.includes(orderId)
    );

    // Modify the staff array
    if (newAttendantIndex !== -1) {
      // Add the orderId to the new attendant's orders
      staff[newAttendantIndex].orders = staff[newAttendantIndex].orders || [];
      staff[newAttendantIndex].orders.push(orderId);
    }

    // Remove the orderId from the previous attendant's orders if found
    if (
      previousAttendantIndex !== -1 &&
      previousAttendantIndex !== newAttendantIndex
    ) {
      staff[previousAttendantIndex].orders = staff[
        previousAttendantIndex
      ].orders.filter((id: string) => id !== orderId);
    }

    // Update the document with the modified staff array
    await updateDoc(docRef, {
      staff: staff,
    });

    console.log("Order attendant updated successfully");
  } catch (error) {
    console.error("Error updating orders: ", error);
  }
}

export async function removeRoomByNumber(roomNo: string, roomType: string) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  const docRef = doc(db, user, "hotel");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const tableDetails = docSnap.data().live.roomsData.roomDetail;

    // Check if the given roomType exists
    if (!tableDetails[roomType]) {
      console.error(`Room type "${roomType}" does not exist.`);
      return false;
    }

    // Filter out the room with the specified roomNo in the specified roomType
    const updatedRoomTypeArray = tableDetails[roomType].filter(
      (room: any) => room.roomNo !== roomNo
    );

    // Update the tableDetails with the filtered array for the specified roomType
    const updatedTableDetails = {
      ...tableDetails,
      [roomType]: updatedRoomTypeArray,
    };

    // Save the updated data back to Firestore
    await updateDoc(docRef, {
      "live.roomsData.roomDetail": updatedTableDetails,
    });

    console.log(`Room ${roomNo} in "${roomType}" has been removed.`);
    return true;
  } else {
    console.error("Document does not exist.");
    return false;
  }
}

async function shortenURL(
  email: string,
  roomNo: string,
  phone: string,
  tag: string,
  gstPercentage: string
) {
  const encodedSecretKey = new TextEncoder().encode("Vikas@1234");
  const payload = {
    email: email,
    roomNo: roomNo,
    phone: phone,
    tag: tag,
    tax: { gstPercentage: gstPercentage },
  };
  const newToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(encodedSecretKey);
  const longUrl = `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CONCIERGE}${newToken}`;

  const response = await fetch(
    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
  );
  const shortUrl = await response.text();

  console.log(shortUrl);
  return shortUrl;
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  name: string,
  variables: string[]
) {
  try {
    console.log("phoneNumber", phoneNumber, name, variables);
    const formattedPhone = phoneNumber.replace(/\D/g, "");

    const response = await fetch(
      `https://graph.facebook.com/v22.0/616505061545755/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: "booking1",
            language: { code: "en_US" },
            components: [
              {
                type: "header",
                parameters: [{ type: "text", text: name }],
              },
              {
                type: "body",
                parameters: variables.map((value) => ({
                  type: "text",
                  text: String(value),
                })),
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();
    console.log("WhatsApp API Response:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to send message");
    }

    return { success: true, message: "Message sent successfully!", data };
  } catch (error: any) {
    console.error("WhatsApp API Error:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Enhanced saveRoomData with WhatsApp staff notifications
 */
export async function saveRoomDataWithWhatsApp(roomInfo: any) {
  try {
    const session = await auth();
    const user = session?.user?.email;

    if (!user) {
      console.error("User email is undefined");
      return false;
    }

    const _bookingId = generateOrderId("BOK", roomInfo.roomNo);
    const _attendant = await getOnlineConcierge();

    const _roomInfo = {
      bookingDetails: {
        customer: {
          name: roomInfo.name,
          email: roomInfo.email,
          phone: roomInfo.phone,
          address: roomInfo.address || "",
          notificationToken: roomInfo.notificationToken || "",
        },
        location: roomInfo.roomNo,
        roomType: roomInfo.roomType,
        aggregator: "Walk-In",
        aggregatorLogo: "",
        bookingId: _bookingId,
        status: "occupied",
        attendant: _attendant ? _attendant.name : "Unassigned",
        attendantToken: _attendant ? _attendant.notificationToken : "",
        bookingDate: new Date().toISOString(),
        checkIn: roomInfo.checkIn,
        checkOut: roomInfo.checkOut,
        noOfGuests: roomInfo.numberOfGuests,
        noOfRoom: roomInfo.numberOfRooms,
        inclusions: roomInfo.inclusions || "",
        nights: roomInfo.nights,
        specialRequirements: roomInfo.specialRequirements || "",
        payment: {
          paymentStatus: "paid",
          mode: roomInfo.paymentMode,
          paymentId: roomInfo.paymentId,
          timeOfTransaction: new Date().toISOString(),
          price: roomInfo.price,
          priceAfterDiscount: roomInfo.priceAfterDiscount || "",
          paymentType: "single",
          subtotal: roomInfo.price,
          gst: {
            gstAmount: roomInfo.gstAmount || "",
            gstPercentage: roomInfo.gstPercentage || "",
            cgstAmount: roomInfo.cgstAmount || "",
            cgstPercentage: roomInfo.cgstPercentage || "",
            sgstAmount: roomInfo.sgstAmount || "",
            sgstPercentage: roomInfo.sgstPercentage || "",
          },
          discount: {
            type: roomInfo.discountType || "",
            amount: roomInfo.discountAmount || "",
            code: roomInfo.discountCode || "",
          },
        },
      },
      diningDetails: {},
      servicesUsed: [],
      issuesReported: {},
      transctions: [
        {
          location: roomInfo.roomNo,
          against: _bookingId,
          attendant: _attendant ? _attendant.name : "Unassigned",
          bookingId: _bookingId,
          payment: {
            paymentStatus: "paid",
            mode: roomInfo.paymentMode,
            paymentId: roomInfo.paymentId,
            timeOfTransaction: new Date().toISOString(),
            price: roomInfo.price,
            subtotal: roomInfo.price,
            priceAfterDiscount: roomInfo.priceAfterDiscount || "",
            gst: {
              gstAmount: roomInfo.gstAmount || "",
              gstPercentage: roomInfo.gstPercentage || "",
              cgstAmount: roomInfo.cgstAmount || "",
              cgstPercentage: roomInfo.cgstPercentage || "",
              sgstAmount: roomInfo.sgstAmount || "",
              sgstPercentage: roomInfo.sgstPercentage || "",
            },
            discount: {
              type: roomInfo.discountType || "",
              amount: roomInfo.discountAmount || "",
              code: roomInfo.discountCode || "",
            },
          },
        },
      ],
    };

    const sanitizedFormat = JSON.parse(
      JSON.stringify(_roomInfo, (key, value) =>
        value === undefined ? null : value
      )
    );

    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data().live.rooms;
      const updatedRooms = [sanitizedFormat, ...data];

      await updateDoc(docRef, {
        "live.rooms": updatedRooms,
      });

      if (_attendant) {
        await updateOrdersForAttendant(_attendant.name, _bookingId);
        await removeRoomByNumber(roomInfo.roomNo, roomInfo.roomType);

        // Send WhatsApp message to guest
        const shortUrl = await shortenURL(
          user,
          roomInfo.roomNo,
          roomInfo.phone,
          "concierge",
          "18"
        );

        await sendWhatsAppMessage(`91${roomInfo.phone}`, roomInfo.name, [
          _bookingId,
          roomInfo.roomNo,
          new Date(roomInfo.checkIn).toLocaleDateString(),
          new Date(roomInfo.checkOut).toLocaleDateString(),
          roomInfo.nights,
          roomInfo.price,
          roomInfo.price,
          "0",
          "123-456-7890",
          "987-654-3210",
          shortUrl,
        ]);

        // Send WhatsApp assignment request to staff
        await sendStaffAssignmentRequest(
          _attendant.phone,
          _bookingId,
          roomInfo.name,
          roomInfo.roomNo,
          "room"
        );
      }

      console.log("Room data updated successfully with WhatsApp notifications");
      return { success: true, data: _attendant };
    } else {
      console.error("Document does not exist");
      return { success: false, data: null };
    }
  } catch (error) {
    console.error("Error while saving room data:", error);
    return { success: false, data: null };
  }
}
