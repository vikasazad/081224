import crypto from "crypto";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/db/firebase";
import { NextResponse } from "next/server";
// Environment variables for encryption
const PRIVATE_KEY = process.env.WHATSAPP_PRIVATE_KEY;

// Issue categories for different order types
const hotelIssueCategories = {
  "General Cleanliness": [
    "Dust on surfaces",
    "Dirty floors",
    "Trash not emptied",
    "Overall room cleanliness",
  ],
  Bathroom: [
    "Dirty toilet",
    "Unclean shower/bathtub",
    "Dirty sink",
    "Towels not clean",
    "Towels not provided",
  ],
  Bedding: [
    "Dirty sheets",
    "Stained pillows",
    "Uncomfortable mattress",
    "Missing pillows/blankets",
    "Bed not made properly",
  ],
  "Floors and Carpets": [
    "Stained carpet",
    "Carpet needs vacuuming",
    "Floor sticky or wet",
    "Carpet odor",
  ],
  "Air Conditioning/Heating": [
    "AC not working",
    "Room too hot",
    "Room too cold",
    "Strange noises from AC",
    "AC remote not working",
  ],
  "Wi-Fi Connection": [
    "No internet connection",
    "Slow internet speed",
    "Connection keeps dropping",
    "Cannot connect to network",
    "Password not working",
  ],
  "Television/Entertainment": [
    "TV not turning on",
    "No signal/channels",
    "Remote control not working",
    "Sound issues",
    "Screen problems",
  ],
  Housekeeping: [
    "Room not cleaned properly",
    "Missed cleaning schedule",
    "Items moved/missing",
    "Cleaning supplies left behind",
    "Requested items not provided",
  ],
  "Noise Issues": [
    "Loud neighbors",
    "Street noise",
    "Construction noise",
    "HVAC noise",
    "Other disturbances",
  ],
  "Safety Concerns": [
    "Door lock issues",
    "Window lock problems",
    "Smoke detector issues",
    "Electrical safety concerns",
    "Other safety issues",
  ],
  "Other Hotel Issues": [
    "Elevator problems",
    "Key card not working",
    "Phone not working",
    "Lighting issues",
    "Other concerns",
  ],
};

// Food order issues
const foodIssues = [
  "Wrong Order Delivered",
  "Missing Items",
  "Food Quality Issues",
  "Cold Food",
  "Late Delivery",
  "Incorrect Billing",
  "Allergic Reaction",
  "Portion Size Issues",
  "Spilled Food",
  "Other Food Issues",
];

// Service-related issues
const serviceIssues = [
  "Service Not Available",
  "Poor Service Quality",
  "Staff Unprofessional",
  "Long Wait Time",
  "Booking/Reservation Issues",
  "Equipment Not Working",
  "Facility Closed Unexpectedly",
  "Incorrect Billing/Charges",
  "Service Not as Described",
  "Cleanliness Issues",
  "Safety Concerns",
  "Other Service Problems",
];

// Interfaces for Flow requests/responses
export interface EncryptedFlowPayload {
  encrypted_flow_data: string;
  encrypted_aes_key: string;
  initial_vector: string;
}

export interface DecryptedFlowData {
  action?: string;
  screen?: string;
  data?: any;
  flow_token?: string;
}

async function getOrderId(roomNo: string) {
  try {
    const docRef = doc(db, "vikumar.azad@gmail.com", "hotel");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const hotelData = docSnap.data()?.live?.rooms;
      const roomData = hotelData?.find(
        (room: any) => room.bookingDetails?.location === roomNo
      );
      const orderIds: string[] = [];
      if (roomData) {
        if (roomData?.bookingDetails?.location) {
          orderIds.push(roomData?.bookingDetails?.bookingId);
        }
        if (roomData?.diningDetails?.orders) {
          roomData?.diningDetails?.orders?.forEach((order: any) => {
            orderIds.push(order.orderId);
          });
        }

        if (roomData?.servicesUsed) {
          roomData?.servicesUsed?.forEach((service: any) => {
            orderIds.push(service.serviceId);
          });
        }
      }
      return orderIds;
    } else {
      console.error("Hotel document does not exist");
      return false;
    }
  } catch (error) {
    console.error("Error getting hotel data:", error);
    return false;
  }
}

// Decrypt WhatsApp Flow payload
async function decryptFlowData(
  payload: EncryptedFlowPayload
): Promise<DecryptedFlowData> {
  // Add this temporary debug code before line 76:
  if (!PRIVATE_KEY) {
    throw new Error("Missing encryption keys in environment variables");
  }

  try {
    // Decrypt AES key using RSA private key
    const privateKey = crypto.createPrivateKey({
      key: PRIVATE_KEY,
      format: "pem",
      type: "pkcs1",
      passphrase: "",
    });

    const encryptedAESKeyBuffer = Buffer.from(
      payload.encrypted_aes_key,
      "base64"
    );
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedAESKeyBuffer
    );

    // Decrypt flow data using AES GCM
    const initialVector = Buffer.from(payload.initial_vector, "base64");
    const encryptedData = Buffer.from(payload.encrypted_flow_data, "base64");

    // Extract auth tag (last 16 bytes)
    const authTagLength = 16;
    const authTag = encryptedData.slice(-authTagLength);
    const ciphertext = encryptedData.slice(0, -authTagLength);

    // Use Node.js built-in GCM decryption
    const algorithm = "aes-128-gcm";
    const decipher = crypto.createDecipheriv(algorithm, aesKey, initialVector);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    const decryptedString = decrypted.toString("utf8");
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Failed to decrypt flow data:", error);
    throw error;
  }
}

// Encrypt WhatsApp Flow response
function encryptFlowResponse(
  response: any,
  aesKey: Buffer,
  initialVector: Buffer
): string {
  try {
    // Flip the initialization vector
    const flippedIV = Buffer.from(initialVector.map((byte) => ~byte));

    const algorithm = "aes-128-gcm";
    const cipher = crypto.createCipheriv(algorithm, aesKey, flippedIV);

    const jsonResponse = JSON.stringify(response);
    const encrypted = Buffer.concat([
      cipher.update(jsonResponse, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();
    const encryptedWithTag = Buffer.concat([encrypted, authTag]);

    return encryptedWithTag.toString("base64");
  } catch (error) {
    console.error("Failed to encrypt flow response:", error);
    throw error;
  }
}

// Handle WhatsApp Flow requests
export async function handleFlowRequest(
  payload: EncryptedFlowPayload
): Promise<NextResponse> {
  try {
    // Decrypt the payload
    const decryptedData = await decryptFlowData(payload);
    console.log("Decrypted Flow data:", JSON.stringify(decryptedData, null, 2));

    // Extract AES key and IV for response encryption
    const privateKey = crypto.createPrivateKey({
      key: PRIVATE_KEY!,
      format: "pem",
      type: "pkcs1",
      passphrase: "",
    });

    const encryptedAESKeyBuffer = Buffer.from(
      payload.encrypted_aes_key,
      "base64"
    );
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedAESKeyBuffer
    );
    const initialVector = Buffer.from(payload.initial_vector, "base64");

    let response: any;

    // Handle different Flow request types
    switch (decryptedData.action) {
      case "ping":
      case "HEALTH_CHECK":
        response = {
          data: {
            status: "active",
          },
        };
        break;

      case "data_exchange":
        // Handle data exchange requests (screen navigation, data fetching)
        response = await handleDataExchange(decryptedData);
        break;

      case "complete":
        // Handle flow completion
        console.log(
          "Flow completed with data:",
          JSON.stringify(decryptedData, null, 2)
        );
        response = {
          data: {
            status: "completed",
          },
        };
        break;

      case "INIT":
        // Handle flow initialization
        const orderIds = await getOrderId(decryptedData?.flow_token || "");
        if (orderIds && Array.isArray(orderIds)) {
          response = {
            screen: "ORDERID",
            data: {
              orderId: orderIds.map((id) => ({
                id: id,
                title: id,
              })),
            },
          };
        } else {
          // Fallback if getOrderId fails
          response = {
            screen: "ORDERID",
            data: {
              orderId: [
                {
                  id: "No orders found",
                  title: "No orders found",
                },
              ],
            },
          };
        }
        break;

      default:
        console.warn("Unknown Flow action:", decryptedData.action);
        response = {
          screen: "ERROR_SCREEN",
          data: {
            error_message: "Unknown action",
          },
        };
    }

    // Encrypt the response
    const encryptedResponse = encryptFlowResponse(
      response,
      aesKey,
      initialVector
    );

    // Return encrypted response as plain text (as per WhatsApp documentation)
    return new NextResponse(encryptedResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error handling Flow request:", error);

    // Return HTTP 421 for decryption failures as per WhatsApp documentation
    if (error instanceof Error && error.message.includes("decrypt")) {
      return new NextResponse("Decryption failed", { status: 421 });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Handle data exchange requests for Flows
async function handleDataExchange(data: DecryptedFlowData): Promise<any> {
  console.log("Processing data exchange for:", data.action);
  console.log("Screen:", data.screen);
  console.log("Data payload:", data.data);

  // Check if we're on ORDERID screen
  if (data.screen === "ORDERID") {
    const { orderId, from } = data.data || {};

    // If from dropdown, just return success (do nothing)
    if (from === "dropdown") {
      console.log("Dropdown selection, returning success");
      return {
        screen: data.screen,
        data: {
          message: "Data exchange successful",
          timestamp: new Date().toISOString(),
        },
      };
    }

    // If from buttonClick, determine next screen based on orderId prefix
    if (from === "buttonClick" && orderId) {
      console.log("Button click with orderId:", orderId);

      // Check if orderId starts with BOK (Hotel booking)
      if (orderId.startsWith("BOK")) {
        // Return hotel issues screen
        const hotelIssuesList = Object.keys(hotelIssueCategories).map(
          (key) => ({
            id: key,
            title: key,
          })
        );

        return {
          screen: "HOTELISSUES",
          data: {
            hotelIssues: hotelIssuesList,
            issueSubtype: [], // Will be populated when main issue is selected
            isHotelIssues: false, // Initially false until main issue selected
          },
        };
      }

      // Check if orderId starts with OR (Food order) or SE (Service)
      if (orderId.startsWith("OR") || orderId.startsWith("SE")) {
        const issuesList = orderId.startsWith("OR")
          ? foodIssues.map((issue) => ({ id: issue, title: issue }))
          : serviceIssues.map((issue) => ({ id: issue, title: issue }));

        return {
          screen: "OTHERISSUES",
          data: {
            otherIssues: issuesList,
            isOtherIssue: false, // Initially false until issue selected
          },
        };
      }
    }
  }

  // Handle HOTELISSUES screen data exchange
  if (data.screen === "HOTELISSUES") {
    const { from } = data.data || {};

    // If from dropdown1 (issue selection), populate issueSubtype dropdown
    if (from === "dropdown1") {
      const { issue } = data.data || {};
      const subtypes =
        hotelIssueCategories[issue as keyof typeof hotelIssueCategories] || [];
      const issueSubtypeList = subtypes.map((subtype) => ({
        id: subtype,
        title: subtype,
      }));

      console.log("Hotel issue selected, returning subtypes for:", issue);
      return {
        screen: data.screen,
        data: {
          issueSubtype: issueSubtypeList,
          isHotelIssues: true, // Enable subtype dropdown and textarea
        },
      };
    }

    // If from dropdown2 (subtype selection), return success
    if (from === "dropdown2") {
      console.log("Hotel issue subtype selected, returning success");
      return {
        screen: data.screen,
        data: {
          message: "Data exchange successful",
          timestamp: new Date().toISOString(),
        },
      };
    }

    // If from buttonClick, go to complete screen
    if (from === "buttonClick") {
      console.log("Hotel issue form submitted via button click");
      return {
        screen: "COMPLETE",
        data: {
          message: "Data exchange successful",
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Handle OTHERISSUES screen data exchange
  if (data.screen === "OTHERISSUES") {
    const { from } = data.data || {};

    // If from dropdown, return success
    if (from === "dropdown") {
      console.log("Other issue selected from dropdown, returning success");
      return {
        screen: data.screen,
        data: {
          message: "Data exchange successful",
          timestamp: new Date().toISOString(),
          isOtherIssue: true,
        },
      };
    }

    // If from buttonClick, go to complete screen
    if (from === "buttonClick") {
      console.log("Other issue form submitted via button click");
      return {
        screen: "COMPLETE",
        data: {
          message: "Data exchange successful",
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Default response for unhandled cases
  return {
    data: {
      message: "Data exchange successful",
      timestamp: new Date().toISOString(),
    },
  };
}
