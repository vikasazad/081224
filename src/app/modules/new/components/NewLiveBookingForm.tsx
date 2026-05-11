"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, IndianRupee, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { findCoupon, saveRoomData } from "../../staff/utils/staffData";
import { calculateTax } from "../../staff/utils/clientside";
import {
  BookingBlock,
  GridRoom,
  RoomCategoryGroup,
} from "../types/singleScreenDashboardTypes";
import { MONTH_NAMES, formatCurrency } from "../data/singleScreenDashboardData";
import {
  BOOKING_SOURCES,
  PAYMENT_MODES,
  NewResFormState,
  RoomDetail,
} from "../hooks/useReservations";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isBeforeToday(date: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

function resolveRoomNo(room: GridRoom): string {
  const direct = String(room.roomNo ?? "").trim();
  if (direct) return direct;
  const id = String(room.id ?? "").trim();
  if (!id) return "";
  const stripped = id.replace(/^room-/i, "").trim();
  return stripped || id;
}

interface NewLiveBookingFormProps {
  selectedBooking: BookingBlock;
  setSelectedBooking: Dispatch<SetStateAction<BookingBlock | null>>;
  selectedRoomId: string;
  groups: RoomCategoryGroup[];
  details: RoomDetail[];
  businessInfo: any;
  onClose: () => void;
  onBookingSaved?: () => void | Promise<void>;
}

export function NewLiveBookingForm({
  selectedBooking,
  setSelectedBooking,
  selectedRoomId,
  groups,
  details,
  businessInfo,
  onClose,
  onBookingSaved,
}: NewLiveBookingFormProps) {
  const gstTax = businessInfo?.gstTax;
  const [newResForm, setNewResForm] = useState<NewResFormState>({
    guestName: "",
    phone: "",
    email: "",
    people: 1,
    bookingSource: "",
    paymentMode: "cash",
    specialRequirements: "",
  });

  const [checkInPopoverOpen, setCheckInPopoverOpen] = useState(false);
  const [checkOutPopoverOpen, setCheckOutPopoverOpen] = useState(false);

  const [coupon, setCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [discount, setDiscount] = useState(0);

  const [nights, setNights] = useState(1);
  const [subtotal, setSubtotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [taxDetails, setTaxDetails] = useState({
    gstAmount: 0,
    gstPercentage: 0,
    cgstAmount: 0,
    cgstPercentage: 0,
    sgstAmount: 0,
    sgstPercentage: 0,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [couponLoading, setCouponLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const sessionRef = useRef(0);

  const getRoomForSelected = useCallback((): GridRoom | null => {
    for (const g of groups) {
      const room = g.rooms.find((r) => r.id === selectedRoomId);
      if (room) return room;
    }
    return null;
  }, [groups, selectedRoomId]);

  const getRoomNumberForSelected = useCallback(() => {
    const room = getRoomForSelected();
    return room ? resolveRoomNo(room) : selectedRoomId;
  }, [getRoomForSelected, selectedRoomId]);

  const getRoomCategoryAndPrice = useCallback(
    (room: GridRoom | null, detailsList: RoomDetail[]) => {
      if (!room) return { roomCategory: "", roomPrice: 0 };
      if (!detailsList?.length) {
        return {
          roomCategory: room.categoryName,
          roomPrice: room.pricePerNight,
        };
      }
      const exact = detailsList.find((d) => d.category === room.categoryName);
      if (exact)
        return {
          roomCategory: exact?.category,
          roomPrice: exact?.price,
          amenities: exact?.amenities,
          images: exact?.images,
        };
      const partial = detailsList.find(
        (d) =>
          room.categoryName.toLowerCase().includes(d.category.toLowerCase()) ||
          d.category
            .toLowerCase()
            .includes(room.categoryName.split(/[\s-]+/)[0]!.toLowerCase()),
      );
      if (partial)
        return {
          roomCategory: partial.category,
          roomPrice: partial.price,
          amenities: partial.amenities,
          images: partial.images,
        };
      return {
        roomCategory: room.categoryName,
        roomPrice: room.pricePerNight,
        amenities: room.amenities,
        images: room.images,
      };
    },
    [],
  );

  const roomForEst = getRoomForSelected();
  const {
    roomPrice: pricePerNight,
    roomCategory,
    amenities,
    images,
  } = getRoomCategoryAndPrice(roomForEst, details);

  useEffect(() => {
    if (!gstTax || !selectedBooking?.checkIn || !selectedBooking?.checkOut) {
      return;
    }
    const ci = startOfDay(selectedBooking.checkIn);
    const co = startOfDay(selectedBooking.checkOut);
    let n = Math.ceil((co.getTime() - ci.getTime()) / 86400000);
    if (n <= 0) n = 1;
    const baseSubtotal = pricePerNight * n;
    const afterDiscount = Math.max(0, baseSubtotal - discount);
    const td = calculateTax(pricePerNight, afterDiscount, "room", gstTax);
    setNights(n);
    setSubtotal(afterDiscount);
    setTotalPrice(afterDiscount + td.gstAmount);
    setTaxDetails(td);
  }, [
    selectedBooking?.checkIn,
    selectedBooking?.checkOut,
    pricePerNight,
    gstTax,
    discount,
  ]);

  const handleNewResCheckInDate = (d: Date | undefined) => {
    if (!d || !selectedBooking) return;
    const nd = startOfDay(d);
    if (isBeforeToday(nd)) {
      toast.error("Bookings can only start today or in the future.");
      return;
    }
    let co = startOfDay(selectedBooking.checkOut);
    if (co <= nd) {
      co = new Date(nd);
      co.setDate(co.getDate() + 1);
    }
    const n = Math.max(1, Math.ceil((co.getTime() - nd.getTime()) / 86400000));
    setCoupon(null);
    setDiscount(0);
    setSelectedBooking({
      ...selectedBooking,
      checkIn: nd,
      checkOut: co,
      nights: n,
    });
    setCheckInPopoverOpen(false);
  };

  const handleNewResCheckOutDate = (d: Date | undefined) => {
    if (!d || !selectedBooking) return;
    const nd = startOfDay(d);
    const ci = startOfDay(selectedBooking.checkIn);
    if (isBeforeToday(nd)) {
      toast.error("Check-out cannot be in the past.");
      return;
    }
    if (nd <= ci) {
      toast.error("Check-out must be after check-in");
      return;
    }
    const n = Math.max(1, Math.ceil((nd.getTime() - ci.getTime()) / 86400000));
    setCoupon(null);
    setDiscount(0);
    setSelectedBooking({
      ...selectedBooking,
      checkOut: nd,
      nights: n,
    });
    setCheckOutPopoverOpen(false);
  };

  const handleCouponApply = async () => {
    if (!couponInput.trim() || !gstTax) {
      if (!gstTax) toast.error("Tax settings unavailable");
      return;
    }
    if (!selectedBooking.checkIn || !selectedBooking.checkOut) return;
    const ci = startOfDay(selectedBooking.checkIn);
    const co = startOfDay(selectedBooking.checkOut);
    let n = Math.ceil((co.getTime() - ci.getTime()) / 86400000);
    if (n <= 0) n = 1;

    setCouponLoading(true);
    const couponCode = couponInput.trim().toUpperCase();
    const couponResult = await findCoupon(couponCode);
    if (couponResult) {
      const baseTotal = pricePerNight * n;
      let calculatedDiscount = 0;
      if (couponResult.type === "percentage") {
        const percentageAmount = parseFloat(String(couponResult.discount));
        calculatedDiscount = baseTotal * (percentageAmount / 100);
      } else {
        calculatedDiscount = Number(couponResult.discount) || 0;
      }
      setCoupon(couponResult);
      setDiscount(calculatedDiscount);
      setCouponInput("");
      toast.success(
        `Coupon applied! You saved ₹${calculatedDiscount.toLocaleString()}`,
      );
    } else {
      toast.error("Invalid coupon code");
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscount(0);
    toast.success("Coupon removed");
  };

  const validateBeforeOtp = () => {
    if (!newResForm.guestName.trim()) {
      toast.error("Guest name is required");
      return false;
    }
    const phoneDigits = newResForm.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(phoneDigits)) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }
    if (newResForm.email.trim() && !/\S+@\S+\.\S+/.test(newResForm.email)) {
      toast.error("Invalid email address");
      return false;
    }
    if (!newResForm.bookingSource) {
      toast.error("Select booking source");
      return false;
    }
    if (!selectedBooking.checkIn || !selectedBooking.checkOut) {
      toast.error("Check-in and check-out dates are required");
      return false;
    }
    if (!roomForEst || !roomCategory) {
      toast.error("Could not resolve room");
      return false;
    }
    if (!gstTax) {
      toast.error("Tax / business settings unavailable");
      return false;
    }
    return true;
  };

  const resetOtpUi = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    setVerificationId("");
    setOtpTimer(30);
    if (typeof window !== "undefined" && window.recaptchaVerifier?.clear) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        /* ignore */
      }
      window.recaptchaVerifier = undefined;
    }
  }, []);

  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpSent, otpTimer]);

  const handleCreateSendOtp = async () => {
    if (!validateBeforeOtp()) return;
    const phoneDigits = newResForm.phone.replace(/\D/g, "").slice(-10);
    setActionLoading(true);
    const started = sessionRef.current;
    try {
      const formatted = `+91${phoneDigits}`;
      setFormattedPhone(formatted);
      const res = await authPhoneOtp(formatted);
      if (started !== sessionRef.current) return;
      setVerificationId(res.verificationId);
      setOtpSent(true);
      setOtpTimer(30);
    } catch {
      /* toast in handleOtp */
    } finally {
      if (started === sessionRef.current) setActionLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formattedPhone) return;
    setActionLoading(true);
    const started = sessionRef.current;
    try {
      const res = await resendOtp(formattedPhone);
      if (started !== sessionRef.current) return;
      setVerificationId(res.verificationId);
      setOtpTimer(30);
    } catch {
      /* toast in handleOtp */
    } finally {
      if (started === sessionRef.current) setActionLoading(false);
    }
  };

  const handleVerifyAndSave = async () => {
    if (!roomForEst || !selectedBooking.checkIn || !selectedBooking.checkOut) {
      return;
    }
    const verifySession = sessionRef.current;
    setActionLoading(true);
    try {
      await verifyOtp(verificationId, otp);
    } catch {
      if (verifySession === sessionRef.current) setActionLoading(false);
      return;
    }
    if (verifySession !== sessionRef.current) return;

    const phoneDigits = newResForm.phone.replace(/\D/g, "").slice(-10);
    const resolvedRoomNo = resolveRoomNo(roomForEst);

    const roomInfo = {
      name: newResForm.guestName.trim(),
      email: newResForm.email.trim() || "",
      phone: phoneDigits,
      address: "",
      notificationToken: "",
      checkIn: new Date(selectedBooking.checkIn).toISOString(),
      checkOut: new Date(selectedBooking.checkOut).toISOString(),
      numberOfGuests: String(newResForm.people),
      numberOfRooms: "1",
      roomNo: resolvedRoomNo,
      roomType: roomCategory,
      price: pricePerNight,
      nights,
      subtotal,
      totalPrice,
      gstAmount: taxDetails.gstAmount,
      gstPercentage: taxDetails.gstPercentage,
      cgstAmount: taxDetails.cgstAmount,
      cgstPercentage: taxDetails.cgstPercentage,
      sgstAmount: taxDetails.sgstAmount,
      sgstPercentage: taxDetails.sgstPercentage,
      paymentMode: newResForm.paymentMode,
      paymentId: `dashboard-booking-${Date.now()}`,
      inclusions: amenities || [],
      images: images || [],
      specialRequirements: newResForm.specialRequirements.trim() || "",

      discount:
        coupon?.type.trim() !== ""
          ? [
              {
                type: coupon?.type || "",
                amount: coupon?.discount ?? "",
                code: coupon?.code || "",
                discount: discount || 0,
              },
            ]
          : [],
      priceAfterDiscount: coupon?.type ? subtotal : "",
    };

    const ok = await saveRoomData(roomInfo);
    sessionRef.current += 1;
    resetOtpUi();
    setActionLoading(false);

    if (ok) {
      toast.success("Booking created successfully");
      await onBookingSaved?.();
      onClose();
    } else {
      toast.error("Failed to save booking");
    }
  };

  const checkInSel = selectedBooking.checkIn;
  const checkOutSel = selectedBooking.checkOut;
  const sourceLabel = (s: string) =>
    s === "walk_in" ? "Walk-in" : s.charAt(0).toUpperCase() + s.slice(1);

  const baseSubtotalBeforeCoupon = pricePerNight * nights;

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div id="recaptcha-container" className="sr-only" aria-hidden />

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">New Booking</h3>
        <Badge variant="outline" className="text-xs">
          Room {getRoomNumberForSelected()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50/80 rounded-xl border border-blue-100/80">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">
            Check-In
          </span>
          <Popover
            open={checkInPopoverOpen}
            onOpenChange={setCheckInPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-lg border border-blue-200/80 bg-white px-2.5 py-2 text-left text-sm font-semibold text-slate-900 shadow-sm hover:bg-blue-50/50 transition-colors",
                )}
              >
                <span>
                  {checkInSel
                    ? `${checkInSel.getDate()} ${MONTH_NAMES[checkInSel.getMonth()]}, ${checkInSel.getFullYear()}`
                    : "—"}
                </span>
                <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkInSel}
                onSelect={handleNewResCheckInDate}
                disabled={(date) => isBeforeToday(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">
            Check-Out
          </span>
          <Popover
            open={checkOutPopoverOpen}
            onOpenChange={setCheckOutPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-lg border border-blue-200/80 bg-white px-2.5 py-2 text-left text-sm font-semibold text-slate-900 shadow-sm hover:bg-blue-50/50 transition-colors",
                )}
              >
                <span>
                  {checkOutSel
                    ? `${checkOutSel.getDate()} ${MONTH_NAMES[checkOutSel.getMonth()]}, ${checkOutSel.getFullYear()}`
                    : "—"}
                </span>
                <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOutSel}
                onSelect={handleNewResCheckOutDate}
                disabled={(date) => {
                  const t = startOfDay(date);
                  const ci = checkInSel
                    ? startOfDay(checkInSel)
                    : startOfDay(new Date());
                  if (isBeforeToday(ci)) return true;
                  return t <= ci || isBeforeToday(t);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-2 flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-blue-100/80">
          <span>
            {nights} night{nights !== 1 ? "s" : ""} ·{" "}
            {formatCurrency(pricePerNight)}/night
          </span>
          <span className="font-semibold text-slate-900">
            Subtotal {formatCurrency(baseSubtotalBeforeCoupon)}
          </span>
        </div>
      </div>

      {/* Coupon + payment summary */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">To pay (incl. tax)</span>
          <span className="font-semibold flex items-center gap-0.5 tabular-nums">
            <IndianRupee className="h-3.5 w-3.5" />
            {Math.round(totalPrice)}
          </span>
        </div>
        {coupon ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-2 text-xs">
            <span>
              <span className="font-semibold text-emerald-700">
                {coupon.code}
              </span>
              <span className="text-emerald-600"> · saved ₹{discount}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={removeCoupon}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="h-9"
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={couponLoading || !couponInput.trim()}
              onClick={() => void handleCouponApply()}
            >
              {couponLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground border-t border-slate-200/80 pt-2">
          <span>Subtotal (after discount)</span>
          <span className="text-right tabular-nums text-slate-800">
            ₹{Math.round(subtotal)}
          </span>
          <span>GST</span>
          <span className="text-right tabular-nums text-slate-800">
            ₹{Math.round(taxDetails.gstAmount ?? 0)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs uppercase tracking-wide text-gray-500">
            Guest Name *
          </Label>
          <Input
            placeholder="Enter guest name"
            value={newResForm.guestName}
            onChange={(e) =>
              setNewResForm((p) => ({ ...p, guestName: e.target.value }))
            }
            className="mt-1"
            disabled={otpSent}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Phone *
            </Label>
            <Input
              placeholder="10-digit mobile"
              inputMode="numeric"
              value={newResForm.phone}
              onChange={(e) =>
                setNewResForm((p) => ({
                  ...p,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              className="mt-1"
              disabled={otpSent}
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Email
            </Label>
            <Input
              placeholder="guest@email.com"
              value={newResForm.email}
              onChange={(e) =>
                setNewResForm((p) => ({ ...p, email: e.target.value }))
              }
              className="mt-1"
              disabled={otpSent}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Guests
            </Label>
            <Input
              type="number"
              min={1}
              value={newResForm.people}
              onChange={(e) =>
                setNewResForm((p) => ({
                  ...p,
                  people: parseInt(e.target.value, 10) || 1,
                }))
              }
              className="mt-1"
              disabled={otpSent}
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Payment
            </Label>
            <Select
              value={newResForm.paymentMode}
              onValueChange={(v) =>
                setNewResForm((p) => ({
                  ...p,
                  paymentMode: v as (typeof PAYMENT_MODES)[number],
                }))
              }
              disabled={otpSent}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Payment mode" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-gray-500">
            Booking Source *
          </Label>
          <Select
            value={newResForm.bookingSource || undefined}
            onValueChange={(v) =>
              setNewResForm((p) => ({
                ...p,
                bookingSource: v as (typeof BOOKING_SOURCES)[number],
              }))
            }
            disabled={otpSent}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {sourceLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-gray-500">
            Special Requirements
          </Label>
          <Input
            placeholder="Any special requests..."
            value={newResForm.specialRequirements}
            onChange={(e) =>
              setNewResForm((p) => ({
                ...p,
                specialRequirements: e.target.value,
              }))
            }
            className="mt-1"
            disabled={otpSent}
          />
        </div>
      </div>

      {!otpSent ? (
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => void handleCreateSendOtp()}
            disabled={
              actionLoading ||
              !newResForm.guestName.trim() ||
              !newResForm.bookingSource
            }
          >
            {actionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Create booking"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Enter the OTP sent to{" "}
            <span className="font-medium text-foreground tabular-nums">
              +91 {newResForm.phone.replace(/\D/g, "").slice(-10).slice(0, 5)}{" "}
              {newResForm.phone.replace(/\D/g, "").slice(-10).slice(5)}
            </span>
          </p>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              OTP
            </Label>
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
            {otpTimer > 0 ? (
              <span className="text-muted-foreground">
                Resend in {otpTimer}s
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => void handleResendOtp()}
                disabled={actionLoading}
              >
                Resend OTP
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              disabled={actionLoading}
              onClick={() => {
                sessionRef.current += 1;
                resetOtpUi();
              }}
            >
              Edit details
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              type="button"
              onClick={() => void handleVerifyAndSave()}
              disabled={actionLoading || otp.length < 4}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify & save"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewLiveBookingForm;
