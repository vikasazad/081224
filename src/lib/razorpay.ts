import "server-only";
import Razorpay from "razorpay";
import { updateReservationPaymentStatus } from "@/app/modules/staff/utils/staffData";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY as string,
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_API_SECRET as string,
});

interface PaymentLinkOptions {
  description?: string;
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
  businessEmail?: string;
  referenceId?: string;
  expireInDays?: number;
  paymentFor?: string;
  notes?: {
    businessEmail?: string;
    paymentFor?: string;
  };
}

interface PaymentLinkResponse {
  id: string;
  short_url: string;
  amount: number;
  currency: string;
  status: string;
  [key: string]: unknown;
}

/**
 * Generates a Razorpay payment link for the given price
 * @param priceInRupees - The price in INR (rupees)
 * @param options - Optional configuration for the payment link
 * @returns The Razorpay payment link response including short_url
 */
export async function generatePaymentLink(
  priceInRupees: number,
  options: PaymentLinkOptions = {}
): Promise<PaymentLinkResponse> {
  const {
    description ,
    customerName,
    customerContact,
    customerEmail,
    businessEmail,
    paymentFor,
    referenceId,
    expireInDays,
  } = options;

  // Convert rupees to paise (Razorpay expects amount in smallest currency unit)
  const amountInPaise = Math.round(priceInRupees * 100);

  // Calculate expiry timestamp
  const expireBy =
    Math.floor(Date.now() / 1000) + (expireInDays || 1) * 24 * 60 * 60;

  const paymentLinkData: {
    amount: number;
    currency: string;
    description: string;
    reference_id: string;
    expire_by: number;
    customer?: {
      name?: string;
      contact?: string;
      email?: string;
    };
    notes: {
      businessEmail: string;
      paymentFor: string;
    };
  } = {
    amount: amountInPaise,
    currency: "INR",
    description: description || "",
    reference_id: referenceId || "",
    expire_by: expireBy,
    notes: {
      businessEmail: businessEmail || "",
      paymentFor: paymentFor || "",
    },
  };

  // Add customer info if provided
  if (customerName || customerContact || customerEmail) {
    paymentLinkData.customer = {};
    if (customerName) paymentLinkData.customer.name = customerName;
    if (customerContact) paymentLinkData.customer.contact = customerContact;
    if (customerEmail) paymentLinkData.customer.email = customerEmail;
  }

  const paymentLink = await razorpay.paymentLink.create(
    paymentLinkData as Parameters<typeof razorpay.paymentLink.create>[0]
  );

  return paymentLink as unknown as PaymentLinkResponse;
}

export async function getPaymentLinkStatus(details: any) {
  const paymentLink = await razorpay.paymentLink.fetch(details.paymentLinkId);
  // return {
  //   paymentId: paymentLink.id,
  //   status: paymentLink.status, // "created" | "paid" | "cancelled" | "expired"
  //   amountPaid: paymentLink.amount_paid,
  // };
  if (paymentLink.status === "paid") {
    await updateReservationPaymentStatus({
      paymentLinkId: details.paymentLinkId,
      referenceId: details.referenceId,
      amount: details.amount, // Convert paise to rupees
      paymentId: details.paymentId,
      email: details.email,
      contact: details.contact,
      businessEmail: details.businessEmail,
      paymentFor: details.paymentFor,
    });
  }
  // console.log("paymentLinkId", details);
}
