"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { toast } from "sonner";
import { BookingBlock } from "../types/singleScreenDashboardTypes";
import { newReservationToBooking } from "../../staff/utils/staffData";

function normalizePhoneDigits(raw: string | undefined): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.length >= 10) return d.slice(-10);
  return d;
}

function buildCheckInPayload(args: {
  selectedBooking: BookingBlock;
  selectedRoomId: string;
  roomNo: string;
  phoneDigits: string;
  verifiedAt: string;
}) {
  const { selectedBooking, selectedRoomId, roomNo, phoneDigits, verifiedAt } =
    args;
  const db = selectedBooking.dbReservation as
    | Record<string, unknown>
    | undefined;

  const guestsRaw = Array.isArray(db?.guests) ? db!.guests : [];
  const guests = (guestsRaw as Record<string, unknown>[]).map((g) => ({
    id: String(g.id ?? ""),
    name: String(g.name ?? ""),
    frontIdUrl: (g.frontIdUrl as string | null | undefined) ?? null,
    backIdUrl: (g.backIdUrl as string | null | undefined) ?? null,
  }));

  const bookingData = db ?? {
    bookingId: selectedBooking.id,
    name: selectedBooking.guestName,
    phone: phoneDigits,
    email: selectedBooking.email,
    checkIn: selectedBooking.checkIn,
    checkOut: selectedBooking.checkOut,
    nights: selectedBooking.nights,
    roomNo: selectedBooking.roomNo,
  };

  return {
    bookingId: selectedBooking.id,
    bookingData,
    phone: phoneDigits,
    guests,
    verifiedAt,
    selectedRoomId,
    roomNo,
  };
}

interface CheckInOtpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: BookingBlock | null;
  selectedRoomId: string;
  roomNo: string;
  onVerified?: () => void;
}

export function CheckInOtpSheet({
  open,
  onOpenChange,
  selectedBooking,
  selectedRoomId,
  roomNo,
  onVerified,
}: CheckInOtpSheetProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [timer, setTimer] = useState(30);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const sessionRef = useRef(0);

  const resetAll = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    setVerificationId("");
    setTimer(30);
    setIsOtpLoading(false);
    if (typeof window !== "undefined" && window.recaptchaVerifier?.clear) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        /* ignore */
      }
      window.recaptchaVerifier = undefined;
    }
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      sessionRef.current += 1;
      resetAll();
    }
    onOpenChange(next);
  };

  useEffect(() => {
    if (!open || !otpSent || timer <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [open, otpSent, timer]);

  const phoneDigits = normalizePhoneDigits(selectedBooking?.phone);
  const displayPhone =
    phoneDigits.length === 10
      ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
      : selectedBooking?.phone || "—";

  const handleSendOtp = async () => {
    if (!phoneDigits || phoneDigits.length !== 10) {
      toast.error("Guest needs a valid 10-digit phone number on the booking");
      return;
    }
    setIsOtpLoading(true);
    const started = sessionRef.current;
    try {
      const formattedNumber = `+91${phoneDigits}`;
      const phoneOtpRes = await authPhoneOtp(formattedNumber);
      if (started !== sessionRef.current) return;
      setVerificationId(phoneOtpRes.verificationId);
      setOtpSent(true);
      setTimer(30);
    } catch {
      /* toast in handleOtp */
    } finally {
      if (started === sessionRef.current) setIsOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phoneDigits || phoneDigits.length !== 10) return;
    setIsOtpLoading(true);
    const started = sessionRef.current;
    try {
      const formattedNumber = `+91${phoneDigits}`;
      const phoneOtpRes = await resendOtp(formattedNumber);
      if (started !== sessionRef.current) return;
      setVerificationId(phoneOtpRes.verificationId);
      setTimer(30);
    } catch {
      /* toast in handleOtp */
    } finally {
      if (started === sessionRef.current) setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!selectedBooking) return;
    const verifySession = sessionRef.current;
    setIsOtpLoading(true);
    try {
      await verifyOtp(verificationId, otp);
    } catch {
      if (verifySession === sessionRef.current) setIsOtpLoading(false);
      return;
    }
    if (verifySession !== sessionRef.current) return;

    const payload = buildCheckInPayload({
      selectedBooking,
      selectedRoomId,
      roomNo,
      phoneDigits,
      verifiedAt: new Date().toISOString(),
    });
    console.log(
      "Check-in OTP verified (payload for later booking conversion):",
      payload,
    );

    const res = await newReservationToBooking(payload);
    if (res) {
      toast.success("Reservation converted to booking successfully");
    } else {
      toast.error("Failed to convert reservation to booking");
    }

    sessionRef.current += 1;
    resetAll();
    setIsOtpLoading(false);
    onOpenChange(false);
    onVerified?.();
  };

  console.log("selectedBooking", selectedBooking, selectedRoomId);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-md w-[400px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Check-in verification</SheetTitle>
          <SheetDescription>
            {otpSent
              ? "Enter the OTP sent to the guest phone"
              : "Send an OTP to confirm check-in"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">OTP will be sent to</span>
            <p className="font-medium tabular-nums mt-0.5">{displayPhone}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Room {roomNo} · {selectedBooking?.guestName}
            </p>
          </div>

          {!otpSent ? (
            <Button
              className="w-full"
              onClick={handleSendOtp}
              disabled={isOtpLoading || phoneDigits.length !== 10}
            >
              {isOtpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  OTP
                </label>
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-lg tracking-widest"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                {timer > 0 ? (
                  <span className="text-muted-foreground">
                    Resend in {timer}s
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isOtpLoading}
                  >
                    Resend OTP
                  </Button>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={isOtpLoading || otp.length < 4}
              >
                {isOtpLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Verify & continue"
                )}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
