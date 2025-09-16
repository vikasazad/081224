// import { NextRequest, NextResponse } from "next/server";

// const VERIFY_TOKEN = "my_verify_token";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge");

//   if (mode === "subscribe" && token === VERIFY_TOKEN) {
//     console.log("Webhook verified");
//     return new NextResponse(challenge, {
//       status: 200,
//       headers: {
//         "Content-Type": "text/plain",
//       },
//     });
//   } else {
//     return new NextResponse("Verification failed", {
//       status: 403,
//       headers: {
//         "Content-Type": "text/plain",
//       },
//     });
//   }
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   // console.log("asdfasdfsadfsadfasdf", body);
//   console.log("Webhook payload:", JSON.stringify(body, null, 2));
//   return new NextResponse("EVENT_RECEIVED", { status: 200 });
// }
// // 1166938691424211
// // {
// //     "user_id": "17841461761761525",
// //     "username": "buildbility",
// //     "id": "9774988495894051"
// // }
// // IGAAYyrZBtfLJFBZAE5NZAUVLazJ1RU0xSjBWNW1pOHMyUFZAKMklJZAXBRVnhlVklZAcjVmNWRhd3ZAmQUxTMURmZAlZAtXzlESFpSRmJhVVdoeFdpUjd2dURtZA093TFU4U0lWTG02cTdyMXVlbmlDQ1RDZA0JDN25FMl95WjljeVZABN2pRcwZDZD

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const VERIFY_TOKEN = "verify_token";

// Environment variables for encryption
const PRIVATE_KEY = process.env.WHATSAPP_PRIVATE_KEY;
const PASSPHRASE = process.env.WHATSAPP_PASSPHRASE;

// Interfaces for Flow requests/responses
interface EncryptedFlowPayload {
  encrypted_flow_data: string;
  encrypted_aes_key: string;
  initial_vector: string;
}

interface DecryptedFlowData {
  action?: string;
  screen?: string;
  data?: any;
  flow_token?: string;
}

// Decrypt WhatsApp Flow payload
async function decryptFlowData(
  payload: EncryptedFlowPayload
): Promise<DecryptedFlowData> {
  if (!PRIVATE_KEY || !PASSPHRASE) {
    throw new Error("Missing encryption keys in environment variables");
  }

  try {
    // Decrypt AES key using RSA private key
    const privateKey = crypto.createPrivateKey({
      key: PRIVATE_KEY,
      format: "pem",
      type: "pkcs1",
      passphrase: PASSPHRASE,
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
async function handleFlowRequest(
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
      passphrase: PASSPHRASE!,
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

      case "INIT":
        // Handle flow initialization
        response = {
          screen: "WELCOME_SCREEN",
          data: {
            welcome_message: "Welcome to our service!",
          },
        };
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
  // This is where you'll implement your Flow logic
  // For now, return a basic response
  console.log("Processing data exchange for:", data.action);

  return {
    screen: "SUCCESS_SCREEN",
    data: {
      message: "Data exchange successful",
      timestamp: new Date().toISOString(),
    },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } else {
    return new NextResponse("Verification failed", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Webhook payload:", JSON.stringify(body, null, 2));

  try {
    // Check if this is a WhatsApp Flow encrypted request
    if (
      body.encrypted_flow_data &&
      body.encrypted_aes_key &&
      body.initial_vector
    ) {
      return await handleFlowRequest(body as EncryptedFlowPayload);
    }

    // Handle regular WhatsApp messages
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      if (body?.action === "ping") {
        return NextResponse.json(
          {
            data: {
              status: "active",
            },
          },
          { status: 200 }
        );
      }
      const changes = body.entry[0].changes[0];

      if (changes.field === "messages" && changes.value.messages) {
        const message = changes.value.messages[0];
        const from = message.from;

        // Handle text messages (for staff login)
        if (message.type === "text") {
          const { handleStaffLogin } = await import(
            "@/app/modules/staff/utils/whatsapp-staff-manager"
          );
          const textBody = message.text.body;

          // Handle online/offline/active/inactive messages
          if (
            ["online", "offline", "active", "inactive"].includes(
              textBody.toLowerCase().trim()
            )
          ) {
            const result = await handleStaffLogin(from, textBody);
            console.log("Staff login result:", result);
          }
        }

        // Handle interactive button responses (for assignment acceptance)
        if (
          message.type === "interactive" &&
          message.interactive.type === "button_reply"
        ) {
          const { handleAssignmentResponse } = await import(
            "@/app/modules/staff/utils/whatsapp-staff-manager"
          );
          const buttonId = message.interactive.button_reply.id;

          const result = await handleAssignmentResponse(from, buttonId);
          console.log("Assignment response result:", result);
        }
      }
    }
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
  }

  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
// 1166938691424211
// {
//     "user_id": "17841461761761525",
//     "username": "buildbility",
//     "id": "9774988495894051"
// }
// IGAAYyrZBtfLJFBZAE5NZAUVLazJ1RU0xSjBWNW1pOHMyUFZAKMklJZAXBRVnhlVklZAcjVmNWRhd3ZAmQUxTMURmZAlZAtXzlESFpSRmJhVVdoeFdpUjd2dURtZA093TFU4U0lWTG02cTdyMXVlbmlDQ1RDZA0JDN25FMl95WjljeVZABN2pRcwZDZD
