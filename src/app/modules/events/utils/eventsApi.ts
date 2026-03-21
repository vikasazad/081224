"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc, arrayUnion,  } from "firebase/firestore";
import { EventBooking, EventSettings, StaffMember } from "./eventTypes";
import { generatePaymentLink } from "@/lib/razorpay";



export async function getEventMenuPackages() {
  try {
    const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return [];
  }

  // const user = 'vikumar.azad@gmail.com'
  const eventRef = doc(db, user, "info");
    const docSnap = await getDoc(eventRef);
    if (docSnap.exists()) {
      return docSnap.data().hotel?.events?.menu;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting event menu:", error);
    return null;
  }
}  
export async function saveEventMenuPackages(menuData: any) {
  try {
    const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return [];
  }

  // const user = 'vikumar.azad@gmail.com'
  const eventRef = doc(db, user, "info");
    await updateDoc(eventRef, {
      [`hotel.events.menu.${menuData?.pricePerPlate}.${menuData?.nature}`]: menuData,
    });
    return true;
  } catch (error) {
    console.error("Error saving event menu:", error);
    return false;
  }
}  




// ==================== SERVER ACTIONS ====================

// Get events in a date range
export async function getEventsInRange(startDate: string, endDate: string) {
  
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return null;
  }
  // const user = 'vikumar.azad@gmail.com'

  try {
    const docRef = doc(db, user, "events");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const allEvents = data.events || [];

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredEvents = allEvents.filter((event: EventBooking) => {
        const eventStartDate = new Date(event.startDate);
        return eventStartDate >= start && eventStartDate <= end;
      });

      return filteredEvents;
    }

    return [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

// Get all staff for dropdown
export async function getAllStaffForDropdown() {
  
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return [];
  }

  // const user = 'vikumar.azad@gmail.com'

  try {
    const docRef = doc(db, user, "info");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const staff = data.staff || [];

      return staff
        .filter((member: StaffMember) => member.active !== false && member.role === 'manager')
        .map((member: StaffMember) => ({
          name: member.name,
          contact: member.contact,
          role: member.role,
        }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}

// Generate event ID
// async function generateEventId(): Promise<string> {
//   const timestamp = Date.now().toString(36).toUpperCase();
//   const random = Math.random().toString(36).substring(2, 6).toUpperCase();
//   return `EVT-${timestamp}-${random}`;
// }

// Create a new event booking
export async function createEventBooking(
  eventData: any
) {
  
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return { success: false, error: "User not authenticated" };
  }
// const user = 'vikumar.azad@gmail.com'
  try {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
 
    const eventId = `EVT-${timestamp}-${random}`;
    // Generate referenceId for payment tracking
    const referenceId = `PAY_${Date.now()}`;

    const newEvent: EventBooking = {
      eventId,
      eventType: eventData.eventType,
      venue: eventData.venue,
      name: eventData.name,
      phone: eventData.phone,
      email: eventData.email,
      numberOfPeople: eventData.numberOfPeople,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      relationshipManager: eventData.relationshipManager,
      foodNature: eventData.foodNature,
      pricePerPlate: eventData.pricePerPlate,
      paymentType: eventData.paymentMode,
      menu: eventData.menu,
      createdAt: new Date().toISOString(),
      status: "pending",
      business: {
      name: eventData.businessInfo.businessName,
      phone: eventData.businessInfo.phone,
      website: eventData.businessInfo.website,
      },
      payment: {
      paymentStatus: "pending",
      mode: eventData.paymentMode,
      paymentId: "",
      referenceId: referenceId,
      timeOfTransaction: "",
      price: eventData.advanceAmount,
      priceAfterDiscount: "",
      paymentType: "single",
      subtotal: eventData.advanceAmount,
      totalPrice: eventData.totalAmount,
      gst: {
        gstAmount: 0,
        gstPercentage: 0,
        cgstAmount: 0,
        cgstPercentage: 0,
        sgstAmount: 0,
        sgstPercentage: 0,
      },
      discount: [
        {
          type: "",
          amount: 0,
          code: "",
          discount: 0,
        },
      ],
    },
    transctions: [
      {
        location: eventData.venue.name,
        against: eventId,
        attendant: "",
        bookingId: eventId,
        payment: {
          paymentStatus: "pending",
          mode: eventData.paymentMode,
          paymentId: "",
          referenceId: referenceId,
          timeOfTransaction: "",
          price: eventData.advanceAmount,
          priceAfterDiscount: "",
          paymentType: "single",
          subtotal: eventData.advanceAmount,
          totalPrice: eventData.totalAmount,
          gst: {
            gstAmount: 0,
            gstPercentage: 0,
            cgstAmount: 0,
            cgstPercentage: 0,
            sgstAmount: 0,
            sgstPercentage: 0,
          },
          discount: [
            {
              type: "",
              amount: 0,
              code: "",
              discount: 0,
            },
          ],
        },
      },
    ],
    };


    const formattedMenu = eventData.menu && Object.keys(eventData.menu).length > 0
      ? Object.entries(eventData.menu).map(
          ([categoryName, items]: any) =>
            `${categoryName}: ${items.map((item: any) => item.name).join(", ")}`
        ).join(" | ")
      : "No menu selected";

    
      const docRef = doc(db, user, "events");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
         await updateDoc(docRef, {
        events: arrayUnion(newEvent),
      });
       const paymentLink = await generatePaymentLink(eventData.advanceAmount, {
        description:
          "Event Payment for booking id: " + eventId,
        customerName: eventData.name,
        customerContact: `91${eventData.phone}`,
        customerEmail: eventData.email,
        businessEmail: user,
        paymentFor: 'events',
        referenceId: referenceId,
        expireInDays: 1,
      });
       await sendEventPaymentLink(`91${eventData.phone}`, [
        eventData.name,
        eventData.businessInfo.businessName,
        eventId,
        eventData.eventType,
        `${new Date(eventData.startDate).toLocaleDateString("en-GB")} - ${new Date(eventData.endDate).toLocaleDateString("en-GB")}`,
        eventData.numberOfPeople,
        formattedMenu,
        eventData.pricePerPlate,
        eventData.totalAmount,
        eventData.advanceAmount,
        eventData.balanceAmount,
        paymentLink.short_url,
        
        eventData.relationshipManager.contact,
      ]);
      // return newEvent;
    
  }
    


    return { success: true};
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}


export async function sendEventPaymentLink(
  phoneNumber: string,
  variables: string[]
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    // console.log("phoneNumber", phoneNumber, variables);
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
            name: "event_reservation",
            language: { code: "en_US" },
            components: [
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
    console.log("WhatsApp API Response:", data); // Add logging for debugging

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


export async function sendEventPaymentCompletedMessage(
  phoneNumber: string,
  variables: string[]
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    // console.log("phoneNumber", phoneNumber, variables);
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
            name: "event_payment_confirmation",
            language: { code: "en_US" },
            components: [
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
    console.log("WhatsApp API Response:", data); // Add logging for debugging

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



export async function getEventMenuData() {
  try {

    const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return [];
  }

  // const user = 'vikumar.azad@gmail.com'

    // Create listeners for both documents
    // const restaurantRef = doc(db, "vikumar.azad@gmail.com", "restaurant");
    const eventRef = doc(db, user, "hotel");
    const docSnap = await getDoc(eventRef);

    if (docSnap.exists()) {
      const data = docSnap.data()?.menu;
      return data;
    }

    return false;

  } catch (error) {
    console.error("Error setting    up real-time listener:", error);
    return false;
  }
}

// Event Settings Types


// Get Event Settings
export async function getEventSettings(): Promise<EventSettings | null> {
  try {
    const session = await auth();
    const user = session?.user?.email;

    if (!user) {
      console.error("User email is undefined");
      return null;
    }
    const docRef = doc(db, user, "info");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        enabledEventTypes: data.hotel?.events?.settings?.enabledEventTypes ,
        enabledFoodOptions: data.hotel?.events?.settings?.enabledFoodOptions,
        venues: data.hotel?.events?.settings?.venues || [],
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching event settings:", error);
    return null;
  }
}

// Save Event Settings
export async function saveEventSettings(settings: EventSettings): Promise<boolean> {
  try {
    const session = await auth();
    const user = session?.user?.email;

    if (!user) {
      console.error("User email is undefined");
      return false;
    }
    const docRef = doc(db, user, "info");
    
    await updateDoc(docRef, {
      "hotel.events.settings": settings,
    });
    
    return true;
  } catch (error) {
    console.error("Error saving event settings:", error);
    return false;
  }
}