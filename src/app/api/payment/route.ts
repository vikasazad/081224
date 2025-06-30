// app/api/payment-link/route.ts

import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY as string,
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_API_SECRET as string,
});

export async function POST() {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: 1000,
      currency: "INR",
      accept_partial: true,
      first_min_partial_amount: 100,
      expire_by: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60 + 15 * 60,
      reference_id: "TS1989",
      description: "Payment for policy no #23456",
      customer: {
        name: "Gaurav Kumar",
        contact: "+919000090000",
        email: "gaurav.kumar@example.com",
      },
    });

    return NextResponse.json({ success: true, data: paymentLink });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error },
      { status: 500 }
    );
  }
}
