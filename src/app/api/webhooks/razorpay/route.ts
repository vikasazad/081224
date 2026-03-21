import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateReservationPaymentStatus } from "@/app/modules/staff/utils/staffData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET as string
      )
      .update(body)
      .digest("hex");

    // console.log("signature", JSON.parse(body));

    if (signature !== expectedSignature) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event: any = JSON.parse(body);

    console.log("Razorpay webhook event:", event.event);

    // Handle payment_link.paid event
    if (event.event === "payment_link.paid") {
      const paymentLink = event.payload.payment_link.entity;
      const payment = event.payload.payment.entity;
      // console.log("payment", event.payload);


      await updateReservationPaymentStatus({
        paymentLinkId: paymentLink.id,
        referenceId: paymentLink.reference_id,
        amount: payment.amount / 100, // Convert paise to rupees
        paymentId: payment.id,
        email: paymentLink.customer.email,
        contact: paymentLink.customer.contact,
        businessEmail: payment.notes.businessEmail,
        paymentFor: payment.notes.paymentFor,
      });

      // console.log("Payment successful!", {
      //   paymentLinkId: paymentLink.id,
      //   referenceId: paymentLink.reference_id,
      //   amount: payment.amount / 100, // Convert paise to rupees
      //   paymentId: payment.id,
      //   email: payment.email,
      //   contact: payment.contact,
      //   businessEmail: payment.notes.businessEmail,
      // });

      // TODO: Update your database (e.g., mark booking as paid)
      // Example: await updateBookingPaymentStatus(paymentLink.reference_id, "paid");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
