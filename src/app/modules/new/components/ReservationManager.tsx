"use client";

import React, { Dispatch, SetStateAction } from "react";
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
import { Edit3, LogIn, LogOut, Trash2, Ban, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BookingBlock,
  BookingStatus,
  RoomCategoryGroup,
} from "../types/singleScreenDashboardTypes";
import { MONTH_NAMES, formatCurrency } from "../data/singleScreenDashboardData";
import {
  useReservations,
  BOOKING_SOURCES,
  PAYMENT_MODES,
  RoomDetail,
} from "../hooks/useReservations";

const STATUS_STYLES: Record<
  BookingStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  checkout: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    label: "Checkout",
  },
  ongoing: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    label: "Ongoing",
  },
  reservation: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    label: "Reservation",
  },
  housekeeping: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    label: "Housekeeping",
  },
  maintenance: {
    bg: "bg-gray-200",
    text: "text-gray-500",
    border: "border-gray-300",
    label: "Maintenance",
  },
  no_show: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    label: "No Show",
  },
  available: {
    bg: "bg-white",
    text: "text-gray-400",
    border: "border-gray-100",
    label: "Available",
  },
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isBeforeToday(date: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

interface ReservationManagerProps {
  sheetMode: "view" | "edit" | "new";
  /** From empty-cell flow: Reservation vs Booking CTA — affects new-form headings */
  newEntryKind?: "reservation" | "booking";
  selectedBooking: BookingBlock | null;
  setSelectedBooking: Dispatch<SetStateAction<BookingBlock | null>>;
  selectedRoomId: string;
  groups: RoomCategoryGroup[];
  setGroups: Dispatch<SetStateAction<RoomCategoryGroup[]>>;
  details: RoomDetail[];
  businessInfo: any;
  onClose: () => void;
  onModeChange: (mode: "view" | "edit" | "new") => void;
  onCheckInConfirmed?: () => void;
  showConfirmAction: (
    type: string,
    title: string,
    desc: string,
    onConfirm: () => void | Promise<void>,
  ) => void;
}

const ReservationManager: React.FC<ReservationManagerProps> = ({
  sheetMode,
  newEntryKind = "reservation",
  selectedBooking,
  setSelectedBooking,
  selectedRoomId,
  groups,
  setGroups,
  details,
  businessInfo,
  onClose,
  onModeChange,
  onCheckInConfirmed,
  showConfirmAction,
}) => {
  const {
    newResForm,
    setNewResForm,
    editForm,
    setEditForm,
    isResSubmitting,
    checkInPopoverOpen,
    setCheckInPopoverOpen,
    checkOutPopoverOpen,
    setCheckOutPopoverOpen,
    handleCreateReservation,
    handleSaveEdit,
    handleCancelBooking,
    handleDeleteBooking,
    handleCheckIn,
    handleCheckOut,
    handleNewResCheckInDate,
    handleNewResCheckOutDate,
    handleSwitchToEdit,
    getRoomNumberForSelected,
    getRoomForSelected,
    getRoomCategoryAndPrice,
  } = useReservations({
    groups,
    setGroups,
    selectedRoomId,
    selectedBooking,
    setSelectedBooking,
    details,
    businessInfo,
    onClose,
    onCheckInConfirmed,
    showConfirmAction,
  });

  console.log("selectedBooking", selectedBooking, details);

  const renderViewMode = () => {
    if (!selectedBooking) return null;
    const style = STATUS_STYLES[selectedBooking.status];
    return (
      <div className="flex flex-col gap-5 mt-2">
        {/* Status & Order */}
        <div className="flex items-center justify-between">
          <Badge
            className={`${style.bg} ${style.text} border ${style.border} text-xs px-3 py-1`}
          >
            {style.label}
          </Badge>
          <span className="font-mono text-sm text-gray-500">
            {selectedBooking.orderId}
          </span>
        </div>

        {/* Guest */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">
            {selectedBooking.guestName}
          </h3>
          {selectedBooking.phone && (
            <p className="text-sm text-gray-500">📞 {selectedBooking.phone}</p>
          )}
          {selectedBooking.email && (
            <p className="text-sm text-gray-500">✉️ {selectedBooking.email}</p>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Room
            </span>
            <p className="font-semibold mt-0.5">{getRoomNumberForSelected()}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              People
            </span>
            <p className="font-semibold mt-0.5">{selectedBooking.people}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Check-In
            </span>
            <p className="font-semibold mt-0.5">
              {selectedBooking.checkIn
                ? `${selectedBooking.checkIn.getDate()} ${MONTH_NAMES[selectedBooking.checkIn.getMonth()]}`
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Check-Out
            </span>
            <p className="font-semibold mt-0.5">
              {selectedBooking.checkOut
                ? `${selectedBooking.checkOut.getDate()} ${MONTH_NAMES[selectedBooking.checkOut.getMonth()]}`
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Nights
            </span>
            <p className="font-semibold mt-0.5">{selectedBooking.nights}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Amount
            </span>
            <p className="font-semibold mt-0.5">
              {formatCurrency(selectedBooking.amount)}
            </p>
          </div>
          {selectedBooking.bookingSource && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Source
              </span>
              <p className="font-semibold mt-0.5 capitalize">
                {selectedBooking.bookingSource}
              </p>
            </div>
          )}
          {selectedBooking.paymentStatus && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Payment
              </span>
              <p className="font-semibold mt-0.5 capitalize">
                {selectedBooking.paymentStatus}
              </p>
            </div>
          )}
          {selectedBooking.paymentMode && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Pay Mode
              </span>
              <p className="font-semibold mt-0.5 capitalize">
                {selectedBooking.paymentMode.replace(/_/g, " ")}
              </p>
            </div>
          )}
          {selectedBooking.attendant && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Attendant
              </span>
              <p className="font-semibold mt-0.5">
                {selectedBooking.attendant}
              </p>
            </div>
          )}
        </div>

        {selectedBooking.specialRequirements && (
          <>
            <hr className="border-gray-100" />
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Special Requirements
              </span>
              <p className="text-sm mt-1 text-gray-700">
                {selectedBooking.specialRequirements}
              </p>
            </div>
          </>
        )}

        <hr className="border-gray-100" />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2 justify-start"
            onClick={() => {
              handleSwitchToEdit();
              onModeChange("edit");
            }}
          >
            <Edit3 className="h-4 w-4" /> Edit Booking
          </Button>
          {selectedBooking.status === "reservation" && (
            <Button
              className="w-full gap-2 justify-start bg-green-600 hover:bg-green-700 text-white"
              onClick={handleCheckIn}
            >
              <LogIn className="h-4 w-4" /> Check In
            </Button>
          )}
          {selectedBooking.status === "ongoing" && (
            <Button
              className="w-full gap-2 justify-start bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCheckOut}
            >
              <LogOut className="h-4 w-4" /> Check Out
            </Button>
          )}
          {(selectedBooking.status === "reservation" ||
            selectedBooking.status === "ongoing") && (
            <Button
              variant="outline"
              className="w-full gap-2 justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={handleCancelBooking}
            >
              <Ban className="h-4 w-4" /> Cancel Booking
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full gap-2 justify-start text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDeleteBooking}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editForm) return null;
    return (
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Edit Booking</h3>
          <Badge className="font-mono text-xs">{editForm.orderId}</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Guest Name
            </Label>
            <Input
              value={editForm.guestName || ""}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, guestName: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500">
                Phone
              </Label>
              <Input
                value={editForm.phone || ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500">
                Email
              </Label>
              <Input
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500">
                People
              </Label>
              <Input
                type="number"
                min={1}
                value={editForm.people || 1}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    people: parseInt(e.target.value) || 1,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500">
                Amount
              </Label>
              <Input
                type="number"
                min={0}
                value={editForm.amount || 0}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    amount: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Status
            </Label>
            <Select
              value={editForm.status || "reservation"}
              onValueChange={(v) =>
                setEditForm((p) => ({ ...p, status: v as BookingStatus }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkout">Checkout</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="reservation">Reservation</SelectItem>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Special Requirements
            </Label>
            <Input
              value={editForm.specialRequirements || ""}
              onChange={(e) =>
                setEditForm((p) => ({
                  ...p,
                  specialRequirements: e.target.value,
                }))
              }
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onModeChange("view")}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderNewReservationForm = () => {
    const roomForEst = getRoomForSelected();
    const { roomPrice: estPrice } = getRoomCategoryAndPrice(
      roomForEst,
      details,
    );
    const estNights = selectedBooking?.nights ?? 1;
    const estTotal = estPrice * estNights;
    const checkInSel = selectedBooking?.checkIn;
    const checkOutSel = selectedBooking?.checkOut;

    const sourceLabel = (s: string) =>
      s === "walk_in" ? "Walk-in" : s.charAt(0).toUpperCase() + s.slice(1);

    const isNewBooking = newEntryKind === "booking";

    return (
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            {isNewBooking ? "New Booking" : "New Reservation"}
          </h3>
          <Badge variant="outline" className="text-xs">
            Room {getRoomNumberForSelected()}
          </Badge>
        </div>

        {/* Dates with inline calendars */}
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
              {estNights} night{estNights !== 1 ? "s" : ""} ·{" "}
              {formatCurrency(estPrice)}/night
            </span>
            <span className="font-semibold text-slate-900">
              Est. {formatCurrency(estTotal)}
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
                  setNewResForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="mt-1"
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
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isResSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => void handleCreateReservation()}
            disabled={
              isResSubmitting ||
              !newResForm.guestName.trim() ||
              !newResForm.bookingSource
            }
          >
            {isResSubmitting
              ? "Saving…"
              : isNewBooking
                ? "Create Booking"
                : "Create Reservation"}
          </Button>
        </div>
      </div>
    );
  };

  if (sheetMode === "new") return renderNewReservationForm();
  if (sheetMode === "edit") return renderEditForm();
  return renderViewMode();
};

export default ReservationManager;
