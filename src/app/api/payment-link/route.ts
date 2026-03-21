import { NextRequest, NextResponse } from "next/server";
import { generatePaymentLink } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price, description, customerName, customerContact, customerEmail } =
      body;

    // Validate price
    if (!price || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid price. Must be a positive number." },
        { status: 400 }
      );
    }

    const paymentLinkResponse = await generatePaymentLink(price, {
      description,
      customerName,
      customerContact,
      customerEmail,
    });

    return NextResponse.json({
      success: true,
      paymentLink: paymentLinkResponse.short_url,
      data: paymentLinkResponse,
    });
  } catch (error) {
    console.error("Payment link generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate payment link",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
