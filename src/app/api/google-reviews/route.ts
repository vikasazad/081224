import { NextResponse } from "next/server";

export async function GET() {
  try {
    const placeId = process.env.NEXT_PUBLIC_GOOELEMAP_PLACEID;
    const apiKey = process.env.GOOGLEMAP_KEY;
    console.log("placeId", placeId);
    console.log("apiKey", apiKey);

    if (!placeId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Google Maps API credentials" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=reviews&key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Revalidate every 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();

    // // Transform the reviews to match our message format

    return NextResponse.json({ reviews: data?.reviews || [] });
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google reviews" },
      { status: 500 }
    );
  }
}
