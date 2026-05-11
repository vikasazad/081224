"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Moon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { doc, onSnapshot, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/config/db/firebase";
import {
  getAllRoomsDetails,
  getLiveRooms,
  updateReservation,
} from "../../staff/utils/staffData";
import {
  BookingBlock,
  BookingStatus,
  GridRoom,
  LiveRoomsResponse,
  RoomCategoryGroup,
} from "../types/singleScreenDashboardTypes";
import {
  categoryGroups as initialCategoryGroups,
  generateDateRange,
  isSameDay,
  getBookingColumns,
  getOccupiedCells,
  computeDailyStats,
  DAY_NAMES,
  MONTH_NAMES,
  mergeDbReservationsIntoGroups,
  mergeLiveRoomsIntoGroups,
  filterReservationsForDashboardRange,
  liveRoomsFromHotelSnapshot,
} from "../data/singleScreenDashboardData";
import ReservationManager from "./ReservationManager";
import NewLiveBookingForm from "./NewLiveBookingForm";
import { CheckInOtpSheet } from "./CheckInOtpSheet";
import OngoingBookingSheet from "./OngoingBookingSheet";
import { RoomDetail } from "../hooks/useReservations";
import {
  LiveRoomData,
  LiveRoomStatus,
} from "../types/singleScreenDashboardTypes";

function resolveRoomNo(room: GridRoom): string {
  const direct = String(room.roomNo ?? "").trim();
  if (direct) return direct;
  const id = String(room.id ?? "").trim();
  if (!id) return "";
  const stripped = id.replace(/^room-/i, "").trim();
  return stripped || id;
}

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

const MIN_VISIBLE_RANGE = 6;
const MAX_VISIBLE_RANGE = 10;

interface ReservationProps {
  details: RoomDetail[];
  businessInfo: any;
}

const SingleScreenDashboard = ({ details, businessInfo }: ReservationProps) => {
  console.log("businessInfo", businessInfo, details);
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  // ── State ──
  const [dateOffset, setDateOffset] = useState(0);
  const [visibleRange, setVisibleRange] = useState(MIN_VISIBLE_RANGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<BookingStatus[]>([]);
  const [groups, setGroups] = useState<RoomCategoryGroup[]>(() => {
    return initialCategoryGroups.map((g) => ({
      ...g,
      rooms: g.rooms.map((r) => ({
        ...r,
        bookings: r.bookings.map((b) => ({
          ...b,
          checkIn: new Date(b.checkIn),
          checkOut: new Date(b.checkOut),
        })),
      })),
    }));
  });

  // Refs
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"view" | "edit" | "new">("view");
  const [selectedBooking, setSelectedBooking] = useState<BookingBlock | null>(
    null,
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  /** After empty-cell tap or drag: show Reservation vs Booking choice, then ReservationManager */
  const [newEntryDraft, setNewEntryDraft] = useState<BookingBlock | null>(null);
  /** Which CTA was chosen; drives "New Reservation" vs "New Booking" copy */
  const [newEntryKind, setNewEntryKind] = useState<"reservation" | "booking">(
    "reservation",
  );

  // Drag for creating new reservations
  const [isDragging, setIsDragging] = useState(false);
  const [dragRoomId, setDragRoomId] = useState<string | null>(null);
  const [dragRoomCategory, setDragRoomCategory] = useState<string | null>(null);
  const [dragStartIdx, setDragStartIdx] = useState<number | null>(null);
  const [dragEndIdx, setDragEndIdx] = useState<number | null>(null);

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [otpSheetOpen, setOtpSheetOpen] = useState(false);

  // Live rooms data for ongoing booking sheets
  const [liveRoomsData, setLiveRoomsData] = useState<LiveRoomData[]>([]);
  const [liveRoomsStatus, setLiveRoomsStatus] = useState<LiveRoomStatus>({
    dining: ["Order placed", "Served", "Pending", "Paid"],
    room: ["Billed", "Paid", "Pending"],
    service: [
      "Requested",
      "Accepted",
      "Denied",
      "Pending",
      "Paid",
      "Cancelled",
    ],
    issue: ["Opened", "Assigned", "Fixing required", "Fixed", "Cancelled"],
  });

  // === Booking Drag & Drop ===
  const bookingDragInitRef = useRef<{
    booking: BookingBlock;
    sourceRoomId: string;
    startX: number;
    startY: number;
    activated: boolean;
  } | null>(null);
  const [bookingDragTarget, setBookingDragTarget] = useState<{
    booking: BookingBlock;
    sourceRoomId: string;
    targetRoomId: string | null;
    targetColIdx: number | null;
    isValid: boolean;
  } | null>(null);
  const bookingDragTargetRef = useRef(bookingDragTarget);
  bookingDragTargetRef.current = bookingDragTarget;
  const ghostRef = useRef<HTMLDivElement>(null);
  const dragJustEndedRef = useRef(false);
  /** After multi-day empty-cell drag, ignore the synthetic click so it does not shrink the range */
  const reservationDragJustEndedRef = useRef(false);
  const reservationDragCaptureRef = useRef<{
    el: HTMLElement;
    pointerId: number;
  } | null>(null);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const adjustedDatesRef = useRef<Date[]>([]);

  // ── Computed ──
  const dates = useMemo(
    () => generateDateRange(visibleRange + 1, visibleRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateOffset, visibleRange],
  );

  const adjustedDates = useMemo(() => {
    return dates.map((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + dateOffset);
      return nd;
    });
  }, [dates, dateOffset]);

  const todayDate = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  useEffect(() => {
    if (adjustedDates.length === 0 || !userEmail) return;

    const endDate = adjustedDates[adjustedDates.length - 1];

    void getAllRoomsDetails();

    const applyHotelDocument = (raw: Record<string, unknown>) => {
      const reservationsFiltered = filterReservationsForDashboardRange(
        raw.reservation,
        todayDate,
        endDate,
      );
      const livePart = liveRoomsFromHotelSnapshot(raw);

      if (livePart?.rooms) {
        setLiveRoomsData(livePart.rooms);
      }
      if (livePart?.status) {
        setLiveRoomsStatus(livePart.status);
      }

      setGroups((prev) => {
        let updated = mergeDbReservationsIntoGroups(
          prev,
          reservationsFiltered,
          todayDate,
        );
        if (livePart) {
          updated = mergeLiveRoomsIntoGroups(
            updated,
            livePart as LiveRoomsResponse,
          );
        }
        return updated;
      });
    };

    const docRef = doc(db, userEmail, "hotel");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot) => {
        if (!snapshot.exists()) return;
        applyHotelDocument(snapshot.data() as Record<string, unknown>);
      },
      (error: Error) => {
        console.error("SingleScreenDashboard hotel snapshot error:", error);
      },
    );

    return () => unsubscribe();
  }, [adjustedDates, todayDate, userEmail]);

  const filteredGroups = useMemo(() => {
    let res = groups;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res
        .map((g) => ({
          ...g,
          rooms: g.rooms.filter(
            (r) =>
              r.roomNo.toLowerCase().includes(q) ||
              r.categoryName.toLowerCase().includes(q) ||
              r.bookings.some((b) => b.guestName.toLowerCase().includes(q)) ||
              r.bookings.some((b) => b.orderId.toLowerCase().includes(q)),
          ),
        }))
        .filter((g) => g.rooms.length > 0);
    }

    if (activeFilters.length > 0) {
      res = res.map((g) => ({
        ...g,
        rooms: g.rooms.map((r) => ({
          ...r,
          bookings: r.bookings.filter((b) => activeFilters.includes(b.status)),
        })),
      }));
    }

    return res;
  }, [groups, searchQuery, activeFilters]);

  const dailyStats = useMemo(
    () => computeDailyStats(groups, adjustedDates),
    [groups, adjustedDates],
  );

  adjustedDatesRef.current = adjustedDates;

  const checkBookingDropSpace = useCallback(
    (
      booking: BookingBlock,
      targetRoomId: string,
      targetColIdx: number,
    ): boolean => {
      const currentGroups = groupsRef.current;
      const currentDates = adjustedDatesRef.current;
      let targetRoom: GridRoom | null = null;
      for (const g of currentGroups) {
        const found = g.rooms.find((r) => r.id === targetRoomId);
        if (found) {
          targetRoom = found;
          break;
        }
      }
      if (!targetRoom) return false;
      const duration = booking.nights > 0 ? booking.nights : 1;
      if (targetColIdx < 0 || targetColIdx + duration > currentDates.length)
        return false;
      const filteredBookings = targetRoom.bookings.filter(
        (b) => b.id !== booking.id,
      );
      const occupied = getOccupiedCells(
        { ...targetRoom, bookings: filteredBookings },
        currentDates,
      );
      for (let i = targetColIdx; i < targetColIdx + duration; i++) {
        if (occupied.has(i)) return false;
      }
      return true;
    },
    [],
  );

  const checkCanDrop = useCallback(
    (
      booking: BookingBlock,
      targetRoomId: string,
      targetColIdx: number,
    ): boolean => {
      if (!checkBookingDropSpace(booking, targetRoomId, targetColIdx))
        return false;
      const currentDates = adjustedDatesRef.current;
      const stayStart = new Date(currentDates[targetColIdx]);
      stayStart.setHours(0, 0, 0, 0);
      if (isBeforeToday(stayStart)) return false;
      return true;
    },
    [checkBookingDropSpace],
  );

  const handleBookingDragMouseDown = useCallback(
    async (e: React.MouseEvent, booking: BookingBlock, roomId: string) => {
      console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      e.preventDefault();
      bookingDragInitRef.current = {
        booking,
        sourceRoomId: roomId,
        startX: e.clientX,
        startY: e.clientY,
        activated: false,
      };

      const handleMove = (me: MouseEvent) => {
        const init = bookingDragInitRef.current;
        if (!init) return;
        const dx = me.clientX - init.startX;
        const dy = me.clientY - init.startY;
        if (!init.activated) {
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
          init.activated = true;
        }
        if (ghostRef.current) {
          ghostRef.current.style.left = `${me.clientX - 80}px`;
          ghostRef.current.style.top = `${me.clientY - 25}px`;
        }
        if (ghostRef.current) ghostRef.current.style.pointerEvents = "none";
        const el = document.elementFromPoint(me.clientX, me.clientY);
        if (ghostRef.current) ghostRef.current.style.pointerEvents = "";
        let tRoomId: string | null = null;
        let tColIdx: number | null = null;
        if (el) {
          const gridArea = (el as HTMLElement).closest(
            "[data-grid-area]",
          ) as HTMLElement | null;
          const roomRow = (el as HTMLElement).closest(
            "[data-room-id]",
          ) as HTMLElement | null;
          if (gridArea && roomRow) {
            tRoomId = roomRow.getAttribute("data-room-id");
            const rect = gridArea.getBoundingClientRect();
            const dates = adjustedDatesRef.current;
            const colWidth = rect.width / dates.length;
            tColIdx = Math.floor((me.clientX - rect.left) / colWidth);
            tColIdx = Math.max(0, Math.min(tColIdx, dates.length - 1));
          }
        }
        const isValid =
          tRoomId !== null && tColIdx !== null
            ? checkCanDrop(init.booking, tRoomId, tColIdx)
            : false;
        setBookingDragTarget({
          booking: init.booking,
          sourceRoomId: init.sourceRoomId,
          targetRoomId: tRoomId,
          targetColIdx: tColIdx,
          isValid,
        });
      };

      const handleUp = () => {
        const init = bookingDragInitRef.current;
        const visual = bookingDragTargetRef.current;
        if (
          init?.activated &&
          visual?.targetRoomId &&
          visual.targetColIdx !== null
        ) {
          const dates = adjustedDatesRef.current;
          const newCheckIn = new Date(dates[visual.targetColIdx]);
          newCheckIn.setHours(0, 0, 0, 0);
          const newCheckOut = new Date(newCheckIn);
          newCheckOut.setDate(newCheckOut.getDate() + visual.booking.nights);

          const spaceOk = checkBookingDropSpace(
            init.booking,
            visual.targetRoomId,
            visual.targetColIdx,
          );
          const dropIsPast = isBeforeToday(newCheckIn);

          if (spaceOk && dropIsPast) {
            toast.error("Reservations cannot be taken to the past.");
          } else if (
            checkCanDrop(init.booking, visual.targetRoomId, visual.targetColIdx)
          ) {
            setConfirmAction({
              type: "booking-move",
              title: "Confirm reservation move",
              description:
                "Apply this reservation to the new room and dates? You can cancel if you changed your mind.",
              onConfirm: async () => {
                const updatedBooking: BookingBlock = {
                  ...visual.booking,
                  checkIn: newCheckIn,
                  checkOut: newCheckOut,
                };

                let targetRoomMeta: GridRoom | undefined;
                for (const g of groupsRef.current) {
                  const r = g.rooms.find((x) => x.id === visual.targetRoomId);
                  if (r) {
                    targetRoomMeta = r;
                    break;
                  }
                }

                setGroups((prev) => {
                  const sameRoom = visual.sourceRoomId === visual.targetRoomId;
                  return prev.map((group) => ({
                    ...group,
                    rooms: group.rooms.map((room) => {
                      if (sameRoom && room.id === visual.sourceRoomId) {
                        return {
                          ...room,
                          bookings: [
                            ...room.bookings.filter(
                              (b) => b.id !== visual.booking.id,
                            ),
                            updatedBooking,
                          ],
                        };
                      }
                      if (!sameRoom && room.id === visual.sourceRoomId) {
                        return {
                          ...room,
                          bookings: room.bookings.filter(
                            (b) => b.id !== visual.booking.id,
                          ),
                        };
                      }
                      if (!sameRoom && room.id === visual.targetRoomId) {
                        return {
                          ...room,
                          bookings: [...room.bookings, updatedBooking],
                        };
                      }
                      return room;
                    }),
                  }));
                });

                const roomNo = targetRoomMeta
                  ? resolveRoomNo(targetRoomMeta)
                  : "";
                const db: any = updatedBooking.dbReservation;
                console.log("db", db);

                if (db?.bookingId?.startsWith("RES")) {
                  const data = {
                    ...db,
                    roomNo,
                    price: updatedBooking.amount,
                    roomCategory: targetRoomMeta?.categoryName ?? "",
                    checkIn: updatedBooking.checkIn.toISOString(),
                    checkOut: updatedBooking.checkOut.toISOString(),
                    createdAt: new Date().toISOString(),
                  };
                  const res = await updateReservation(data);
                  if (res) {
                    toast.success("Reservation updated successfully");
                  } else {
                    toast.error("Failed to update reservation");
                  }
                }

                console.log("updatedBooking", updatedBooking);

                setConfirmAction(null);
              },
            });
          }
        }
        if (init?.activated) {
          dragJustEndedRef.current = true;
          requestAnimationFrame(() => {
            dragJustEndedRef.current = false;
          });
        }
        bookingDragInitRef.current = null;
        setBookingDragTarget(null);
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [checkBookingDropSpace, checkCanDrop],
  );

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      console.log("handleGlobalPointerUp");
      const cap = reservationDragCaptureRef.current;
      console.log(
        "============================================",
        selectedRoomId,
      );
      if (cap) {
        try {
          cap.el.releasePointerCapture(cap.pointerId);
        } catch {
          /* already released */
        }
        reservationDragCaptureRef.current = null;
      }
      if (
        isDragging &&
        dragStartIdx !== null &&
        dragEndIdx !== null &&
        dragRoomId
      ) {
        console.log("DETAILS", details);
        const startIdx = Math.min(dragStartIdx, dragEndIdx);
        const endIdx = Math.max(dragStartIdx, dragEndIdx);
        const startDate = new Date(adjustedDates[startIdx]);
        const endDate = new Date(adjustedDates[endIdx]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const msPerDay = 86400000;
        let nights = Math.round(
          (endDate.getTime() - startDate.getTime()) / msPerDay,
        );
        if (nights < 1) nights = 1;

        if (isBeforeToday(startDate)) {
          toast.error(
            "Reservations can only be made for today or future dates.",
          );
        } else {
          if (startIdx !== endIdx) {
            reservationDragJustEndedRef.current = true;
            requestAnimationFrame(() => {
              reservationDragJustEndedRef.current = false;
            });
          }
          const amenitiesAndImages = details.find((detail) => {
            if (detail.category === dragRoomCategory) {
              return {
                amenities: detail.amenities,
                images: detail.images,
              };
            }
          });
          const draft: BookingBlock = {
            id: "",
            orderId: "",
            guestName: "",
            people: 1,
            nights,
            amount: 0,
            status: "reservation",
            checkIn: startDate,
            checkOut: endDate,
            inclusions: amenitiesAndImages?.amenities || [],
            images: amenitiesAndImages?.images || [],
            roomNo: dragRoomId,
          };
          setSelectedRoomId(dragRoomId);
          if (isSameDay(startDate, todayDate)) {
            setNewEntryDraft(draft);
            setSheetOpen(true);
          } else {
            setNewEntryDraft(null);
            setNewEntryKind("reservation");
            setSelectedBooking(draft);
            setSheetMode("new");
            setSheetOpen(true);
          }
        }
      }
      setIsDragging(false);
      setDragRoomId(null);
      setDragRoomCategory(null);
      setDragStartIdx(null);
      setDragEndIdx(null);
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [
    isDragging,
    dragStartIdx,
    dragEndIdx,
    dragRoomId,
    adjustedDates,
    todayDate,
  ]);

  useEffect(() => {
    const dashboardEl = dashboardRef.current;
    if (!dashboardEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setVisibleRange((prev) => Math.min(prev + 1, MAX_VISIBLE_RANGE));
        } else if (e.deltaY > 0) {
          setVisibleRange((prev) => Math.max(prev - 1, MIN_VISIBLE_RANGE));
        }
      } else if (e.shiftKey) {
        e.preventDefault();
        const delta = e.deltaY || e.deltaX;
        if (delta > 0) {
          setDateOffset((o) => o + 1);
        } else if (delta < 0) {
          setDateOffset((o) => o - 1);
        }
      }
    };

    dashboardEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => dashboardEl.removeEventListener("wheel", handleWheel);
  }, []);

  const handleBookingClick = useCallback(
    (booking: BookingBlock, roomId: string) => {
      console.log("hgiiiiiiiiiiiiiiiiiiiiiii");
      setNewEntryDraft(null);
      setNewEntryKind("reservation");
      setSelectedBooking(booking);
      setSelectedRoomId(roomId);
      setSheetMode("view");
      setSheetOpen(true);
    },
    [],
  );

  const handleReservationCellPointerDown = useCallback(
    (roomId: string, dateIdx: number, e: React.PointerEvent) => {
      const row = (e.currentTarget as HTMLElement).closest("[data-room-id]");
      const categoryName =
        row?.getAttribute("data-room-category")?.trim() || null;

      const grid = (e.currentTarget as HTMLElement).closest("[data-date-grid]");
      if (grid) {
        try {
          grid.setPointerCapture(e.pointerId);
          reservationDragCaptureRef.current = {
            el: grid as HTMLElement,
            pointerId: e.pointerId,
          };
        } catch {
          /* setPointerCapture unsupported or already captured */
        }
      }
      setIsDragging(true);
      setDragRoomId(roomId);
      setDragRoomCategory(categoryName);
      setDragStartIdx(dateIdx);
      setDragEndIdx(dateIdx);
    },
    [],
  );

  const handleEmptyCellClick = useCallback(
    (roomId: string, dateIdx: number) => {
      const startDate = adjustedDates[dateIdx];
      if (isBeforeToday(startDate)) {
        toast.error("Reservations can only be made for today or future dates.");
        return;
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const draft: BookingBlock = {
        id: "",
        orderId: "",
        guestName: "",
        people: 1,
        nights: 1,
        amount: 0,
        status: "reservation",
        checkIn: startDate,
        checkOut: endDate,
      };
      setSelectedRoomId(roomId);
      if (isSameDay(startDate, todayDate)) {
        setNewEntryDraft(draft);
        setSheetOpen(true);
      } else {
        setNewEntryDraft(null);
        setNewEntryKind("reservation");
        setSelectedBooking(draft);
        setSheetMode("new");
        setSheetOpen(true);
      }
    },
    [adjustedDates, todayDate],
  );

  const openReservationManagerFromChoice = useCallback(
    (draft: BookingBlock, kind: "reservation" | "booking") => {
      setNewEntryKind(kind);
      setSelectedBooking(draft);
      setSheetMode("new");
      setNewEntryDraft(null);
    },
    [],
  );

  const showConfirmAction = useCallback(
    (
      type: string,
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
    ) => {
      setConfirmAction({ type, title, description, onConfirm });
    },
    [],
  );

  const getRoomNumberForSelected = useCallback(() => {
    for (const g of groups) {
      const room = g.rooms.find((r) => r.id === selectedRoomId);
      if (room) return resolveRoomNo(room);
    }
    return selectedRoomId;
  }, [groups, selectedRoomId]);

  const getSelectedLiveRoom = useCallback((): LiveRoomData | null => {
    if (!selectedBooking || selectedBooking.status !== "ongoing") return null;
    const roomNo = getRoomNumberForSelected();
    return (
      liveRoomsData.find(
        (lr) => lr.bookingDetails?.location?.trim() === roomNo.trim(),
      ) || null
    );
  }, [selectedBooking, liveRoomsData, getRoomNumberForSelected]);

  const isOngoingBookingSelected =
    selectedBooking?.status === "ongoing" && getSelectedLiveRoom() !== null;

  const isDragSelected = (roomId: string, colIdx: number): boolean => {
    if (
      !isDragging ||
      dragRoomId !== roomId ||
      dragStartIdx === null ||
      dragEndIdx === null
    )
      return false;
    const minIdx = Math.min(dragStartIdx, dragEndIdx);
    const maxIdx = Math.max(dragStartIdx, dragEndIdx);
    return colIdx >= minIdx && colIdx <= maxIdx;
  };

  const renderBookingBlock = (booking: BookingBlock, room: GridRoom) => {
    // console.log("booking", booking);
    const pos = getBookingColumns(booking, adjustedDates);
    if (!pos) return null;
    const style = STATUS_STYLES[booking.status];
    const isBeingDragged = bookingDragTarget?.booking.id === booking.id;

    return (
      <div
        key={booking.id}
        className={`absolute top-1 bottom-1 rounded-lg px-2.5 py-1.5 cursor-grab transition-all hover:shadow-md hover:scale-[1.02] border ${style.bg} ${style.text} ${style.border} select-none overflow-hidden z-10 ${
          isBeingDragged
            ? "!opacity-25 !border-dashed !border-gray-400 !shadow-none !scale-100"
            : ""
        }`}
        style={{
          left: `${(pos.start / adjustedDates.length) * 100}%`,
          width: `${(pos.span / adjustedDates.length) * 100}%`,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleBookingDragMouseDown(e, booking, room.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (dragJustEndedRef.current) return;
          handleBookingClick(booking, room.id);
        }}
      >
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[10px] font-mono opacity-70 truncate">
            {booking.orderId}
          </span>
        </div>
        <div className="text-xs font-semibold truncate leading-tight">
          {booking.guestName}
        </div>
        {booking.status !== "housekeeping" &&
          booking.status !== "maintenance" && (
            <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-75">
              <span className="flex items-center gap-0.5">
                <Users className="h-2.5 w-2.5" /> {booking.people}
              </span>
              <span className="flex items-center gap-0.5">
                <Moon className="h-2.5 w-2.5" /> {booking.nights}
              </span>
            </div>
          )}
      </div>
    );
  };

  const renderRoomRow = (room: GridRoom) => {
    const occupied = getOccupiedCells(room, adjustedDates);

    const showDropHighlight =
      bookingDragTarget &&
      bookingDragTarget.targetRoomId === room.id &&
      bookingDragTarget.targetColIdx !== null;

    return (
      <div
        key={room.id}
        className="flex border-b border-gray-100"
        data-room-id={room.id}
        data-room-category={room.categoryName}
      >
        <div className="w-20 shrink-0 flex items-center justify-center font-semibold text-sm text-gray-700 border-r border-gray-100 bg-white">
          {room.roomNo}
        </div>
        <div
          className="flex-1 relative"
          style={{ minHeight: "64px" }}
          data-grid-area="true"
        >
          <div
            data-date-grid
            className="grid h-full"
            style={{
              gridTemplateColumns: `repeat(${adjustedDates.length}, 1fr)`,
            }}
            onPointerMove={(e) => {
              if (!isDragging || room.id !== dragRoomId || bookingDragTarget)
                return;
              const rect = e.currentTarget.getBoundingClientRect();
              const n = adjustedDates.length;
              if (n === 0) return;
              const rawX = e.clientX - rect.left;
              const x = Math.max(0, Math.min(rawX, rect.width - 1e-6));
              const colIdx = Math.min(
                n - 1,
                Math.max(0, Math.floor((x / rect.width) * n)),
              );
              if (occupied.has(colIdx)) return;
              setDragEndIdx(colIdx);
            }}
          >
            {adjustedDates.map((_, colIdx) => {
              const isOccupied = occupied.has(colIdx);
              const dragSel = isDragSelected(room.id, colIdx);
              const rowIsDragging = isDragging && dragRoomId === room.id;
              return (
                <div
                  key={colIdx}
                  data-col-idx={colIdx}
                  className={`border-r border-gray-50 h-full flex items-center justify-center group ${
                    rowIsDragging ? "" : "transition-colors"
                  } ${
                    !isOccupied ? "cursor-pointer hover:bg-blue-50/40" : ""
                  } ${dragSel ? "bg-blue-100/60 border-blue-300" : ""} ${
                    isSameDay(adjustedDates[colIdx], todayDate)
                      ? "bg-amber-50/30"
                      : ""
                  }`}
                  onPointerDown={(e) => {
                    if (!isOccupied && !bookingDragTarget) {
                      e.preventDefault();
                      handleReservationCellPointerDown(room.id, colIdx, e);
                    }
                  }}
                  onClick={() => {
                    if (!isOccupied && !isDragging && !bookingDragTarget) {
                      if (reservationDragJustEndedRef.current) return;
                      handleEmptyCellClick(room.id, colIdx);
                    }
                  }}
                >
                  {!isOccupied && !dragSel && (
                    <Plus className="h-4 w-4 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>
          {room.bookings.map((b) => renderBookingBlock(b, room))}
          {showDropHighlight && bookingDragTarget.targetColIdx !== null && (
            <div
              className={`absolute top-0 bottom-0 rounded-lg border-2 border-dashed pointer-events-none transition-all ${
                bookingDragTarget.isValid
                  ? "bg-green-100/50 border-green-400"
                  : "bg-red-100/50 border-red-400"
              }`}
              style={{
                left: `${(bookingDragTarget.targetColIdx / adjustedDates.length) * 100}%`,
                width: `${
                  (Math.min(
                    bookingDragTarget.booking.nights > 0
                      ? bookingDragTarget.booking.nights + 1
                      : 1,
                    adjustedDates.length - bookingDragTarget.targetColIdx,
                  ) /
                    adjustedDates.length) *
                  100
                }%`,
                zIndex: 5,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const todayFormatted = `${todayDate.getDate()} ${MONTH_NAMES[todayDate.getMonth()]}, ${todayDate.getFullYear()}`;

  return (
    <div
      ref={dashboardRef}
      className="flex flex-col h-full bg-white select-none"
    >
      {/* ─── Header ─── */}
      <header className="shrink-0 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Booking Manager
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
              {todayFormatted}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rooms or guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72 bg-gray-50 border-gray-200"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-gray-600"
                >
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {activeFilters.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="px-1 h-5 text-[10px] ml-1"
                    >
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(STATUS_STYLES).map(([status, style]) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={activeFilters.includes(status as BookingStatus)}
                    onCheckedChange={(checked) => {
                      setActiveFilters((prev) =>
                        checked
                          ? [...prev, status as BookingStatus]
                          : prev.filter((s) => s !== status),
                      );
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${style.bg} border ${style.border}`}
                      />
                      {style.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ─── Grid Area ─── */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex">
            <div className="w-20 shrink-0 flex items-center justify-center border-r border-gray-200">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setDateOffset((o) => o - 7)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setDateOffset((o) => o + 7)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div
              className="flex-1 grid"
              style={{
                gridTemplateColumns: `repeat(${adjustedDates.length}, 1fr)`,
              }}
            >
              {adjustedDates.map((date, idx) => {
                const isToday = isSameDay(date, todayDate);
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center py-2.5 text-center border-r border-gray-100 transition-colors ${
                      isToday
                        ? "bg-gray-900 text-white rounded-b-lg"
                        : "text-gray-500"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isToday ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      {DAY_NAMES[date.getDay()]}
                    </span>
                    <span
                      className={`text-lg font-bold leading-tight ${
                        isToday ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {date.getDate().toString().padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-1.5 border-b border-gray-100">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
            Room Details
          </span>
        </div>

        {filteredGroups.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between px-6 py-2.5 bg-gray-50/80 border-b border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700">
                {category.name}
              </h2>
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                {category.floorLabel}
              </span>
            </div>
            {category.rooms.map((room) => renderRoomRow(room))}
          </div>
        ))}
      </div>

      {/* ─── Sticky Stats Bar ─── */}
      <footer className="shrink-0 border-t border-gray-200 bg-white z-30 p-2">
        <div className="flex ">
          <div className="w-20 shrink-0 px-2 py-1 border-r border-gray-100 flex items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider ">
              Bookings
            </span>
          </div>
          <div
            className=" flex-1 grid text-center"
            style={{
              gridTemplateColumns: `repeat(${adjustedDates.length}, 1fr)`,
            }}
          >
            {dailyStats.map((stat, idx) => {
              const isToday = isSameDay(stat.date, todayDate);
              return (
                <div
                  key={`bk-${idx}`}
                  className={`py-1 text-xs tabular-nums border-r border-gray-50 flex items-center justify-center ${
                    isToday
                      ? "rounded-sm text-sm text-white bg-black font-bold"
                      : "text-gray-600"
                  }`}
                >
                  {stat.bookingsCount}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex border-t border-gray-50">
          <div className="w-20 shrink-0 px-2 py-0.5 border-r border-gray-100 flex items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider ">
              Occ. %
            </span>
          </div>
          <div
            className="flex-1 grid text-center"
            style={{
              gridTemplateColumns: `repeat(${adjustedDates.length}, 1fr)`,
            }}
          >
            {dailyStats.map((stat, idx) => {
              const isToday = isSameDay(stat.date, todayDate);
              return (
                <div
                  key={`oc-${idx}`}
                  className={`py-0.5 text-[10px] tabular-nums border-r border-gray-50 flex items-center justify-center ${
                    isToday
                      ? "rounded-sm text-sm text-white bg-black font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {stat.occupancyPercent.toFixed(0)}%
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex border-t border-gray-50">
          <div className="w-20 shrink-0 px-2 py-0.5 border-r border-gray-100 flex items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider ">
              Avail.
            </span>
          </div>
          <div
            className="flex-1 grid text-center"
            style={{
              gridTemplateColumns: `repeat(${adjustedDates.length}, 1fr)`,
            }}
          >
            {dailyStats.map((stat, idx) => {
              const isToday = isSameDay(stat.date, todayDate);
              return (
                <div
                  key={`av-${idx}`}
                  className={`py-0.5 text-[10px] tabular-nums border-r border-gray-50 flex items-center justify-center ${
                    isToday
                      ? "rounded-sm text-sm text-white bg-black font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {stat.availableRooms}
                </div>
              );
            })}
          </div>
        </div>
      </footer>

      {/* ─── Right Side Sheet ─── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setNewEntryDraft(null);
            setNewEntryKind("reservation");
          }
        }}
      >
        <SheetTitle></SheetTitle>
        <SheetDescription></SheetDescription>
        <SheetContent
          side="right"
          className={`overflow-y-auto ${
            isOngoingBookingSelected
              ? "sm:max-w-lg w-[520px]"
              : "sm:max-w-md w-[440px]"
          }`}
        >
          {newEntryDraft ? (
            <div className="flex flex-col gap-4 pt-2 pb-6">
              <SheetHeader>
                <SheetTitle>Add to room</SheetTitle>
                <SheetDescription>
                  Room {getRoomNumberForSelected()} — choose an option to
                  continue
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-2 px-1">
                <Button
                  type="button"
                  className="h-28 text-lg font-semibold rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    openReservationManagerFromChoice(
                      newEntryDraft,
                      "reservation",
                    )
                  }
                >
                  Reservation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-28 text-lg font-semibold rounded-xl border-2 border-slate-300 bg-slate-50/80 hover:bg-slate-100"
                  onClick={() =>
                    openReservationManagerFromChoice(newEntryDraft, "booking")
                  }
                >
                  Booking
                </Button>
              </div>
            </div>
          ) : isOngoingBookingSelected && sheetMode === "view" ? (
            <OngoingBookingSheet
              liveRoom={getSelectedLiveRoom()!}
              status={liveRoomsStatus}
              onClose={() => setSheetOpen(false)}
              onLiveRoomUpdate={(updatedRoom) => {
                setLiveRoomsData((prev) =>
                  prev.map((room) =>
                    room.bookingDetails?.bookingId ===
                    updatedRoom.bookingDetails?.bookingId
                      ? updatedRoom
                      : room,
                  ),
                );
              }}
              onRoomClosed={async () => {
                const res = await getLiveRooms();
                if (res && typeof res === "object" && "rooms" in res) {
                  setLiveRoomsData((res as LiveRoomsResponse).rooms);
                }
                setSheetOpen(false);
              }}
              businessInfo={businessInfo}
            />
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>
                  {sheetMode === "new"
                    ? newEntryKind === "booking"
                      ? "New Booking"
                      : ""
                    : sheetMode === "edit"
                      ? "Edit Booking"
                      : "Reservation Details"}
                </SheetTitle>
                <SheetDescription>
                  {sheetMode === "new"
                    ? newEntryKind === "booking"
                      ? `Create a new booking for Room ${getRoomNumberForSelected()}`
                      : ""
                    : sheetMode === "edit"
                      ? `Editing ${selectedBooking?.orderId}`
                      : `${selectedBooking?.orderId} • Room ${getRoomNumberForSelected()}`}
                </SheetDescription>
              </SheetHeader>
              {sheetMode === "new" &&
              newEntryKind === "booking" &&
              selectedBooking ? (
                <NewLiveBookingForm
                  selectedBooking={selectedBooking}
                  setSelectedBooking={setSelectedBooking}
                  selectedRoomId={selectedRoomId}
                  groups={groups}
                  details={details}
                  businessInfo={businessInfo}
                  onClose={() => setSheetOpen(false)}
                  onBookingSaved={async () => {
                    const res = await getLiveRooms();
                    if (res && typeof res === "object" && "rooms" in res) {
                      setLiveRoomsData((res as LiveRoomsResponse).rooms);
                    }
                  }}
                />
              ) : (
                <ReservationManager
                  sheetMode={sheetMode}
                  newEntryKind={newEntryKind}
                  selectedBooking={selectedBooking}
                  setSelectedBooking={setSelectedBooking}
                  selectedRoomId={selectedRoomId}
                  groups={groups}
                  setGroups={setGroups}
                  details={details}
                  businessInfo={businessInfo}
                  onClose={() => setSheetOpen(false)}
                  onModeChange={setSheetMode}
                  onCheckInConfirmed={() => setOtpSheetOpen(true)}
                  showConfirmAction={showConfirmAction}
                />
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckInOtpSheet
        open={otpSheetOpen}
        onOpenChange={setOtpSheetOpen}
        selectedBooking={selectedBooking}
        selectedRoomId={selectedRoomId}
        roomNo={getRoomNumberForSelected()}
      />

      {/* Firebase Phone Auth invisible reCAPTCHA mount (see lib/auth/handleOtp) */}
      <div id="recaptcha-container" />

      {/* ─── Confirmation Dialog ─── */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmAction(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void confirmAction?.onConfirm();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Booking Drag Ghost ─── */}
      {bookingDragTarget && (
        <>
          <style>{`body, body * { cursor: grabbing !important; }`}</style>
          <div
            ref={ghostRef}
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: 0,
              top: 0,
              willChange: "left, top",
            }}
          >
            <div
              className={`rounded-lg px-3 py-2 shadow-2xl border-2 min-w-[160px] max-w-[220px] ${
                STATUS_STYLES[bookingDragTarget.booking.status].bg
              } ${STATUS_STYLES[bookingDragTarget.booking.status].text} ${
                STATUS_STYLES[bookingDragTarget.booking.status].border
              }`}
              style={{ opacity: 0.9, transform: "rotate(2deg) scale(1.05)" }}
            >
              <div className="text-[10px] font-mono opacity-70 truncate">
                {bookingDragTarget.booking.orderId}
              </div>
              <div className="text-xs font-bold truncate">
                {bookingDragTarget.booking.guestName}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80">
                <span>
                  {bookingDragTarget.booking.nights} night
                  {bookingDragTarget.booking.nights > 1 ? "s" : ""}
                </span>
                <span
                  className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    bookingDragTarget.isValid
                      ? "bg-green-500 text-white"
                      : bookingDragTarget.targetRoomId
                        ? "bg-red-500 text-white"
                        : "bg-gray-400 text-white"
                  }`}
                >
                  {bookingDragTarget.isValid
                    ? "✓ Drop"
                    : bookingDragTarget.targetRoomId
                      ? "✗ No Space"
                      : "Drag…"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SingleScreenDashboard;
