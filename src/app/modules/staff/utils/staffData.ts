"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
// import { sendNotification } from "@/lib/sendNotification";
import {
  deleteField,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { SignJWT } from "jose";
import {
  sendStaffAssignmentRequest,
  sendWhatsAppTextMessage,
} from "./whatsapp-staff-manager";
interface StaffMember {
  name: string;
  contact: string;
  notificationToken: string;
  orders: string[];
}

export const generateInvoiceObject = async (
  roomData: any,
  businessInfo: any,
  invoice: string
) => {
  let booking,
    customer,
    diningOrders,
    services,
    checklist = {};
  // const transactions = roomData.transactions || [];

  if (roomData.bookingDetails?.location?.trim() !== "") {
    const payment: any = {
      discount: roomData.bookingDetails?.payment?.discount,
      gst: {
        gstAmount: roomData.bookingDetails?.payment?.gst?.gstAmount || 0,
        gstPercentage:
          roomData.bookingDetails?.payment?.gst?.gstPercentage || 0,
        cgstAmount: roomData.bookingDetails?.payment?.gst?.cgstAmount || 0,
        cgstPercentage:
          roomData.bookingDetails?.payment?.gst?.cgstPercentage || 0,
        sgstAmount: roomData.bookingDetails?.payment?.gst?.sgstAmount || 0,
        sgstPercentage:
          roomData.bookingDetails?.payment?.gst?.sgstPercentage || 0,
      },
      price: roomData.bookingDetails?.payment?.price || 0,
      subtotal: roomData.bookingDetails?.payment?.subtotal || 0,
      totalPrice: roomData.bookingDetails?.payment?.totalPrice || 0,
      bookingId: roomData.bookingDetails?.bookingId || "",
      nights: roomData.bookingDetails?.nights || 0,
      checkIn: roomData.bookingDetails?.checkIn || "",
      checkOut: roomData.bookingDetails?.checkOut || "",
      noOfGuests: roomData.bookingDetails?.noOfGuests || 0,
    };
    booking = {
      ...payment,
    };
  }

  if (roomData.bookingDetails?.customer?.name) {
    customer = {
      name: roomData.bookingDetails?.customer?.name,
    };
  }

  if (roomData.diningDetails?.orders?.length > 0) {
    const payment: any = {
      discount: 0,
      gst: {
        gstAmount: 0,
        gstPercentage: 0,
        cgstAmount: 0,
        cgstPercentage: 0,
        sgstAmount: 0,
        sgstPercentage: 0,
      },
      price: 0,
      subtotal: 0,
      totalPrice: 0,
      pendingAmount: 0,
    };
    roomData.diningDetails?.orders.forEach((item: any) => {
      console.log("item", item);
      if (item.payment.paymentStatus === "pending") {
        payment.pendingAmount += item.payment?.price || 0;
      }
      payment.discount += item.payment?.discount?.amount || 0;
      payment.gst.gstAmount += item.payment?.gst?.gstAmount || 0;
      payment.gst.gstPercentage = item.payment?.gst?.gstPercentage || 0;
      payment.gst.cgstAmount += item.payment?.gst?.cgstAmount || 0;
      payment.gst.cgstPercentage = item.payment?.gst?.cgstPercentage || 0;
      payment.gst.sgstAmount += item.payment?.gst?.sgstAmount || 0;
      payment.gst.sgstPercentage = item.payment?.gst?.sgstPercentage || 0;
      payment.price += item.payment?.price || 0;
      payment.subtotal += item.payment?.subtotal || 0;
      payment.totalPrice += item.payment?.totalPrice || 0;
    });
    diningOrders = {
      ...payment,
    };
  }
  if (roomData.servicesUsed?.length > 0) {
    const payment: any = {
      discount: 0,
      gst: {
        gstAmount: 0,
        gstPercentage: 0,
        cgstAmount: 0,
        cgstPercentage: 0,
        sgstAmount: 0,
        sgstPercentage: 0,
      },
      price: 0,
      subtotal: 0,
      totalPrice: 0,
      pendingAmount: 0,
    };
    roomData.servicesUsed?.forEach((item: any) => {
      if (item.payment.paymentStatus === "pending") {
        payment.pendingAmount += item.payment?.price || 0;
      }
      payment.discount += item.payment?.discount?.amount || 0;
      payment.gst.gstAmount += item.payment?.gst?.gstAmount || 0;
      payment.gst.gstPercentage = item.payment?.gst?.gstPercentage || 0;
      payment.gst.cgstAmount += item.payment?.gst?.cgstAmount || 0;
      payment.gst.cgstPercentage = item.payment?.gst?.cgstPercentage || 0;
      payment.gst.sgstAmount += item.payment?.gst?.sgstAmount || 0;
      payment.gst.sgstPercentage = item.payment?.gst?.sgstPercentage || 0;
      payment.price += item.payment?.price || 0;
      payment.subtotal += item.payment?.subtotal || 0;
      payment.totalPrice += item.payment?.totalPrice || 0;
    });
    services = {
      ...payment,
    };
  }

  if (!!roomData.checklist) {
    const payment: any = {
      discount: {
        amount: roomData.checklist?.payment?.discount?.amount || 0,
        code: roomData.checklist?.payment?.discount?.code || "",
        type: roomData.checklist?.payment?.discount?.type || "",
      },
      gst: {
        gstAmount: roomData.checklist?.payment?.gst?.gstAmount || 0,
        gstPercentage: roomData.checklist?.payment?.gst?.gstPercentage || 0,
        cgstAmount: roomData.checklist?.payment?.gst?.cgstAmount || 0,
        cgstPercentage: roomData.checklist?.payment?.gst?.cgstPercentage || 0,
        sgstAmount: roomData.checklist?.payment?.gst?.sgstAmount || 0,
        sgstPercentage: roomData.checklist?.payment?.gst?.sgstPercentage || 0,
      },
      price: roomData.checklist?.payment?.price || 0,
      subtotal: roomData.checklist?.payment?.subtotal || 0,
      totalPrice: roomData.checklist?.payment?.totalPrice || 0,
      pendingAmount: 0,
    };
    if (roomData.checklist?.payment?.paymentStatus === "pending") {
      payment.pendingAmount += roomData.checklist?.payment?.price || 0;
    }
    checklist = {
      ...payment,
    };
  }

  // Calculate totals
  const billItems: any = {
    booking,
    diningOrders,
    services,
    checklist,
  };

  // Room booking charges

  const invoiceObject = {
    business: {
      name: businessInfo.businessName,
      gst: businessInfo.gst,
      pan: businessInfo.panNo,
      cin: businessInfo.cin,
      email: businessInfo.email,
      phone: businessInfo.phone,
      invoiceNo: invoice,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short", // Thu
        day: "2-digit", // 08
        month: "short", // May
        year: "numeric", // 2025
      }),
      bookingId: booking?.bookingId || "",
    },
    customer,
    stayDetails: {
      nights: booking?.nights || 0,
      checkIn: new Date(booking?.checkIn).toLocaleDateString("en-US", {
        weekday: "short", // Thu
        day: "2-digit", // 08
        month: "short", // May
        year: "numeric", // 2025
      }),
      checkOut: new Date(booking?.checkOut).toLocaleDateString("en-US", {
        weekday: "short", // Thu
        day: "2-digit", // 08
        month: "short", // May
        year: "numeric", // 2025
      }),
      noOfGuests: booking?.noOfGuests || 0,
    },
    billItems,
    totals: {
      pendingAmount:
        (billItems.booking?.pendingAmount || 0) +
        (billItems.diningOrders?.pendingAmount || 0) +
        (billItems.services?.pendingAmount || 0) +
        (billItems.checklist?.pendingAmount || 0),
      subtotal:
        (billItems.booking?.subtotal || 0) +
        (billItems.diningOrders?.subtotal || 0) +
        (billItems.services?.subtotal || 0) +
        (billItems.checklist?.subtotal || 0),
      gst:
        (billItems.booking?.gst?.gstAmount || 0) +
        (billItems.diningOrders?.gst?.gstAmount || 0) +
        (billItems.services?.gst?.gstAmount || 0) +
        (billItems.checklist?.gst?.gstAmount || 0),
      cgst:
        (billItems.booking?.gst?.cgstAmount || 0) +
        (billItems.diningOrders?.gst?.cgstAmount || 0) +
        (billItems.services?.gst?.cgstAmount || 0) +
        (billItems.checklist?.gst?.cgstAmount || 0),
      sgst:
        (billItems.booking?.gst?.sgstAmount || 0) +
        (billItems.diningOrders?.gst?.sgstAmount || 0) +
        (billItems.services?.gst?.sgstAmount || 0) +
        (billItems.checklist?.gst?.sgstAmount || 0),
      grandTotal:
        (billItems.booking?.totalPrice || 0) +
        (billItems.diningOrders?.totalPrice || 0) +
        (billItems.services?.totalPrice || 0) +
        (billItems.checklist?.totalPrice || 0),
    },
  };

  // console.log("invoiceObject", invoiceObject);

  return invoiceObject;
};
export const generateInvoiceObjectRestaurant = async (
  tableData: any,
  businessInfo: any,
  invoice: string
) => {
  let customer, diningOrders;

  if (tableData.diningDetails?.customer?.name) {
    customer = {
      name: tableData.diningDetails?.customer?.name || "",
    };
  }

  if (tableData.diningDetails?.orders?.length > 0) {
    const payment: any = {
      items: [],
      discount: 0,
      gst: {
        gstAmount: 0,
        gstPercentage: 0,
        cgstAmount: 0,
        cgstPercentage: 0,
        sgstAmount: 0,
        sgstPercentage: 0,
      },
      price: 0,
      subtotal: 0,
      totalPrice: 0,
      pendingAmount: 0,
    };
    tableData.diningDetails?.orders.forEach((item: any) => {
      console.log("item", item);
      if (item.payment.paymentStatus === "pending") {
        payment.pendingAmount += item.payment?.price || 0;
      }
      payment.items.push(...item.items);
      payment.discount += item.payment?.discount?.amount || 0;
      payment.gst.gstAmount += item.payment?.gst?.gstAmount || 0;
      payment.gst.gstPercentage = item.payment?.gst?.gstPercentage || 0;
      payment.gst.cgstAmount += item.payment?.gst?.cgstAmount || 0;
      payment.gst.cgstPercentage = item.payment?.gst?.cgstPercentage || 0;
      payment.gst.sgstAmount += item.payment?.gst?.sgstAmount || 0;
      payment.gst.sgstPercentage = item.payment?.gst?.sgstPercentage || 0;
      payment.price += item.payment?.price || 0;
      payment.subtotal += item.payment?.subtotal || 0;
      payment.totalPrice += item.payment?.totalPrice || 0;
    });
    diningOrders = {
      ...payment,
    };
  }

  // Calculate totals
  const billItems: any = {
    diningOrders,
  };

  // Room booking charges

  const invoiceObject = {
    business: {
      name: businessInfo.businessName,
      gst: businessInfo.gst,
      pan: businessInfo.panNo,
      cin: businessInfo.cin,
      email: businessInfo.email,
      phone: businessInfo.phone,
      invoiceNo: invoice,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short", // Thu
        day: "2-digit", // 08
        month: "short", // May
        year: "numeric", // 2025
      }),
    },
    customer,
    stayDetails: {},
    billItems,
    totals: {
      pendingAmount:
        (billItems.booking?.pendingAmount || 0) +
        (billItems.diningOrders?.pendingAmount || 0) +
        (billItems.services?.pendingAmount || 0) +
        (billItems.checklist?.pendingAmount || 0),
      subtotal:
        (billItems.booking?.subtotal || 0) +
        (billItems.diningOrders?.subtotal || 0) +
        (billItems.services?.subtotal || 0) +
        (billItems.checklist?.subtotal || 0),
      gst:
        (billItems.booking?.gst?.gstAmount || 0) +
        (billItems.diningOrders?.gst?.gstAmount || 0) +
        (billItems.services?.gst?.gstAmount || 0) +
        (billItems.checklist?.gst?.gstAmount || 0),
      cgst:
        (billItems.booking?.gst?.cgstAmount || 0) +
        (billItems.diningOrders?.gst?.cgstAmount || 0) +
        (billItems.services?.gst?.cgstAmount || 0) +
        (billItems.checklist?.gst?.cgstAmount || 0),
      sgst:
        (billItems.booking?.gst?.sgstAmount || 0) +
        (billItems.diningOrders?.gst?.sgstAmount || 0) +
        (billItems.services?.gst?.sgstAmount || 0) +
        (billItems.checklist?.gst?.sgstAmount || 0),
      grandTotal:
        (billItems.booking?.totalPrice || 0) +
        (billItems.diningOrders?.totalPrice || 0) +
        (billItems.services?.totalPrice || 0) +
        (billItems.checklist?.totalPrice || 0),
    },
  };

  // console.log("invoiceObject", invoiceObject);

  return invoiceObject;
};

export const calculateOrderTotal = async (order: any) => {
  const itemsTotal = order.reduce(
    (total: number, item: any) => total + parseFloat(item.price),
    0
  );

  return itemsTotal;
};

// export const calculateTax = async (order: any, tax: string) => {
//   const total = await calculateOrderTotal(order);
//   const rounded = Math.round((total * Number(tax)) / 100);
//   return rounded;
// };

export const calculateFinalAmount = async (item: any) => {
  const final = item.diningDetails.orders.map((data: any) => {
    if (data.payment.paymentStatus === "pending") {
      const total = data.items.reduce((total: number, order: any) => {
        return total + parseFloat(order.price || "0");
      }, 0);
      const gstAmount = parseFloat(data.payment?.gst?.gstAmount || "0");

      return total + gstAmount;
    }
    return undefined; // Explicitly return undefined for clarity
  });

  // Filter out undefined values and calculate the sum
  const validValues = final.filter((value: any) => value !== undefined);
  const sum = validValues.reduce((acc: any, value: any) => acc + value, 0);

  return sum || 0; // Return 0 if no valid values
};

function generateOrderId(restaurantCode: string, roomNo: string) {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const orderId = `${restaurantCode}:R-${roomNo}:${randomNumber}`;
  return orderId;
}

export async function getRoomData() {
  const session = await auth();
  const user = session?.user?.email;

  // Ensure user is defined
  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data: any = {
        foodMenuItems: [],
        hotelRoomIssues: [],
        hotelServices: [],
      };

      // Process menu items if menu data exists
      if (docSnap.data().menu) {
        const category = docSnap.data().menu.categories;
        category.forEach((menu: any) =>
          menu.menuItems.forEach((item: any) => {
            const portionSizes = Object.keys(item.price); // Get portion sizes
            portionSizes.forEach((portion) => {
              const obj = {
                id: item.id,
                name: item.name,
                quantity: portion, // Portion size
                price: item.price[portion], // Corresponding price
              };
              data.foodMenuItems.push(obj);
            });
          })
        );
      }

      // Process room issues if issue data exists
      if (docSnap.data().issues) {
        const issues = docSnap.data().issues;
        Object.entries(issues).forEach(([key, value]: any) => {
          value.forEach((subtype: any) => {
            const obj = {
              name: key,
              issueSubtype: subtype,
              description: false,
            };
            data.hotelRoomIssues.push(obj);
          });
        });
      }

      // Process services if services data exists
      if (docSnap.data().services) {
        const categories = docSnap.data().services.categories;
        Object.values(categories).forEach((category: any) =>
          Object.values(category).forEach((service: any) => {
            service.forEach((detail: any) => {
              const obj = {
                name: detail.typeName || "Service",
                startTime: detail.startTime || "N/A",
                endTime: detail.endTime || "N/A",
                price: detail.price || 0,
              };
              data.hotelServices.push(obj);
            });
          })
        );
      }

      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return false;
  }
}

export async function getTableData() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data: any = {
        foodMenuItems: [],
        hotelTableIssues: [],
      };
      if (docSnap.data().menu) {
        const category = docSnap.data().menu.categories;
        category.map((menu: any) =>
          menu.menuItems.map((item: any) => {
            const portionSizes = Object.keys(item.price); // Get the portion sizes (e.g., ["Single"], ["Half", "Full"], ["Medium", "Large"])
            portionSizes.map((portion) => {
              const obj = {
                id: item.id,
                name: item.name,
                quantity: portion, // Portion size (e.g., "Single", "Half", "Full", etc.)
                price: item.price[portion], // Corresponding price for the portion size
              };
              data.foodMenuItems.push(obj);
            });
          })
        );
      }

      if (docSnap.data().issues) {
        const arr = docSnap.data().issues;
        Object.entries(arr).forEach(([key, value]: any) => {
          value.forEach((subtype: any) => {
            const obj = {
              name: key,
              issueSubtype: subtype,
              description: false,
            };
            data.hotelTableIssues.push(obj);
          });
        });
      }

      return data;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function saveToken(token: string) {
  console.log("herealso");
  const session: any = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  console.log("herealso2");
  const docRef = doc(db, user, "info");
  if (session?.user?.role === "admin") {
    try {
      const docRef = doc(db, user, "info");
      await updateDoc(docRef, {
        "personalInfo.notificationToken": token,
      });
    } catch {
      return false;
    }
  } else {
    try {
      // Step 1: Retrieve the current staff array
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const staff = data.staff || [];

        // Step 2: Find and update the specific staff member
        const updatedStaff = staff.map((member: any) => {
          if (member.email === session?.user?.staff?.email) {
            return {
              ...member,
              notificationToken: token,
            };
          }
          return member;
        });

        // Step 3: Update the staff array in Firestore
        await updateDoc(docRef, {
          staff: updatedStaff,
        });

        console.log("Notification token updated successfully for Sarah Lee");
      } else {
        console.error("Document does not exist");
      }
    } catch (error) {
      console.error("Error updating notification token:", error);
    }
  }
}

export async function setOfflineTable(tableData: any) {
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
      const data = docSnap.data().live.tables;

      const tablePhone = tableData?.diningDetails?.customer?.phone;
      // console.log("YYYYYYY", tablePhone);

      if (!tablePhone) {
        console.error("Phone number is missing in tableData");
        return false;
      }

      const updatedData = data.map((item: any) => {
        if (item.diningDetails?.customer?.phone === tablePhone) {
          return {
            ...item,
            ...tableData,
          };
        }
        return item;
      });

      // return updatedData;

      await updateDoc(docRef, {
        "live.tables": updatedData,
      });

      console.log("Data successfully updated and saved to Firestore.");
      return true;
    } else {
      console.error("Document does not exist.");
    }
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}
export async function setOfflineRoom(tableData: any) {
  console.log("tableData", tableData);
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data().live.rooms;

      const guestPhone = tableData?.bookingDetails?.customer?.phone;
      // console.log("YYYYYYY", guestPhone);

      if (!guestPhone) {
        console.error("Phone number is missing in tableData");
        return false;
      }

      const updatedData = data.map((item: any) => {
        if (
          item.bookingDetails?.customer?.phone === guestPhone &&
          item.bookingDetails?.bookingId === tableData.bookingDetails?.bookingId
        ) {
          return {
            ...item,
            ...tableData,
          };
        }
        return item;
      });

      // return updatedData;

      await updateDoc(docRef, {
        "live.rooms": updatedData,
      });

      // await addKitchenOrder(tableData);

      console.log("Data successfully updated and saved to Firestore.");
      return true;
    } else {
      console.error("Document does not exist.");
    }
  } catch (error) {
    console.error("ERROR setting offline data:", error);
  }

  return false;
}
function assignAttendantSequentially(
  availableStaff: StaffMember[]
): StaffMember | null {
  if (availableStaff.length === 0) return null;

  // Sort staff by number of current orders (ascending)
  const sortedStaff = [...availableStaff].sort(
    (a, b) => (a.orders?.length || 0) - (b.orders?.length || 0)
  );

  // Return the staff with the least number of orders
  return sortedStaff[0];
}

export async function getOnlineConcierge() {
  console.log("getOnlineConcierge");
  const session = await auth();
  const user = session?.user?.email;

  // Ensure user is defined
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
          staffMember.status === "online" &&
          staffMember.role === "concierge" &&
          staffMember.active !== false // Check that staff is active (true or undefined)
      )
      .map((staffMember: any) => ({
        name: staffMember.name,
        notificationToken: staffMember.notificationToken,
        orders: staffMember.orders,
        contact: staffMember.contact,
      }));

    const _onlineStaff = assignAttendantSequentially(onlineStaff);
    return _onlineStaff;
  } catch (error) {
    console.error("Error setting up real-time listener: ", error);
    return false;
  }
}

export async function updateOrdersForAttendant(
  attendantName: string,
  orderId: string,
  contact?: string
) {
  const session = await auth();
  const user = session?.user?.email;

  // Ensure user is defined
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    // Reference to the Firestore document containing staff info
    const docRef = doc(db, user, "info");

    // Fetch the document to get the current staff data
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
    // console.log("staff", staff);
    await updateDoc(docRef, {
      staff: staff,
    });
    if (orderId.startsWith("BOK") && contact) {
      await sendWhatsAppTextMessage(
        contact,
        `Booking ${orderId} assigned to you, Please reachout to reception to get the room details.`
      );
    } else if (
      (orderId.startsWith("OR") || orderId.startsWith("RES")) &&
      contact
    ) {
      await sendWhatsAppTextMessage(
        contact,
        `Order ${orderId} assigned to you, Please reachout to kitchen to get the order delivered.`
      );
    } else if (orderId.startsWith("IS") && contact) {
      await sendWhatsAppTextMessage(
        contact,
        `Issue ${orderId} assigned to you. Please reachout to reception to get the issue resolved.`
      );
    } else if (orderId.startsWith("SE") && contact) {
      await sendWhatsAppTextMessage(
        contact,
        `Service ${orderId} assigned to you, Please reachout to reception to get the service delivered.`
      );
    }
    console.log("Order attendant updated successfully");
  } catch (error) {
    console.error("Error updating orders: ", error);
  }
}

export async function removeRoomByNumber(roomNo: string, roomType: string) {
  const session = await auth();
  const user = session?.user?.email;

  // Ensure user is defined
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

    console.log("updatedTableDetails", updatedTableDetails);
    // return updatedTableDetails;

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

export async function setAttendent(tableData: any) {
  console.log("tableData", tableData);
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "restaurant");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Get the existing live tables data
      const existingTables = docSnap.data().live.tables;

      // Find the index of the table with matching location
      const tableIndex = existingTables.findIndex(
        (table: any) =>
          table.diningDetails.location === tableData[0].diningDetails.location
      );

      // If a matching table is found, replace it with the new table data
      if (tableIndex !== -1) {
        existingTables[tableIndex] = tableData[0];

        // Update the document with the modified tables array
        // console.log("existingTables", existingTables);
        await updateDoc(docRef, {
          "live.tables": existingTables,
        });

        console.log("Table data successfully updated in Firestore.");
        return true;
      } else {
        // If no matching table is found, you might want to add the new table
        // or handle this case differently
        console.warn("No matching table location found.");
        return false;
      }
    } else {
      console.error("Document does not exist.");
      return false;
    }
  } catch (error) {
    console.error("ERROR updating table data:", error);
    return false;
  }
}

// export async function saveRoomData(roomInfo: any) {
//   const session = await auth();
//   const user = session?.user?.email;

//   // Ensure user is defined
//   if (!user) {
//     console.error("User email is undefined");
//     return false;
//   }

//   const _bookingId = generateOrderId("BOK", roomInfo.roomNo);
//   const _attendant = await getOnlineConcierge();

//   const _roominfo = {
//     bookingDetails: {
//       customer: {
//         name: roomInfo.name,
//         email: roomInfo.email,
//         phone: roomInfo.phone,
//         address: "",
//         notificationToken: "",
//       },
//       location: roomInfo.roomNo,
//       roomType: roomInfo.roomType,
//       aggregator: "Walk-In",
//       aggregatorLogo: "",
//       bookingId: _bookingId,
//       status: "occupied",
//       attendant: _attendant ? _attendant.name : "Unassigned",
//       attendantToken: _attendant ? _attendant.notificationToken : "",
//       bookingDate: new Date().toISOString(),
//       checkIn: roomInfo.checkIn,
//       checkOut: roomInfo.checkOut,
//       noOfGuests: roomInfo.numberOfGuests,
//       noOfRoom: roomInfo.numberOfRooms,
//       inclusions: roomInfo.inclusions,
//       specialRequirements: "",
//       payment: {
//         paymentStatus: "paid",
//         mode: roomInfo.paymentMode,
//         paymentId: roomInfo.paymentMode,
//         timeOfTransaction: new Date().toISOString(),
//         price: roomInfo.price,
//         priceAfterDiscount: "",
//         paymentType: "single",
//         subtotal: roomInfo.price,
//         gst: {
//           gstAmount: "",
//           gstPercentage: "",
//           cgstAmount: "",
//           cgstPercentage: "",
//           sgstAmount: "",
//           sgstPercentage: "",
//         },
//         discount: {
//           type: "",
//           amount: "",
//           code: "",
//         },
//       },
//     },
//     diningDetails: {},
//     servicesUsed: {},
//     issuesReported: {},
//     transctions: [
//       {
//         location: roomInfo.roomNo,
//         against: _bookingId,
//         attendant: _attendant,
//         bookingId: _bookingId,
//         payment: {
//           paymentStatus: "paid",
//           mode: roomInfo.paymentMode,
//           paymentId: roomInfo.paymentMode,
//           timeOfTransaction: new Date().toISOString(),
//           price: roomInfo.price,
//           priceAfterDiscount: "",
//           gst: {
//             gstAmount: "",
//             gstPercentage: "",
//             cgstAmount: "",
//             cgstPercentage: "",
//             sgstAmount: "",
//             sgstPercentage: "",
//           },
//           discount: {
//             type: "",
//             amount: "",
//             code: "",
//           },
//         },
//       },
//     ],
//   };

//   try {
//     const docRef = doc(db, user, "hotel");
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       // console.log("here in dode");
//       const data = docSnap.data().live;
//       // console.log("here in dode", data);
//       const updatedData = [...data.rooms, _roominfo];

//       console.log("here in dode", updatedData);

//       // return updatedData;
//       await updateDoc(docRef, {
//         "live.rooms": updatedData,
//       });
//       // if (_attendant) {
//       //   updateOrdersForAttendant(_attendant.name, _bookingId);
//       //   removeRoomByNumber(roomInfo.roomNo);
//       // }
//     }
//   } catch (error) {
//     console.log("Facing error while adding room", error);
//   }
// }

export async function findCoupon(couponCode: string) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "info");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data().hotel?.hotelDiscount || [];
    const coupon = data.find((coupon: any) => coupon.code === couponCode);
    return coupon;
  }
}

export async function saveRoomData(roomInfo: any) {
  try {
    const session = await auth();
    const user = session?.user?.email;

    // Ensure the user is logged in
    if (!user) {
      console.error("User email is undefined");
      return false;
    }

    const _bookingId = generateOrderId("BOK", roomInfo.roomNo);
    const _attendant = await getOnlineConcierge();

    if (!_attendant) {
      console.error("No attendant found");
      return false;
    }

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
        images: roomInfo.images,
        specialRequirements: roomInfo.specialRequirements || "",
        payment: {
          paymentStatus: "paid",
          mode: roomInfo.paymentMode,
          paymentId: roomInfo.paymentId,
          timeOfTransaction: new Date().toISOString(),
          price: roomInfo.price,
          priceAfterDiscount: roomInfo.priceAfterDiscount || "",
          paymentType: "single",
          subtotal: roomInfo.subtotal,
          totalPrice: roomInfo.totalPrice,
          gst: {
            gstAmount: roomInfo.gstAmount || "",
            gstPercentage: roomInfo.gstPercentage || "",
            cgstAmount: roomInfo.cgstAmount || "",
            cgstPercentage: roomInfo.cgstPercentage || "",
            sgstAmount: roomInfo.sgstAmount || "",
            sgstPercentage: roomInfo.sgstPercentage || "",
          },
          discount: [
            {
              type: roomInfo.discount?.type || "",
              amount: roomInfo.discount?.amount || "",
              code: roomInfo.discount?.code || "",
              discount: roomInfo.discount?.discount || 0,
            },
          ],
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
            paymentId: roomInfo.paymentId || "",
            timeOfTransaction: new Date().toISOString(),
            price: roomInfo.price,
            subtotal: roomInfo.subtotal,
            totalPrice: roomInfo.totalPrice,
            priceAfterDiscount: roomInfo.priceAfterDiscount || "",
            gst: {
              gstAmount: roomInfo.gstAmount || "",
              gstPercentage: roomInfo.gstPercentage || "",
              cgstAmount: roomInfo.cgstAmount || "",
              cgstPercentage: roomInfo.cgstPercentage || "",
              sgstAmount: roomInfo.sgstAmount || "",
              sgstPercentage: roomInfo.sgstPercentage || "",
            },
            discount: [
              {
                type: roomInfo.discount?.type || "",
                amount: roomInfo.discount?.amount || "",
                code: roomInfo.discount?.code || "",
                discount: roomInfo.discount?.discount || 0,
              },
            ],
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
        // await updateOrdersForAttendant(_attendant.name, _bookingId);
        await removeRoomByNumber(roomInfo.roomNo, roomInfo.roomType);
        const shortUrl = await shortenURL(
          "vikumar.azad@gmail.com",
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
          "123-456-7890", // Hotel Contact 1
          "987-654-3210", // Hotel Contact 2
          shortUrl,
        ]);
        //here to send whatsapp message to staff
        // console.log("here in saveRoomData", _attendant);
        await sendStaffAssignmentRequest(
          _attendant.name,
          _attendant.contact,
          _bookingId,
          roomInfo.name,
          roomInfo.roomNo,
          "room"
        );
        // await sendNotification(
        //   _attendant.notificationToken,
        //   "New Walk-in Guest",
        //   "A new walk-in guest has been registered. Please check the staff dashboard for more details."
        // );
      }

      console.log("Room data updated successfully");
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

export async function sendWhatsAppMessage(
  phoneNumber: string,
  name: string,
  variables: string[]
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
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
                parameters: [{ type: "text", text: name }], // Reservation number as header
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

export async function sendInvoiceWhatsapp(
  invoiceURL: string,
  phoneNumber: string,
  name: string,
  bookingId: string,
  date: string,
  businessName: string
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    console.log(
      "phoneNumber",
      phoneNumber,
      name,
      date,
      businessName,
      invoiceURL
    );
    const formattedPhone = `91${phoneNumber}`;

    // Create variables array for the room_bill template (5 variables as per template requirement)
    const variables = [name, bookingId, businessName, date, businessName];

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
            name: "room_bill",
            language: { code: "en_US" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      link: invoiceURL,
                      filename: "invoice.pdf",
                    },
                  },
                ],
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

export async function sendCheckOutWhatsAppMessage(
  phoneNumber: string,
  name: string,
  variables: string[]
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
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
                parameters: [{ type: "text", text: name }], // Reservation number as header
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
export async function sendTestWhatsAppMessage(phoneNumber: string) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    console.log("phoneNumber", phoneNumber);
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
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text: "Hey! Just confirming the guest has arrived. Let us know if you need help.",
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "change-button",
                    title: "Change",
                  },
                },
              ],
            },
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

export async function addKitchenOrder(
  orderId: string,
  customerName: string,
  items: any[],
  price: number,
  attendantName: string,
  attendantContact: string
) {
  try {
    const session = await auth();
    const user = session?.user?.email;
    console.log("USER", user);

    if (!user) {
      console.error("User email is undefined");
      return false;
    }

    // Reference to the Firestore document containing kitchen orders
    const docRef = doc(db, user, "hotel");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // If kitchen document doesn't exist, create it with initial structure
      return false;
    }

    const kitchenData = docSnap.exists()
      ? docSnap.data().kitchen
      : { orders: {} };

    // Generate a unique order ID if not provided

    // Create the new order object with required fields
    const newOrder = {
      id: orderId,
      customerName: customerName,
      status: "New",
      items: items,
      createdAt: new Date().toString(),
      startedAt: null,
      completedAt: null,
      totalAmount: price,
      preparationTimeMinutes: null,
      attendantName: attendantName,
      attendantContact: attendantContact,
    };

    console.log("NEW ORDER", newOrder);

    // Add the new order to the kitchen orders
    const updatedOrders = {
      [orderId]: newOrder,
      ...kitchenData?.orders,
    };

    console.log("UPDATED ORDERS", updatedOrders);

    // Update the document with the new order
    await updateDoc(docRef, {
      "kitchen.orders": updatedOrders,
    });

    console.log("Kitchen order added successfully");
    return true;
  } catch (error) {
    console.error("Error adding kitchen order: ", error);
    return false;
  }
}

export async function sendTakeReviewMessage(
  phoneNumber: string,
  variables: string[],
  url: string
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    console.log("phoneNumber", phoneNumber, variables, url);
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
            name: "take_review_3",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: variables.map((value) => ({
                  type: "text",
                  text: String(value),
                })),
              },

              {
                type: "button",
                sub_type: "COPY_CODE",
                index: "1",
                parameters: [
                  {
                    type: "coupon_code",
                    coupon_code: variables[1],
                  },
                ],
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

export async function sendFinalMessage(
  phoneNumber: string,
  variables: string[],
  invoiceURL: string
) {
  try {
    // Format phone number - remove any special characters and ensure proper format
    console.log("phoneNumber", phoneNumber, variables);
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
            name: "final_1",
            language: { code: "en_US" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      link: invoiceURL,
                      filename: "invoice.pdf",
                    },
                  },
                ],
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

export async function getDiscount() {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  const docRef = doc(db, user, "info");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().hotel?.hotelDiscount || [];
  } else {
    return false;
  }
}

async function calculateTax(
  pricePerNight: number,
  subtotalAmount: number,
  taxType: string,
  taxDetails: any
) {
  const taxTypeData = taxDetails[taxType];
  if (!taxTypeData) {
    throw new Error(`Invalid tax type: ${taxType}`);
  }

  let gstPercentage = 0;

  // Check if there's an "all" key for flat rate
  if (taxTypeData["all"]) {
    gstPercentage = parseFloat(taxTypeData["all"]);
  } else {
    // Look for price-based keys dynamically
    const priceKeys = Object.keys(taxTypeData).filter(
      (key) =>
        key.includes("below") ||
        key.includes("above") ||
        key.includes("under") ||
        key.includes("over")
    );

    if (priceKeys.length === 0) {
      throw new Error(`No valid tax rate found for tax type: ${taxType}`);
    }

    // Process each price-based key to find the applicable rate
    for (const key of priceKeys) {
      const lowerKey = key.toLowerCase();

      // Extract price threshold from the key
      const priceMatch = key.match(/(\d+(?:\.\d+)?)/);
      if (!priceMatch) continue;

      const threshold = parseFloat(priceMatch[1]);

      // Check if price/night falls within this bracket
      if (lowerKey.includes("below") || lowerKey.includes("under")) {
        if (pricePerNight <= threshold) {
          gstPercentage = parseFloat(taxTypeData[key]);
          break;
        }
      } else if (lowerKey.includes("above") || lowerKey.includes("over")) {
        if (pricePerNight > threshold) {
          gstPercentage = parseFloat(taxTypeData[key]);
          break;
        }
      }
    }

    // If no bracket matched, try to find a default or fallback rate
    if (gstPercentage === 0) {
      // Look for the lowest threshold as fallback
      const sortedKeys = priceKeys.sort((a, b) => {
        const aPrice = parseFloat(a.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
        const bPrice = parseFloat(b.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
        return aPrice - bPrice;
      });

      if (sortedKeys.length > 0) {
        gstPercentage = parseFloat(taxTypeData[sortedKeys[0]]);
      }
    }
  }

  if (gstPercentage === 0) {
    throw new Error(
      `Could not determine tax rate for ${taxType} with price/night: ${pricePerNight}`
    );
  }

  // Calculate amounts
  const gstAmount = Math.round((subtotalAmount * gstPercentage) / 100);
  const cgstPercentage = gstPercentage / 2;
  const sgstPercentage = gstPercentage / 2;
  const cgstAmount = (subtotalAmount * cgstPercentage) / 100;
  const sgstAmount = (subtotalAmount * sgstPercentage) / 100;

  return {
    gstAmount: Math.round(gstAmount * 100) / 100,
    gstPercentage,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    cgstPercentage,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    sgstPercentage,
  };
}

export async function addDiscount(discount: any, table: any) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
  try {
    const docRef = doc(db, user, "restaurant");
    const gstRef = doc(db, user, "info");
    const gstSnap = await getDoc(gstRef);
    if (!gstSnap.exists()) return false;
    const gstTax = gstSnap.data().business?.gstTax;
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data().live.tables;
      // Find the table that matches
      const tableIndex = data.findIndex(
        (item: any) =>
          item.diningDetails.location === table.diningDetails.location
      );

      if (tableIndex === -1) {
        console.error("table not found");
        return false;
      }

      // Calculate discount
      let calculatedDiscount = 0;
      if (discount.type === "percentage") {
        const percentageAmount = parseFloat(discount.amount);
        calculatedDiscount = Math.round(
          table.diningDetails.payment.subtotal * (percentageAmount / 100)
        );
      } else {
        calculatedDiscount = Math.round(discount.amount);
      }

      // Calculate tax for the updated subtotal
      const taxDetails = await calculateTax(
        table.diningDetails.payment.price,
        Math.round(table.diningDetails.payment.subtotal - calculatedDiscount),
        "dining",
        gstTax
      );

      // Create updated table object
      const updatedTable = {
        ...data[tableIndex],
        diningDetails: {
          ...data[tableIndex].diningDetails,
          payment: {
            ...data[tableIndex].diningDetails.payment,
            priceAfterDiscount:
              Math.round(
                table.diningDetails.payment.subtotal - calculatedDiscount
              ) || "",
            paymentType: "single",
            subtotal: table.diningDetails.payment.subtotal - calculatedDiscount,
            totalPrice: Math.round(
              table.diningDetails.payment.subtotal -
                calculatedDiscount +
                taxDetails.gstAmount
            ),
            gst: {
              gstAmount: taxDetails.gstAmount || "",
              gstPercentage: taxDetails.gstPercentage || "",
              cgstAmount: taxDetails.cgstAmount || "",
              cgstPercentage: taxDetails.cgstPercentage || "",
              sgstAmount: taxDetails.sgstAmount || "",
              sgstPercentage: taxDetails.sgstPercentage || "",
            },
            discount: [
              ...data[tableIndex].diningDetails.payment.discount,
              { ...discount, discount: calculatedDiscount },
            ],
          },
        },
        transctions: data[tableIndex].transctions.map((transaction: any) => {
          if (
            transaction.diningId === data[tableIndex].diningDetails.diningId
          ) {
            return {
              ...transaction,
              payment: {
                ...transaction.payment,
                priceAfterDiscount:
                  Math.round(
                    table.diningDetails.payment.subtotal - calculatedDiscount
                  ) || "",
                subtotal:
                  table.diningDetails.payment.subtotal - calculatedDiscount,
                totalPrice: Math.round(
                  table.diningDetails.payment.subtotal -
                    calculatedDiscount +
                    taxDetails.gstAmount
                ),
                gst: {
                  gstAmount: taxDetails.gstAmount || "",
                  gstPercentage: taxDetails.gstPercentage || "",
                  cgstAmount: taxDetails.cgstAmount || "",
                  cgstPercentage: taxDetails.cgstPercentage || "",
                  sgstAmount: taxDetails.sgstAmount || "",
                  sgstPercentage: taxDetails.sgstPercentage || "",
                },
                discount: [
                  ...transaction.payment.discount,
                  { ...discount, discount: calculatedDiscount },
                ],
              },
            };
          }
          return transaction;
        }),
      };

      // Create updated data array with the modified table
      const updatedData = [...data];
      updatedData[tableIndex] = updatedTable;
      await updateDoc(docRef, { "live.tables": updatedData });
      return true;
      // return updatedData;
    }
  } catch (error) {
    console.error("Error adding discount:", error);
    return false;
  }
}

export async function removeDiscount(location: string) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "restaurant");
    const gstRef = doc(db, user, "info");
    const gstSnap = await getDoc(gstRef);
    if (!gstSnap.exists()) return false;
    const gstTax = gstSnap.data().business?.gstTax;
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data().live.tables;
      // Find the room that matches
      const tableIndex = data.findIndex(
        (item: any) => item.diningDetails.location === location
      );

      if (tableIndex === -1) {
        console.error("table not found");
        return false;
      }

      const table = data[tableIndex];

      // Check if there are any discounts to remove
      if (
        !table.diningDetails.payment.discount ||
        table.diningDetails.payment.discount.length === 0
      ) {
        console.error("No discounts to remove");
        return false;
      }

      // Remove the last discount
      const updatedDiscounts = table.diningDetails.payment.discount.slice(
        0,
        -1
      );

      // Calculate the total discount amount from remaining discounts
      let totalRemainingDiscount = 0;
      updatedDiscounts.forEach((discount: any) => {
        if (discount.type === "percentage") {
          const percentageAmount = parseFloat(discount.amount);
          totalRemainingDiscount += Math.round(
            table.diningDetails.payment.subtotal * (percentageAmount / 100)
          );
        } else {
          totalRemainingDiscount += Math.round(discount.amount);
        }
      });

      // Calculate new subtotal after removing the last discount
      const newSubtotal =
        table.diningDetails.payment.price - totalRemainingDiscount;

      // Calculate tax for the updated subtotal
      const taxDetails = await calculateTax(
        table.diningDetails.payment.price,
        Math.round(newSubtotal),
        "restaurant",
        gstTax
      );

      // Create updated room object
      const updatedTable = {
        ...table,
        diningDetails: {
          ...table.diningDetails,
          payment: {
            ...table.diningDetails.payment,
            priceAfterDiscount:
              totalRemainingDiscount > 0 ? Math.round(newSubtotal) : "",
            subtotal: newSubtotal,
            totalPrice: Math.round(newSubtotal + taxDetails.gstAmount),
            gst: {
              gstAmount: taxDetails.gstAmount || "",
              gstPercentage: taxDetails.gstPercentage || "",
              cgstAmount: taxDetails.cgstAmount || "",
              cgstPercentage: taxDetails.cgstPercentage || "",
              sgstAmount: taxDetails.sgstAmount || "",
              sgstPercentage: taxDetails.sgstPercentage || "",
            },
            discount: updatedDiscounts,
          },
        },
        transctions: table.transctions.map((transaction: any) => {
          if (transaction.orderId === table.diningDetails.orderId) {
            return {
              ...transaction,
              payment: {
                ...transaction.payment,
                priceAfterDiscount:
                  totalRemainingDiscount > 0 ? Math.round(newSubtotal) : "",
                subtotal: newSubtotal,
                totalPrice: Math.round(newSubtotal + taxDetails.gstAmount),
                gst: {
                  gstAmount: taxDetails.gstAmount || "",
                  gstPercentage: taxDetails.gstPercentage || "",
                  cgstAmount: taxDetails.cgstAmount || "",
                  cgstPercentage: taxDetails.cgstPercentage || "",
                  sgstAmount: taxDetails.sgstAmount || "",
                  sgstPercentage: taxDetails.sgstPercentage || "",
                },
                discount: updatedDiscounts,
              },
            };
          }
          return transaction;
        }),
      };

      // Create updated data array with the modified table
      const updatedData = [...data];
      updatedData[tableIndex] = updatedTable;
      await updateDoc(docRef, { "live.tables": updatedData });
      return true;

      // return updatedData;
    }
  } catch (error) {
    console.error("Error removing discount:", error);
    return false;
  }
}

export async function completeTakeawayOrder(
  orderId: string,
  customerPhone: string
) {
  const session = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const takeawayRef = doc(db, user, "hotel");
    const takeawayData = await getDoc(takeawayRef);
    if (takeawayData.exists()) {
      const data = takeawayData.data()?.takeaway[customerPhone][orderId];
      const length = Object.keys(
        takeawayData.data()?.takeaway[customerPhone]
      ).length;

      await updateDoc(takeawayRef, {
        [`customers.${customerPhone}.orders`]: arrayUnion({
          ...data,
          timeOfFullfilment: new Date().toISOString(),
          status: "Delivered",
        }),
      });

      if (length === 1) {
        await updateDoc(takeawayRef, {
          [`takeaway.${customerPhone}`]: deleteField(),
        });
      } else {
        await updateDoc(takeawayRef, {
          [`takeaway.${customerPhone}.${orderId}`]: deleteField(),
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error completing takeaway order:", error);
    return false;
  }

  // await sendWhatsAppMessageDeliveryCompleted(`+91${customerPhone}`, [
  //   orderId,
  //   address,
  //   "Wah Bhai Wah",
  // ]);
}
