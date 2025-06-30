"use server";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { sendNotification } from "@/lib/sendNotification";

interface AssignmentRequest {
  staffName: string;
  orderId: string;
  staffContact: string;
  messageId: string;
  timestamp: number;
  attemptCount: number;
  customerName: string;
  roomNumber: string;
  status: "pending" | "accepted" | "declined" | "timeout";
  businessEmail: string;
}

// Import kitchen timer config for timeout settings
// Since this is a server component, we need to define the config here
const kitchenTimerConfig = {
  totalPreparationMinutes: 15,
  deliveryReadinessMinutes: 5,
  escalationTimeoutMinutes: 40, // Total time (waiting + preparation) before escalating to manager
};

/**
 * Helper function to find business emails that have a staff member with given phone
 */
async function findBusinessWithStaff(_phoneNumber: string): Promise<string[]> {
  console.log("findBusinessWithStaff", _phoneNumber);
  // This is a simplified implementation
  // In production, you might want to maintain an index or search more efficiently
  return ["vikumar.azad@gmail.com"]; // Return known business emails for now
}

/**
 * Send simple text message via WhatsApp
 */
export async function sendWhatsAppTextMessage(
  phoneNumber: string,
  message: string
) {
  try {
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
          to: phoneNumber,
          type: "text",
          text: { body: message },
        }),
      }
    );

    await response.json();
    return response.ok;
  } catch (error) {
    console.error("Error sending WhatsApp text message:", error);
    return false;
  }
}

/**
 * Handle staff login via WhatsApp message
 */
export async function handleStaffLogin(phoneNumber: string, message: string) {
  try {
    if (message.toLowerCase().trim() === "online") {
      const result = await markStaffOnline(phoneNumber);
      console.log("result", result);
      await markStaffActive(phoneNumber);

      if (result.success) {
        await sendWhatsAppTextMessage(
          phoneNumber,
          `Hello ${result.staffName}! You are now ONLINE and ready to receive assignments.`
        );
        return { success: true, message: "Staff marked online" };
      } else {
        await sendWhatsAppTextMessage(
          phoneNumber,
          "Unable to mark you online. Please contact admin if you're a registered staff member."
        );
        return { success: false, message: result.error };
      }
    } else if (message.toLowerCase().trim() === "offline") {
      const result = await markStaffOffline(phoneNumber);
      await markStaffInactive(phoneNumber);

      if (result.success) {
        await sendWhatsAppTextMessage(
          phoneNumber,
          `Goodbye ${result.staffName}! You are now OFFLINE. Have a great day!`
        );
        return { success: true, message: "Staff marked offline" };
      }
    } else if (message.toLowerCase().trim() === "active") {
      await markStaffActive(phoneNumber);
      await sendWhatsAppTextMessage(
        phoneNumber,
        "You are now ACTIVE and available for new assignments!"
      );
      return { success: true, message: "Staff marked active" };
    } else if (message.toLowerCase().trim() === "inactive") {
      await markStaffInactive(phoneNumber);
      await sendWhatsAppTextMessage(
        phoneNumber,
        "You are now INACTIVE and will not receive new assignments."
      );
      return { success: true, message: "Staff marked inactive" };
    }

    return { success: false, message: "Unknown command" };
  } catch (error) {
    console.error("Error handling staff login:", error);
    return { success: false, message: "Internal error" };
  }
}

/**
 * Mark staff member as online
 */
async function markStaffOnline(phoneNumber: string) {
  try {
    console.log("markStaffOnline", phoneNumber);
    // Find all businesses to locate the staff member
    const businessEmails = await findBusinessWithStaff(phoneNumber);

    if (businessEmails.length === 0) {
      return { success: false, error: "Staff member not found" };
    }

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        const updatedStaff = staff.map((member: any) => {
          if (member.contact === phoneNumber) {
            return {
              ...member,
              status: "online",
              lastSeen: new Date().toISOString(),
            };
          }
          return member;
        });
        // console.log("updatedStaff", updatedStaff);

        const result = await updateDoc(docRef, { staff: updatedStaff });
        console.log("result", result);

        const staffMember = staff.find((m: any) => m.phone === phoneNumber);
        return {
          success: true,
          staffName: staffMember?.name || "Staff",
          businessEmail,
        };
      }
    }

    return { success: false, error: "Failed to update status" };
  } catch (error) {
    console.error("Error marking staff online:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Mark staff member as offline
 */
async function markStaffOffline(phoneNumber: string) {
  try {
    console.log("markStaffOffline", phoneNumber);
    const businessEmails = await findBusinessWithStaff(phoneNumber);

    if (businessEmails.length === 0) {
      return { success: false, error: "Staff member not found" };
    }

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("docSnap");
        const data = docSnap.data();
        const staff = data.staff || [];
        console.log("staff", staff);
        const updatedStaff = staff.map((member: any) => {
          if (member.contact === phoneNumber) {
            return {
              ...member,
              status: "offline",
              lastSeen: new Date().toISOString(),
            };
          }
          return member;
        });
        // console.log("updatedStaff", updatedStaff);

        const result = await updateDoc(docRef, { staff: updatedStaff });
        console.log("result", result);

        const staffMember = staff.find((m: any) => m.phone === phoneNumber);
        return {
          success: true,
          staffName: staffMember?.name || "Staff",
        };
      }
    }

    return { success: false, error: "Failed to update status" };
  } catch (error) {
    console.error("Error marking staff offline:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Get receptionist notification tokens
 */
async function getReceptionistTokens(): Promise<string[]> {
  try {
    const businessEmails = await findBusinessWithStaff("");
    const tokens: string[] = [];

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        const receptionists = staff.filter(
          (member: any) =>
            member.role === "receptionist" &&
            member.notificationToken &&
            member.status === "online"
        );

        receptionists.forEach((receptionist: any) => {
          if (receptionist.notificationToken) {
            tokens.push(receptionist.notificationToken);
          }
        });
      }
    }

    return tokens;
  } catch (error) {
    console.error("Error getting receptionist tokens:", error);
    return [];
  }
}

/**
 * Send notification to all receptionists
 */
async function notifyReceptionists(title: string, message: string) {
  try {
    const tokens = await getReceptionistTokens();

    for (const token of tokens) {
      await sendNotification(token, title, message);
    }

    console.log(`Notifications sent to ${tokens.length} receptionists`);
  } catch (error) {
    console.error("Error notifying receptionists:", error);
  }
}

/**
 * Send assignment request to staff member
 */
export async function sendStaffAssignmentRequest(
  staffName: string,
  staffContact: string,
  orderId: string,
  customerName: string,
  roomNumber: string,
  assignmentType: "room" | "table" = "room"
) {
  try {
    console.log(
      "sendStaffAssignmentRequest",
      staffName,
      staffContact,
      orderId,
      customerName,
      roomNumber,
      assignmentType
    );

    // Check if staff already has too many pending assignments
    // const pendingAssignments = await getAllPendingAssignmentsForStaff(
    //   staffContact
    // );
    // if (pendingAssignments.length >= 3) {
    //   // Limit to 3 pending assignments per staff
    //   console.log("Staff has too many pending assignments:", staffContact);
    //   return {
    //     success: false,
    //     message: "Staff has too many pending assignments",
    //   };
    // }

    // Check if this order is already assigned to someone
    // const existingAssignment = await getPendingAssignment(orderId);
    // if (existingAssignment && existingAssignment.status === "pending") {
    //   console.log("Order already has a pending assignment:", orderId);
    //   return {
    //     success: false,
    //     message: "Order already has a pending assignment",
    //   };
    // }
    console.log("data", {
      staffName,
      staffContact,
      orderId,
      customerName,
      roomNumber,
      assignmentType,
    });
    const formattedPhone = staffContact.replace(/\D/g, "");
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
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text:
                `New ${
                  assignmentType === "room" ? "Room" : "Table"
                } Assignment\n\n` +
                `Customer: ${customerName}\n` +
                `${
                  assignmentType === "room" ? "Room" : "Table"
                }: ${roomNumber}\n` +
                `Order ID: ${orderId}\n\n` +
                `Please accept this assignment to proceed.`,
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: `accept_${orderId}`,
                    title: "Accept Request",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: `decline_${orderId}`,
                    title: "Decline",
                  },
                },
              ],
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages && data.messages[0]) {
      const messageId = data.messages[0].id;

      // Store pending assignment with status
      await storePendingAssignment({
        staffName,
        orderId,
        staffContact,
        messageId,
        timestamp: Date.now(),
        attemptCount: 1,
        customerName,
        roomNumber,
        status: "pending",
        businessEmail: "vikumar.azad@gmail.com", // Set the proper business email
      });

      console.log("initial pendingAssignments stored in database");

      // Set timeout using configurable duration
      setTimeout(() => {
        handleAssignmentTimeout(orderId);
      }, 5 * 60 * 1000);

      return { success: true, messageId };
    }

    throw new Error(data.error?.message || "Failed to send message");
  } catch (error: any) {
    console.error("WhatsApp Assignment Error:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Handle staff response to assignment request
 */
export async function handleAssignmentResponse(
  phoneNumber: string,
  buttonId: string
) {
  try {
    const parts = buttonId.split("_");
    const action = parts[0];
    const orderId = parts[parts.length - 1]; // Get the last part as orderId

    if (action === "accept") {
      // Get assignment data before updating status
      const assignment = await getPendingAssignment(orderId);
      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      // Update assignment status
      await updateAssignmentStatus(orderId, "accepted");

      await sendWhatsAppTextMessage(
        phoneNumber,
        `Assignment accepted! Order ${orderId} has been assigned to you. Check your staff dashboard for details.`
      );

      // Notify receptionists about acceptance
      await notifyReceptionists(
        "Assignment Accepted",
        `Order ${orderId} has been accepted by ${assignment.staffName}. Customer: ${assignment.customerName}, Room: ${assignment.roomNumber}`
      );

      await removePendingAssignment(orderId);

      // Update order assignment in database
      await confirmStaffAssignment(phoneNumber, orderId);

      return { success: true, message: "Assignment accepted" };
    } else if (action === "decline") {
      console.log("here in decline");
      // Get assignment data before updating status
      const assignment = await getPendingAssignment(orderId);
      console.log("action", action);
      console.log("assignment from database", assignment);

      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      // Update assignment status
      await updateAssignmentStatus(orderId, "declined");

      // Mark staff as inactive after decline
      await markStaffInactive(phoneNumber);

      await sendWhatsAppTextMessage(
        phoneNumber,
        "Assignment declined. You have been marked as inactive. Send 'active' to become available for new assignments."
      );

      // Notify receptionists about decline
      await notifyReceptionists(
        "Assignment Declined",
        `Order ${orderId} has been declined by ${assignment.staffName}. Customer: ${assignment.customerName}, Room: ${assignment.roomNumber}. Staff marked as inactive.`
      );

      return { success: true, message: "Assignment declined" };
    } else if (action === "delivery" && parts[1] === "ready") {
      // Handle "On my way" response for delivery readiness
      const assignment = await getPendingAssignment(orderId);
      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      // Update assignment status
      await updateAssignmentStatus(orderId, "accepted");

      await sendWhatsAppTextMessage(
        phoneNumber,
        `Great! You're on your way for order #${orderId}. The food will be ready when you arrive.`
      );

      // Remove pending assignment
      await removePendingAssignment(orderId);

      console.log(`Staff confirmed delivery readiness for order ${orderId}`);
      return { success: true, message: "Delivery readiness confirmed" };
    } else if (action === "delivery" && parts[1] === "not") {
      // Handle "Not available" response for delivery readiness
      const assignment = await getPendingAssignment(orderId);
      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      // Update assignment status
      await updateAssignmentStatus(orderId, "declined");

      // Mark staff as inactive
      await markStaffInactive(phoneNumber);

      await sendWhatsAppTextMessage(
        phoneNumber,
        "You have been marked as inactive. Send 'active' to continue receiving orders."
      );

      // Notify manager about staff unavailability
      const managerInfo = await getManagerInfo();
      if (managerInfo) {
        await sendWhatsAppTextMessage(
          managerInfo.contact,
          `DELIVERY ALERT \n\nOrder #${orderId} is about to be delivered but the assigned staff is not available. Please assign any available staff from the dashboard.\n\nCustomer: ${assignment.customerName}\nRoom/Table: ${assignment.roomNumber}`
        );

        // Send push notification to manager if token is available
        if (managerInfo.notificationToken) {
          await sendNotification(
            managerInfo.notificationToken,
            "Delivery Alert - Staff Not Available",
            `Order #${orderId} needs reassignment. Staff is not available for delivery.`
          );
        }
      }

      // Remove pending assignment
      await removePendingAssignment(orderId);

      console.log(`Staff declined delivery readiness for order ${orderId}`);
      return {
        success: true,
        message: "Staff marked inactive, manager notified",
      };
    }

    return { success: false, message: "Unknown action" };
  } catch (error) {
    console.error("Error handling assignment response:", error);
    return { success: false, message: "Internal error" };
  }
}

/**
 * Handle assignment timeout - try next staff member
 */
async function handleAssignmentTimeout(orderId: string) {
  try {
    //In this we are only sending notification to the receptionist not the manager
    const assignment = await getPendingAssignment(orderId);

    if (!assignment || assignment.status !== "pending") {
      return; // Assignment was already handled or is not pending
    }

    // Update assignment status to timeout
    await updateAssignmentStatus(orderId, "timeout");

    // Mark staff as inactive after timeout
    await markStaffInactive(assignment.staffContact);

    // Send message to staff about timeout
    await sendWhatsAppTextMessage(
      assignment.staffContact,
      "Assignment request timed out. You have been marked as inactive. Send 'active' to become available for new assignments."
    );

    // Notify receptionists about timeout
    await notifyReceptionists(
      "Assignment Timeout",
      `Assignment for order ${orderId} has timed out. Staff marked as inactive. Please reassign manually.`
    );

    // If this was the first attempt, try to find another staff member
    // if (assignment.attemptCount === 1) {
    //   const nextStaff = await getNextAvailableStaff(assignment.staffContact);

    //   if (nextStaff) {
    //     // Send notification to next staff member
    //     await sendStaffAssignmentRequest(
    //       nextStaff.contact,
    //       orderId,
    //       assignment.customerName,
    //       assignment.roomNumber,
    //       "room"
    //     );

    //     // Create new assignment with incremented attempt count
    //     const updatedAssignment = {
    //       ...assignment,
    //       attemptCount: 2,
    //       staffContact: nextStaff.contact,
    //       status: "pending",
    //     };
    //     await storePendingAssignment(updatedAssignment);
    //   }
    // }

    // Notify admin about unassigned order
    // await notifyAdminUnassignedOrder(orderId);
  } catch (error) {
    console.error("Error handling assignment timeout:", error);
  }
}

/**
 * Confirm staff assignment in database
 */
async function confirmStaffAssignment(staffContact: string, orderId: string) {
  try {
    const businessEmails = await findBusinessWithStaff(staffContact);

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        const updatedStaff = staff.map((member: any) => {
          if (member.contact === staffContact) {
            const orders = member.orders || [];
            return {
              ...member,
              orders: [...orders, orderId],
            };
          }
          return member;
        });

        await updateDoc(docRef, { staff: updatedStaff });

        // Also update the actual room/table assignment
        // await updateOrderAssignment(businessEmail, orderId, staffContact);
      }
    }
  } catch (error) {
    console.error("Error confirming staff assignment:", error);
  }
}

async function storePendingAssignment(assignment: AssignmentRequest) {
  try {
    // Store assignment as a field within the webhook document
    const businessEmail = assignment.businessEmail || "vikumar.azad@gmail.com";
    const docRef = doc(db, businessEmail, "webhook");

    // Get existing webhook document
    const docSnap = await getDoc(docRef);
    let existingAssignments = {};

    if (docSnap.exists()) {
      existingAssignments = docSnap.data() || {};
    }

    // Add the new assignment
    const updatedAssignments = {
      ...existingAssignments,
      [assignment.orderId]: {
        ...assignment,
        status: assignment.status || "pending",
        timestamp: Date.now(),
      },
    };

    await setDoc(docRef, updatedAssignments);
    console.log("Pending assignment stored:", assignment.orderId);
  } catch (error) {
    console.error("Error storing pending assignment:", error);
  }
}

async function getPendingAssignment(
  orderId: string
): Promise<AssignmentRequest | null> {
  try {
    // Get assignment from webhook document
    const businessEmail = "vikumar.azad@gmail.com";
    const docRef = doc(db, businessEmail, "webhook");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const assignments = docSnap.data();
      if (assignments && assignments[orderId]) {
        return assignments[orderId] as AssignmentRequest;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting pending assignment:", error);
    return null;
  }
}

async function updateAssignmentStatus(
  orderId: string,
  status: AssignmentRequest["status"]
) {
  try {
    // Update assignment status in webhook document
    const businessEmail = "vikumar.azad@gmail.com";
    const docRef = doc(db, businessEmail, "webhook");

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const assignments = docSnap.data();
      if (assignments && assignments[orderId]) {
        const updatedAssignments = {
          ...assignments,
          [orderId]: {
            ...assignments[orderId],
            status: status,
            updatedAt: Date.now(),
          },
        };

        await setDoc(docRef, updatedAssignments);
        console.log(`Assignment ${orderId} status updated to ${status}`);
      }
    }
  } catch (error) {
    console.error("Error updating assignment status:", error);
  }
}

async function removePendingAssignment(orderId: string) {
  try {
    const businessEmail = "vikumar.azad@gmail.com";
    const docRef = doc(db, businessEmail, "webhook");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const assignments = docSnap.data();
      if (assignments && assignments[orderId]) {
        delete assignments[orderId];
        await setDoc(docRef, assignments);
        console.log(`Pending assignment removed: ${orderId}`);
      }
    }
  } catch (error) {
    console.error("Error removing pending assignment:", error);
  }
}

/**
 * Mark staff as inactive when they decline or timeout
 */
async function markStaffInactive(phoneNumber: string) {
  try {
    const businessEmails = await findBusinessWithStaff(phoneNumber);

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        const updatedStaff = staff.map((member: any) => {
          if (member.contact === phoneNumber) {
            return {
              ...member,
              active: false,
              lastInactiveTime: new Date().toISOString(),
            };
          }
          return member;
        });

        await updateDoc(docRef, { staff: updatedStaff });
        console.log(`Staff ${phoneNumber} marked as inactive`);
      }
    }
  } catch (error) {
    console.error("Error marking staff inactive:", error);
  }
}

/**
 * Mark staff as active
 */
async function markStaffActive(phoneNumber: string) {
  try {
    const businessEmails = await findBusinessWithStaff(phoneNumber);

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        const updatedStaff = staff.map((member: any) => {
          if (member.contact === phoneNumber) {
            return {
              ...member,
              active: true,
              lastActiveTime: new Date().toISOString(),
            };
          }
          return member;
        });

        await updateDoc(docRef, { staff: updatedStaff });
        // console.log(`Staff ${phoneNumber} marked as active`);
      }
    }
  } catch (error) {
    console.error("Error marking staff active:", error);
  }
}

/**
 * Get next available staff member (excluding the current one)
 */
// async function getNextAvailableStaff(
//   excludePhone: string
// ): Promise<StaffMember | null> {
//   try {
//     const businessEmails = await findBusinessWithStaff(excludePhone);

//     for (const businessEmail of businessEmails) {
//       const docRef = doc(db, businessEmail, "info");
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         const staff = data.staff || [];

//         const availableStaff = staff.filter(
//           (member: any) =>
//             member.status === "online" &&
//             member.contact !== excludePhone &&
//             member.role === "concierge"
//           // (member.role === "concierge" || member.role === "attendant")
//         );

//         if (availableStaff.length > 0) {
//           // Return staff with least orders
//           const sortedStaff = availableStaff.sort(
//             (a: any, b: any) =>
//               (a.orders?.length || 0) - (b.orders?.length || 0)
//           );
//           return sortedStaff[0];
//         }
//       }
//     }

//     return null;
//   } catch (error) {
//     console.error("Error getting next available staff:", error);
//     return null;
//   }
// }

/**
 * Update order assignment in hotel/restaurant collection
 */
// async function updateOrderAssignment(
//   businessEmail: string,
//   orderId: string,
//   staffPhone: string
// ) {
//   try {
//     // Check hotel collection first
//     const hotelRef = doc(db, businessEmail, "hotel");
//     const hotelSnap = await getDoc(hotelRef);

//     if (hotelSnap.exists()) {
//       const rooms = hotelSnap.data().live?.rooms || [];
//       const updatedRooms = rooms.map((room: any) => {
//         if (room.bookingDetails?.bookingId === orderId) {
//           return {
//             ...room,
//             bookingDetails: {
//               ...room.bookingDetails,
//               attendant: staffPhone,
//               assignmentConfirmed: true,
//               assignmentTime: new Date().toISOString(),
//             },
//           };
//         }
//         return room;
//       });

//       if (JSON.stringify(rooms) !== JSON.stringify(updatedRooms)) {
//         await updateDoc(hotelRef, { "live.rooms": updatedRooms });
//         return;
//       }
//     }

//     // Check restaurant collection
//     const restaurantRef = doc(db, businessEmail, "restaurant");
//     const restaurantSnap = await getDoc(restaurantRef);

//     if (restaurantSnap.exists()) {
//       const tables = restaurantSnap.data().live?.tables || [];
//       const updatedTables = tables.map((table: any) => {
//         if (table.diningDetails?.orderId === orderId) {
//           return {
//             ...table,
//             diningDetails: {
//               ...table.diningDetails,
//               attendant: staffPhone,
//               assignmentConfirmed: true,
//               assignmentTime: new Date().toISOString(),
//             },
//           };
//         }
//         return table;
//       });

//       if (JSON.stringify(tables) !== JSON.stringify(updatedTables)) {
//         await updateDoc(restaurantRef, { "live.tables": updatedTables });
//       }
//     }
//   } catch (error) {
//     console.error("Error updating order assignment:", error);
//   }
// }

/**
 * Notify admin about unassigned orders
 */
// async function notifyAdminUnassignedOrder(orderId: string) {
//   try {
//     // Send notification to admin about unassigned order
//     console.log(
//       `Admin notification: Order ${orderId} remains unassigned after timeout`
//     );
//     // In production, you'd send push notification or email to admin
//   } catch (error) {
//     console.error("Error notifying admin:", error);
//   }
// }

// async function getAllPendingAssignmentsForStaff(
//   staffContact: string
// ): Promise<AssignmentRequest[]> {
//   try {
//     const q = query(
//       collection(db, "webhook"),
//       where("staffContact", "==", staffContact),
//       where("status", "==", "pending")
//     );

//     const querySnapshot = await getDocs(q);
//     const assignments: AssignmentRequest[] = [];

//     querySnapshot.forEach((doc) => {
//       assignments.push(doc.data() as AssignmentRequest);
//     });

//     return assignments;
//   } catch (error) {
//     console.error("Error getting staff pending assignments:", error);
//     return [];
//   }
// }

// async function removePendingAssignment(orderId: string) {
//   try {
//     const docRef = doc(db, "webhook", orderId);
//     await updateDoc(docRef, { status: "timeout" });
//     console.log("Pending assignment marked as timeout:", orderId);
//   } catch (error) {
//     console.error("Error removing pending assignment:", error);
//   }
// }

/**
 * Handle assignment timeout - try next staff member
 */
// async function handleAssignmentTimeout(orderId: string) {
//     try {
//       const assignment = await getPendingAssignment(orderId);
//       if (!assignment || assignment.status !== "pending") {
//         return; // Assignment was already handled or is not pending
//       }
//       // Update assignment status to timeout
//       await updateAssignmentStatus(orderId, "timeout");
//       // If this was the first attempt, try to find another staff member
//       if (assignment.attemptCount === 1) {
//         const nextStaff = await getNextAvailableStaff(assignment.staffContact);
//         if (nextStaff) {
//           // Send notification to next staff member
//           await sendStaffAssignmentRequest(
//             nextStaff.contact,
//             orderId,
//             assignment.customerName,
//             assignment.roomNumber,
//             "room"
//           );
//           // Create new assignment with incremented attempt count
//           const updatedAssignment = {
//             ...assignment,
//             attemptCount: 1,
//             staffContact: nextStaff.contact,
//             status: "pending",
//           };
//           await storePendingAssignment(updatedAssignment);
//         }
//       }
//       // Notify admin about unassigned order
//       await notifyAdminUnassignedOrder(orderId);
//     } catch (error) {
//       console.error("Error handling assignment timeout:", error);
//     }
// }
// async function removePendingAssignment(orderId: string) {
//   try {
//     const docRef = doc(db, "webhook", orderId);
//     await updateDoc(docRef, { status: "timeout" });
//     console.log("Pending assignment marked as timeout:", orderId);
//   } catch (error) {
//     console.error("Error removing pending assignment:", error);
//   }
// }

/**
 * Get manager notification tokens and contact info
 */
export async function getManagerInfo(): Promise<{
  contact: string;
  notificationToken: string | null;
} | null> {
  try {
    const businessEmails = await findBusinessWithStaff("");

    for (const businessEmail of businessEmails) {
      const docRef = doc(db, businessEmail, "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        const manager = staff.find(
          (member: any) =>
            member.role === "manager" && member.status === "online"
        );

        if (manager) {
          return {
            contact: manager.contact,
            notificationToken: manager.notificationToken || null,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting manager info:", error);
    return null;
  }
}

/**
 * Send kitchen alert to manager
 */
export async function sendKitchenAlertToManager(
  orderId: string,
  customerName: string,
  totalAmount: number,
  items: any[],
  waitingMinutes: number
) {
  try {
    const managerInfo = await getManagerInfo();

    if (!managerInfo) {
      console.log("No online manager found for kitchen alert");
      return false;
    }

    const whatsappMessage =
      `KITCHEN ALERT \n\n` +
      `Order #${orderId} has been waiting for ${waitingMinutes} minutes without being started.\n\n` +
      `Customer: ${customerName}\n` +
      `Total Amount: ₹${totalAmount}\n` +
      `Items: ${items
        .map((item) => `${item.count}x ${item.name}`)
        .join(", ")}\n\n` +
      `Please check the kitchen dashboard immediately.`;

    // Send WhatsApp message to manager
    const whatsappSuccess = await sendWhatsAppTextMessage(
      managerInfo.contact,
      whatsappMessage
    );

    // Send push notification to manager if token is available
    if (managerInfo.notificationToken) {
      await sendNotification(
        managerInfo.notificationToken,
        "Kitchen Alert - Order Waiting",
        `Order #${orderId} has been waiting for ${waitingMinutes} minutes without being started.`
      );
    }

    console.log(
      `Kitchen alert sent to manager for order ${orderId} waiting ${waitingMinutes} minutes`
    );
    return whatsappSuccess;
  } catch (error) {
    console.error("Failed to send kitchen alert to manager:", error);
    return false;
  }
}

/**
 * Send delivery readiness request to staff member when food is almost ready
 */
export async function sendDeliveryReadinessRequest(
  orderId: string,
  staffName: string,
  staffContact: string,
  customerName: string,
  roomNumber: string
) {
  try {
    console.log("sendDeliveryReadinessRequest", {
      orderId,
      staffName,
      staffContact,
      customerName,
      roomNumber,
    });

    const formattedPhone = staffContact.replace(/\D/g, "");
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
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text:
                `ORDER READY FOR DELIVERY \n\n` +
                `Order #${orderId} is almost ready!\n` +
                `Customer: ${customerName}\n` +
                `Room/Table: ${roomNumber}\n\n` +
                `Food will be ready in ${kitchenTimerConfig.deliveryReadinessMinutes} minutes. Are you ready for delivery?`,
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: `delivery_ready_${orderId}`,
                    title: "On my way",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: `delivery_not_available_${orderId}`,
                    title: "Not available",
                  },
                },
              ],
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages && data.messages[0]) {
      const messageId = data.messages[0].id;

      // Store pending delivery assignment
      await storePendingAssignment({
        staffName,
        orderId,
        staffContact,
        messageId,
        timestamp: Date.now(),
        attemptCount: 1,
        customerName,
        roomNumber,
        status: "pending",
        businessEmail: "vikumar.azad@gmail.com",
      });

      console.log("Delivery readiness request stored in database");

      // Set timeout using configurable duration
      setTimeout(() => {
        handleDeliveryReadinessTimeout(orderId);
      }, kitchenTimerConfig.deliveryReadinessMinutes * 60 * 1000);

      return { success: true, messageId };
    }

    throw new Error(data.error?.message || "Failed to send message");
  } catch (error: any) {
    console.error("WhatsApp Delivery Readiness Error:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Handle delivery readiness timeout
 */
async function handleDeliveryReadinessTimeout(orderId: string) {
  try {
    const assignment = await getPendingAssignment(orderId);

    if (!assignment || assignment.status !== "pending") {
      return; // Assignment was already handled or is not pending
    }

    // Update assignment status to timeout
    await updateAssignmentStatus(orderId, "timeout");

    // Mark staff as inactive after timeout
    await markStaffInactive(assignment.staffContact);

    // Send message to staff about timeout
    await sendWhatsAppTextMessage(
      assignment.staffContact,
      "You did not respond to the delivery request. You have been marked as inactive. Send 'active' to continue receiving orders."
    );

    // Notify manager about unresponsive staff
    const managerInfo = await getManagerInfo();
    if (managerInfo) {
      await sendWhatsAppTextMessage(
        managerInfo.contact,
        `DELIVERY ALERT \n\nStaff assigned to order #${orderId} is not responding. Please assign an active staff member from the dashboard to complete the delivery.\n\nCustomer: ${assignment.customerName}\nRoom/Table: ${assignment.roomNumber}`
      );

      // Send push notification to manager if token is available
      if (managerInfo.notificationToken) {
        await sendNotification(
          managerInfo.notificationToken,
          "Delivery Alert - Staff Not Responding",
          `Staff assigned to order #${orderId} is not responding. Please assign an active staff member.`
        );
      }
    }

    console.log(`Delivery readiness timeout handled for order ${orderId}`);
  } catch (error) {
    console.error("Error handling delivery readiness timeout:", error);
  }
}

/**
 * Send order escalation alert to manager
 */
export async function sendOrderEscalationToManager(
  orderId: string,
  customerName: string,
  totalAmount: number,
  items: any[],
  orderStatus: string,
  totalMinutes: number
) {
  try {
    const managerInfo = await getManagerInfo();

    if (!managerInfo) {
      console.log("No online manager found for order escalation");
      return false;
    }

    const statusText = orderStatus === "new" ? "waiting" : "in preparation";
    const whatsappMessage =
      `ORDER ESCALATION ALERT \n\n` +
      `Order #${orderId} has been ${statusText} for ${totalMinutes} minutes and needs immediate attention!\n\n` +
      `Customer: ${customerName}\n` +
      `Total Amount: ₹${totalAmount}\n` +
      `Items: ${items
        .map((item) => `${item.count}x ${item.name}`)
        .join(", ")}\n` +
      `Status: ${statusText.toUpperCase()}\n\n` +
      `This order has exceeded the ${kitchenTimerConfig.escalationTimeoutMinutes}-minute escalation threshold. Please take immediate action.`;

    // Send WhatsApp message to manager
    const whatsappSuccess = await sendWhatsAppTextMessage(
      managerInfo.contact,
      whatsappMessage
    );

    // Send push notification to manager if token is available
    if (managerInfo.notificationToken) {
      await sendNotification(
        managerInfo.notificationToken,
        "Order Escalation Alert",
        `Order #${orderId} has been ${statusText} for ${totalMinutes} minutes and needs immediate attention!`
      );
    }

    console.log(
      `Order escalation alert sent to manager for order ${orderId} after ${totalMinutes} minutes total time`
    );
    return whatsappSuccess;
  } catch (error) {
    console.error("Failed to send order escalation to manager:", error);
    return false;
  }
}
