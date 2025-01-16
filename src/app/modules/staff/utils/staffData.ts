"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
interface StaffMember {
  name: string;
  notificationToken: string;
  orders: string[];
}

export const calculateOrderTotal = async (order: any) => {
  const itemsTotal = order.reduce(
    (total: number, item: any) => total + parseFloat(item.price),
    0
  );

  return itemsTotal;
};

export const calculateTax = async (order: any, tax: string) => {
  const total = await calculateOrderTotal(order);
  const rounded = Math.round((total * Number(tax)) / 100);
  return rounded;
};

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
    const docRef = doc(db, user, "restaurant");
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
  const session: any = await auth();
  const user = session?.user?.email;
  if (!user) {
    console.error("User email is undefined");
    return false;
  }
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

      const tablePhone = tableData?.bookingDetails?.customer?.phone;
      // console.log("YYYYYYY", tablePhone);

      if (!tablePhone) {
        console.error("Phone number is missing in tableData");
        return false;
      }

      const updatedData = data.map((item: any) => {
        if (item.bookingDetails?.customer?.phone === tablePhone) {
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
    (a, b) => a.orders.length - b.orders.length
  );

  // Return the staff with the least number of orders
  return sortedStaff[0];
}

export async function getOnlineConcierge() {
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
          staffMember.status === "online" && staffMember.role === "concierge"
      )
      .map((staffMember: any) => ({
        name: staffMember.name,
        notificationToken: staffMember.notificationToken,
        orders: staffMember.orders,
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
  orderId: string
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

//   const _bookingId = generateOrderId("ABS", roomInfo.roomNo);
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

export async function saveRoomData(roomInfo: any) {
  try {
    const session = await auth();
    const user = session?.user?.email;

    // Ensure the user is logged in
    if (!user) {
      console.error("User email is undefined");
      return false;
    }

    const _bookingId = generateOrderId("ABS", roomInfo.roomNo);
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
        // return _remove;
      }

      console.log("Room data updated successfully");
    } else {
      console.error("Document does not exist");
    }
  } catch (error) {
    console.error("Error while saving room data:", error);
  }
}
