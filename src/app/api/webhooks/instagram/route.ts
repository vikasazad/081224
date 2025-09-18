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
import { EncryptedFlowPayload, handleFlowRequest } from "@/lib/flow/flow";

const VERIFY_TOKEN = "verify_token";

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
