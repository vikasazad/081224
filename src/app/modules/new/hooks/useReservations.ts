import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  addReservation,
  removeReservationById,
  updateReservation,
} from "../../staff/utils/staffData";
import {
  BookingBlock,
  GridRoom,
  RoomCategoryGroup,
} from "../types/singleScreenDashboardTypes";

const BOOKING_SOURCES = ["phone", "agent", "walk_in"] as const;
const PAYMENT_MODES = ["online", "cash", "upi", "card"] as const;

export type BookingSourceType = (typeof BOOKING_SOURCES)[number] | "";
export type PaymentModeType = (typeof PAYMENT_MODES)[number];

export interface NewResFormState {
  guestName: string;
  phone: string;
  email: string;
  people: number;
  bookingSource: BookingSourceType;
  paymentMode: PaymentModeType;
  specialRequirements: string;
}

export interface RoomDetail {
  category: string;
  price: number;
  rooms: number;
  amenities: string[];
  images: string[];
}

interface UseReservationsProps {
  groups: RoomCategoryGroup[];
  setGroups: Dispatch<SetStateAction<RoomCategoryGroup[]>>;
  selectedRoomId: string;
  selectedBooking: BookingBlock | null;
  setSelectedBooking: Dispatch<SetStateAction<BookingBlock | null>>;
  details: RoomDetail[];
  businessInfo: any;
  onClose: () => void;
  /** After AlertDialog confirms check-in, opens OTP sheet (parent); do not close main sheet here */
  onCheckInConfirmed?: () => void;
  showConfirmAction: (
    type: string,
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
  ) => void;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isBeforeToday(date: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

function generateRandomOrderNumber() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function resolveRoomNo(room: GridRoom): string {
  const direct = String(room.roomNo ?? "").trim();
  if (direct) return direct;
  const id = String(room.id ?? "").trim();
  if (!id) return "";
  const stripped = id.replace(/^room-/i, "").trim();
  return stripped || id;
}

export function useReservations({
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
}: UseReservationsProps) {
  // Form state
  const [newResForm, setNewResForm] = useState<NewResFormState>({
    guestName: "",
    phone: "",
    email: "",
    people: 1,
    bookingSource: "",
    paymentMode: "online",
    specialRequirements: "",
  });
  const [isResSubmitting, setIsResSubmitting] = useState(false);
  const [checkInPopoverOpen, setCheckInPopoverOpen] = useState(false);
  const [checkOutPopoverOpen, setCheckOutPopoverOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<BookingBlock>>({});

  // Helper functions
  const getRoomNumberForSelected = useCallback(() => {
    for (const g of groups) {
      const room = g.rooms.find((r) => r.id === selectedRoomId);
      if (room) return resolveRoomNo(room);
    }
    return selectedRoomId;
  }, [groups, selectedRoomId]);

  const getRoomForSelected = useCallback((): GridRoom | null => {
    for (const g of groups) {
      const room = g.rooms.find((r) => r.id === selectedRoomId);
      if (room) return room;
    }
    return null;
  }, [groups, selectedRoomId]);

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
          roomCategory: exact.category,
          roomPrice: exact.price,
          amenities: exact.amenities,
          images: exact.images,
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

  // Handler: Switch to edit mode
  const handleSwitchToEdit = useCallback(() => {
    if (selectedBooking) {
      setEditForm({ ...selectedBooking });
    }
  }, [selectedBooking]);

  // Handler: Save edit
  const handleSaveEdit = useCallback(async () => {
    const db = editForm.dbReservation ?? selectedBooking?.dbReservation ?? null;

    let updatedGuests = db?.guests ? [...(db?.guests as any)] : [];

    const currentCount = updatedGuests.length;
    const newCount = Number(editForm.people);

    if (newCount !== currentCount) {
      if (newCount > currentCount) {
        const toAdd = newCount - currentCount;
        for (let i = 0; i < toAdd; i++) {
          updatedGuests.push({
            id: `G${currentCount + i + 1}`,
            name: `Guest${currentCount + i + 1}`,
          });
        }
      } else if (newCount < currentCount) {
        updatedGuests = updatedGuests.slice(0, newCount);
      }
    }

    const data = {
      ...db,
      name: editForm.guestName,
      phone: editForm.phone,
      email: editForm.email,
      people: editForm.people,
      price: editForm.amount,
      status: editForm.status,
      specialRequirements: editForm.specialRequirements,
      createdAt: new Date().toISOString(),
      guests: updatedGuests,
    };
    const res = await updateReservation(data);
    if (res) {
      toast.success("Reservation updated successfully");
    } else {
      toast.error("Failed to update reservation");
    }
    onClose();
  }, [selectedBooking, editForm, onClose]);

  // Handler: Check-in → confirm dialog → parent opens OTP sheet
  const handleCheckIn = useCallback(() => {
    const roomNo = getRoomNumberForSelected();
    showConfirmAction(
      "checkin",
      "Confirm Check-In",
      `Check in ${selectedBooking?.guestName} to Room ${roomNo}?`,
      () => {
        onCheckInConfirmed?.();
      },
    );
  }, [
    selectedBooking,
    showConfirmAction,
    onCheckInConfirmed,
    getRoomNumberForSelected,
  ]);

  // Handler: Check-out
  const handleCheckOut = useCallback(() => {
    showConfirmAction(
      "checkout",
      "Confirm Check-Out",
      `Check out ${selectedBooking?.guestName} from Room ${selectedRoomId}?`,
      () => {
        console.log("Check-Out:", {
          bookingId: selectedBooking?.id,
          guest: selectedBooking?.guestName,
          room: selectedRoomId,
        });
        onClose();
      },
    );
  }, [selectedBooking, selectedRoomId, showConfirmAction, onClose]);

  // Handler: Cancel booking
  const handleCancelBooking = useCallback(() => {
    showConfirmAction(
      "cancel",
      "Cancel Booking",
      `Are you sure you want to cancel booking ${selectedBooking?.orderId} for ${selectedBooking?.guestName}?`,
      async () => {
        if (!selectedBooking?.id) {
          toast.error("Reservation ID is required");
          return;
        }
        const res = await removeReservationById(selectedBooking?.id);
        if (res) {
          toast.success("Reservation cancelled successfully");
        } else {
          toast.error("Failed to cancel reservation");
        }
        onClose();
      },
    );
  }, [selectedBooking, showConfirmAction, onClose]);

  // Handler: Delete booking
  const handleDeleteBooking = useCallback(() => {
    showConfirmAction(
      "delete",
      "Delete Booking",
      `This action cannot be undone. Delete booking ${selectedBooking?.orderId}?`,
      async () => {
        if (!selectedBooking?.id) {
          toast.error("Reservation ID is required");
          return;
        }
        const res = await removeReservationById(selectedBooking?.id);
        if (res) {
          toast.success("Reservation deleted successfully");
        } else {
          toast.error("Failed to delete reservation");
        }
        onClose();
      },
    );
  }, [selectedBooking, showConfirmAction, onClose]);

  // Handler: Create new reservation
  const handleCreateReservation = useCallback(async () => {
    const room = getRoomForSelected();
    if (!room || !selectedBooking) {
      toast.error("Room is not selected");
      return;
    }
    if (!newResForm.guestName.trim()) {
      toast.error("Guest name is required");
      return;
    }
    const phoneDigits = newResForm.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(phoneDigits)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (newResForm.email.trim() && !/\S+@\S+\.\S+/.test(newResForm.email)) {
      toast.error("Invalid email address");
      return;
    }
    if (!newResForm.bookingSource) {
      toast.error("Select booking source");
      return;
    }
    if (!selectedBooking.checkIn || !selectedBooking.checkOut) {
      toast.error("Check-in and check-out dates are required");
      return;
    }

    const checkInDate = new Date(selectedBooking.checkIn);
    if (isBeforeToday(checkInDate)) {
      toast.error("Reservations can only be made for today or future dates.");
      return;
    }

    const { roomCategory, roomPrice, amenities, images } =
      getRoomCategoryAndPrice(room, details);
    if (!roomCategory) {
      toast.error("Could not resolve room category");
      return;
    }

    const checkOutDate = new Date(selectedBooking.checkOut);
    let nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (nights <= 0) nights = Math.max(1, selectedBooking.nights);

    const numberOfGuests = newResForm.people;
    const numberOfRooms = 1;
    const guests: { id: string; name: string }[] = [];
    for (let i = 1; i <= numberOfGuests; i++) {
      const guestId = `G${i.toString().padStart(2, "0")}`;
      const guestName =
        i === 1
          ? newResForm.guestName.trim()
          : `Guest${i.toString().padStart(2, "0")}`;
      guests.push({ id: guestId, name: guestName });
    }

    const dateStr = new Date()
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replaceAll("/", "");
    const bookingId = `RES:${dateStr}:${generateRandomOrderNumber()}`;
    const totalAmount = roomPrice * nights * numberOfRooms;
    const resolvedRoomNo = resolveRoomNo(room);

    const reservationData = {
      name: newResForm.guestName.trim(),
      phone: phoneDigits,
      email: newResForm.email.trim() || "",
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      numberOfGuests: String(numberOfGuests),
      roomCategory,
      roomNo: resolvedRoomNo,
      numberOfRooms,
      paymentMode: newResForm.paymentMode,
      bookingId,
      guests,
      nights,
      roomPrice,
      totalAmount,
      people: numberOfGuests || "",
      createdAt: new Date().toISOString(),
      status: "pending",
      businessInfo: businessInfo || {},
      specialRequirements: newResForm.specialRequirements.trim() || "",
      inclusions: amenities || [],
      images: images || [],
    };

    // console.log("reservationData", reservationData);

    setIsResSubmitting(true);
    try {
      const response = await addReservation(reservationData);
      if (response) {
        const newBlock: BookingBlock = {
          id: bookingId,
          orderId: bookingId,
          guestName: newResForm.guestName.trim(),
          phone: phoneDigits,
          email: newResForm.email.trim() || "",
          people: numberOfGuests,
          nights,
          amount: totalAmount,
          status: "reservation",
          roomNo: resolvedRoomNo,
          checkIn: startOfDay(checkInDate),
          checkOut: startOfDay(checkOutDate),
          bookingSource:
            newResForm.bookingSource as BookingBlock["bookingSource"],
          paymentStatus: "pending",
          paymentMode: newResForm.paymentMode as BookingBlock["paymentMode"],
          specialRequirements: newResForm.specialRequirements.trim() || "",
          inclusions: amenities || [],
          images: images || [],
        };
        setGroups((prev) =>
          prev.map((group) => ({
            ...group,
            rooms: group.rooms.map((r) =>
              r.id === selectedRoomId
                ? { ...r, bookings: [...r.bookings, newBlock] }
                : r,
            ),
          })),
        );
        toast.success("Reservation added successfully");
        setCheckInPopoverOpen(false);
        setCheckOutPopoverOpen(false);
        onClose();
      } else {
        toast.error("Failed to add reservation");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to add reservation");
    } finally {
      setIsResSubmitting(false);
    }
  }, [
    getRoomForSelected,
    getRoomCategoryAndPrice,
    selectedBooking,
    newResForm,
    details,
    businessInfo,
    selectedRoomId,
    setGroups,
    onClose,
  ]);

  // Handler: Check-in date change
  const handleNewResCheckInDate = useCallback(
    (d: Date | undefined) => {
      if (!d || !selectedBooking) return;
      const nd = startOfDay(d);
      if (isBeforeToday(nd)) {
        toast.error("Reservations can only be made for today or future dates.");
        return;
      }
      let co = startOfDay(selectedBooking.checkOut);
      if (co <= nd) {
        co = new Date(nd);
        co.setDate(co.getDate() + 1);
      }
      const nights = Math.max(
        1,
        Math.ceil((co.getTime() - nd.getTime()) / 86400000),
      );
      setSelectedBooking({
        ...selectedBooking,
        checkIn: nd,
        checkOut: co,
        nights,
      });
      setCheckInPopoverOpen(false);
    },
    [selectedBooking, setSelectedBooking],
  );

  // Handler: Check-out date change
  const handleNewResCheckOutDate = useCallback(
    (d: Date | undefined) => {
      if (!d || !selectedBooking) return;
      const nd = startOfDay(d);
      const ci = startOfDay(selectedBooking.checkIn);
      if (isBeforeToday(nd)) {
        toast.error("Reservations can only be made for today or future dates.");
        return;
      }
      if (nd <= ci) {
        toast.error("Check-out must be after check-in");
        return;
      }
      const nights = Math.max(
        1,
        Math.ceil((nd.getTime() - ci.getTime()) / 86400000),
      );
      setSelectedBooking({
        ...selectedBooking,
        checkOut: nd,
        nights,
      });
      setCheckOutPopoverOpen(false);
    },
    [selectedBooking, setSelectedBooking],
  );

  // Reset form
  const resetNewResForm = useCallback(() => {
    setNewResForm({
      guestName: "",
      phone: "",
      email: "",
      people: 1,
      bookingSource: "",
      paymentMode: "online",
      specialRequirements: "",
    });
  }, []);

  return {
    // Form state
    newResForm,
    setNewResForm,
    editForm,
    setEditForm,
    isResSubmitting,
    checkInPopoverOpen,
    setCheckInPopoverOpen,
    checkOutPopoverOpen,
    setCheckOutPopoverOpen,

    // Handlers
    handleCreateReservation,
    handleSaveEdit,
    handleCancelBooking,
    handleDeleteBooking,
    handleCheckIn,
    handleCheckOut,
    handleNewResCheckInDate,
    handleNewResCheckOutDate,
    handleSwitchToEdit,
    resetNewResForm,

    // Helpers
    getRoomNumberForSelected,
    getRoomForSelected,
    getRoomCategoryAndPrice,
  };
}

export { BOOKING_SOURCES, PAYMENT_MODES };
