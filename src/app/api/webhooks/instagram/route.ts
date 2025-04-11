import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "my_verify_token";

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
  // console.log("asdfasdfsadfsadfasdf", body);
  console.log("Webhook payload:", JSON.stringify(body, null, 2));
  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
// 1166938691424211
// {
//     "user_id": "17841461761761525",
//     "username": "buildbility",
//     "id": "9774988495894051"
// }
// IGAAYyrZBtfLJFBZAE5NZAUVLazJ1RU0xSjBWNW1pOHMyUFZAKMklJZAXBRVnhlVklZAcjVmNWRhd3ZAmQUxTMURmZAlZAtXzlESFpSRmJhVVdoeFdpUjd2dURtZA093TFU4U0lWTG02cTdyMXVlbmlDQ1RDZA0JDN25FMl95WjljeVZABN2pRcwZDZD
