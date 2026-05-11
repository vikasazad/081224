import type {
  BookingBlock,
  BookingStatus,
  DailyStats,
  GridRoom,
  LiveRoomData,
  LiveRoomsResponse,
  PaymentMode,
  PaymentStatus,
  RoomCategoryGroup,
} from "../types/singleScreenDashboardTypes";

const today = new Date();
today.setHours(0, 0, 0, 0);

function d(offset: number): Date {
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const categoryGroups: RoomCategoryGroup[] = [
  {
    id: "deluxe",
    name: "DELUXE ",
    floorLabel: "FLOOR 4-5",
    rooms: [
      {
        id: "room-101",
        roomNo: "101",
        categoryId: "deluxe",
        categoryName: "Deluxe",
        floor: 4,
        type: "Suite",
        pricePerNight: 32000,
        bookings: [
          {
            id: "bk-101-1",
            orderId: "ORD-78201",
            guestName: "Mr. Adin Yanuar Alfadin",
            phone: "+91 98765 43210",
            email: "adin.y@email.com",
            people: 3,
            nights: 3,
            amount: 96000,
            status: "checkout",
            checkIn: d(-5),
            checkOut: d(-2),
            bookingSource: "booking.com",
            paymentStatus: "paid",
            paymentMode: "credit_card",
            attendant: "Sarah K.",
          },
          {
            id: "bk-101-2",
            orderId: "ORD-78215",
            guestName: "Mr. Graha Caesara",
            phone: "+91 87654 32109",
            email: "graha.c@corp.com",
            people: 1,
            nights: 3,
            amount: 96000,
            status: "reservation",
            checkIn: d(2),
            checkOut: d(5),
            bookingSource: "agoda",
            paymentStatus: "partial",
            paymentMode: "net_banking",
            attendant: "James K.",
          },
        ],
        amenities: [],
        images: [],
      },
      {
        id: "room-102",
        roomNo: "102",
        categoryId: "deluxe",
        categoryName: "Deluxe",
        floor: 4,
        type: "Suite",
        pricePerNight: 36000,
        bookings: [
          {
            id: "bk-102-1",
            orderId: "ORD-78220",
            guestName: "Mrs. Fujiura Megu",
            phone: "+91 76543 21098",
            email: "fujiura.m@travel.net",
            people: 2,
            nights: 4,
            amount: 144000,
            status: "ongoing",
            checkIn: d(-1),
            checkOut: d(3),
            bookingSource: "booking.com",
            paymentStatus: "paid",
            paymentMode: "credit_card",
            attendant: "Maria S.",
            specialRequirements: "Late checkout requested",
          },
          {
            id: "bk-102-2",
            orderId: "ORD-78230",
            guestName: "Mr. Johnny Ben",
            phone: "+91 93456 78901",
            email: "johnny.b@mail.com",
            people: 2,
            nights: 3,
            amount: 108000,
            status: "reservation",
            checkIn: d(4),
            checkOut: d(7),
            bookingSource: "mmt",
            paymentStatus: "pending",
            paymentMode: "upi",
            attendant: "Sarah K.",
          },
        ],
        amenities: [],
        images: [],
      },
      {
        id: "room-103",
        roomNo: "103",
        categoryId: "deluxe",
        categoryName: "Deluxe",
        floor: 4,
        type: "Suite",
        pricePerNight: 34000,
        bookings: [
          {
            id: "bk-103-1",
            orderId: "ORD-78225",
            guestName: "Housekeeping",
            people: 0,
            nights: 1,
            amount: 0,
            status: "housekeeping",
            checkIn: d(-3),
            checkOut: d(-2),
            attendant: "Cleaning Team",
          },
        ],
        amenities: [],
        images: [],
      },
      {
        id: "room-104",
        roomNo: "104",
        categoryId: "deluxe",
        categoryName: "Deluxe",
        floor: 5,
        type: "Suite",
        pricePerNight: 38000,
        bookings: [
          {
            id: "bk-104-1",
            orderId: "ORD-78205",
            guestName: "Ms. Elena Vost",
            phone: "+91 82345 67890",
            email: "elena.v@luxury.com",
            people: 1,
            nights: 3,
            amount: 114000,
            status: "checkout",
            checkIn: d(-6),
            checkOut: d(-3),
            bookingSource: "website",
            paymentStatus: "paid",
            paymentMode: "credit_card",
            attendant: "James K.",
          },
          {
            id: "bk-104-2",
            orderId: "ORD-78235",
            guestName: "Mr. David Chen",
            phone: "+91 96543 21087",
            email: "david.c@gmail.com",
            people: 2,
            nights: 3,
            amount: 114000,
            status: "ongoing",
            checkIn: d(-1),
            checkOut: d(2),
            bookingSource: "mmt",
            paymentStatus: "paid",
            paymentMode: "debit_card",
            attendant: "Sarah K.",
            specialRequirements: "Business trip, need work desk",
          },
        ],
        amenities: [],
        images: [],
      },
    ],
  },
  {
    id: "super-deluxe",
    name: "SUPER DELUXE",
    floorLabel: "FLOOR 2",
    rooms: [
      {
        id: "room-201",
        roomNo: "201",
        categoryId: "super-deluxe",
        categoryName: "Super Deluxe",
        floor: 2,
        type: "Standard",
        pricePerNight: 14500,
        bookings: [
          {
            id: "bk-201-1",
            orderId: "ORD-78210",
            guestName: "Maintenance Window",
            people: 0,
            nights: 3,
            amount: 0,
            status: "maintenance",
            checkIn: d(-3),
            checkOut: d(-1),
            attendant: "Tech Team",
            specialRequirements: "Scheduled AC maintenance",
          },
          {
            id: "bk-201-2",
            orderId: "ORD-78240",
            guestName: "Lord Aldi Taher",
            phone: "+91 74321 09865",
            email: "aldi.t@royal.com",
            people: 1,
            nights: 3,
            amount: 43500,
            status: "reservation",
            checkIn: d(3),
            checkOut: d(6),
            bookingSource: "phone",
            paymentStatus: "paid",
            paymentMode: "net_banking",
            attendant: "Front Desk",
          },
        ],
        amenities: [],
        images: [],
      },
      {
        id: "room-202",
        roomNo: "202",
        categoryId: "super-deluxe",
        categoryName: "Super Deluxe",
        floor: 2,
        type: "Super Deluxe",
        pricePerNight: 14500,
        bookings: [],
        amenities: [],
        images: [],
      },
      {
        id: "room-203",
        roomNo: "203",
        categoryId: "super-deluxe",
        categoryName: "Super Deluxe",
        floor: 2,
        type: "Super Deluxe",
        pricePerNight: 12000,
        bookings: [
          {
            id: "bk-203-1",
            orderId: "ORD-78212",
            guestName: "Mr. James Wilson",
            phone: "+91 85432 10976",
            email: "james.w@outlook.com",
            people: 1,
            nights: 2,
            amount: 24000,
            status: "no_show",
            checkIn: d(-2),
            checkOut: d(0),
            bookingSource: "goibibo",
            paymentStatus: "refunded",
            paymentMode: "upi",
            attendant: "Front Desk",
          },
          {
            id: "bk-203-2",
            orderId: "ORD-78245",
            guestName: "Ms. Priya Sharma",
            phone: "+91 99887 76655",
            email: "priya.s@work.com",
            people: 2,
            nights: 2,
            amount: 24000,
            status: "reservation",
            checkIn: d(3),
            checkOut: d(5),
            bookingSource: "walk_in",
            paymentStatus: "pending",
            paymentMode: "cash",
            attendant: "Sarah K.",
            specialRequirements: "Extra towels, hypoallergenic pillows",
          },
        ],
        amenities: [],
        images: [],
      },
    ],
  },
  {
    id: "executive",
    name: "EXECUTIVE",
    floorLabel: "FLOOR 1",
    rooms: [
      {
        id: "room-301",
        roomNo: "301",
        categoryId: "executive",
        categoryName: "Executive",
        floor: 1,
        type: "Executive",
        pricePerNight: 6500,
        bookings: [
          {
            id: "bk-301-1",
            orderId: "ORD-78203",
            guestName: "Ms. Sarah Connor",
            phone: "+91 71234 56789",
            email: "sarah.c@mail.com",
            people: 1,
            nights: 3,
            amount: 19500,
            status: "checkout",
            checkIn: d(-6),
            checkOut: d(-3),
            bookingSource: "expedia",
            paymentStatus: "paid",
            paymentMode: "debit_card",
            attendant: "Lisa M.",
          },
          {
            id: "bk-301-2",
            orderId: "ORD-78250",
            guestName: "Mr. Alex Kumar",
            phone: "+91 88776 65544",
            email: "alex.k@travel.com",
            people: 1,
            nights: 2,
            amount: 13000,
            status: "ongoing",
            checkIn: d(0),
            checkOut: d(2),
            bookingSource: "airbnb",
            paymentStatus: "paid",
            paymentMode: "upi",
            attendant: "Front Desk",
          },
        ],
        amenities: [],
        images: [],
      },
      {
        id: "room-302",
        roomNo: "302",
        categoryId: "executive",
        categoryName: "Executive",
        floor: 1,
        type: "Executive",
        pricePerNight: 6500,
        bookings: [
          {
            id: "bk-302-1",
            orderId: "ORD-78255",
            guestName: "Mrs. Anna Williams",
            phone: "+91 93456 78901",
            email: "anna.w@mail.com",
            people: 1,
            nights: 3,
            amount: 19500,
            status: "reservation",
            checkIn: d(1),
            checkOut: d(4),
            bookingSource: "walk_in",
            paymentStatus: "paid",
            paymentMode: "cash",
            attendant: "Front Desk",
          },
        ],
        amenities: [],
        images: [],
      },
    ],
  },
];

export function generateDateRange(
  pastDays: number = 7,
  futureDays: number = 6,
): Date[] {
  const dates: Date[] = [];
  for (let i = -pastDays; i <= futureDays; i++) {
    dates.push(d(i));
  }
  return dates;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getBookingColumns(
  booking: BookingBlock,
  dates: Date[],
): { start: number; span: number } | null {
  const firstDate = dates[0].getTime();
  const lastDate = dates[dates.length - 1].getTime();
  const checkInTime = booking.checkIn.getTime();
  const checkOutTime = booking.checkOut.getTime();

  if (checkOutTime <= firstDate || checkInTime > lastDate) return null;

  const msPerDay = 86400000;
  const startOffset = Math.round((checkInTime - firstDate) / msPerDay);
  const endOffset = Math.round((checkOutTime - firstDate) / msPerDay);

  const clampedStart = Math.max(0, startOffset);
  // Visual span includes both check-in and checkout calendar columns (checkout day is the departure date).
  const endExclusive = Math.min(dates.length, endOffset + 1);

  return {
    start: clampedStart,
    span: Math.max(1, endExclusive - clampedStart),
  };
}

export function getOccupiedCells(room: GridRoom, dates: Date[]): Set<number> {
  const occupied = new Set<number>();
  room.bookings.forEach((booking) => {
    const pos = getBookingColumns(booking, dates);
    if (pos) {
      const nightCols = booking.nights > 0 ? booking.nights : 1;
      for (let i = 0; i < nightCols; i++) {
        const idx = pos.start + i;
        if (idx < dates.length) occupied.add(idx);
      }
    }
  });
  return occupied;
}

export function computeDailyStats(
  groups: RoomCategoryGroup[],
  dates: Date[],
): DailyStats[] {
  const totalRooms = groups.reduce((sum, g) => sum + g.rooms.length, 0);

  return dates.map((date) => {
    let occupiedCount = 0;
    groups.forEach((group) => {
      group.rooms.forEach((room) => {
        const hasBooking = room.bookings.some((b) => {
          return date >= b.checkIn && date < b.checkOut;
        });
        if (hasBooking) occupiedCount++;
      });
    });

    const occupancyPercent =
      totalRooms > 0
        ? Math.round((occupiedCount / totalRooms) * 10000) / 100
        : 0;

    return {
      date,
      bookingsCount: occupiedCount,
      occupancyPercent,
      availableRooms: totalRooms - occupiedCount,
    };
  });
}

export const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Loose shape for Firestore `reservation` rows (see staff `getReservationsInRange`). */
export type DbReservationRow = {
  bookingId?: string;
  name?: string;
  status?: string;
  nights?: number;
  email?: string;
  phone?: string;
  roomNo?: string;
  checkIn?: string;
  checkOut?: string;
  /** Headcount stored on some documents (preferred when present). */
  people?: number;
  /** Alternate field used in some UIs / APIs. */
  numberOfGuests?: string | number;
  guests?: { name?: string; id?: string }[];
  numberOfRooms?: number;
  payment?: {
    totalPrice?: number;
    price?: number;
    paymentStatus?: string;
    mode?: string;
  };
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function deriveBookingStatusFromDates(
  checkIn: Date,
  checkOut: Date,
  referenceDay: Date,
  bookingId?: string,
): BookingStatus {
  if (bookingId?.startsWith("RES")) return "reservation";
  const inD = startOfDay(checkIn);
  const outD = startOfDay(checkOut);
  const t = startOfDay(referenceDay);
  if (t < inD) return "reservation";
  if (t > outD) return "checkout";
  return "ongoing";
}

/** When Firestore has an explicit status, prefer it over date-only inference (avoids e.g. `reservation` in DB showing as green "ongoing" on stay/checkout days). */
function mapDbRowStatusToBookingStatus(
  status: unknown,
): BookingStatus | undefined {
  if (typeof status !== "string") return undefined;
  const s = status.trim().toLowerCase();
  if (
    s === "checkout" ||
    s === "ongoing" ||
    s === "reservation" ||
    s === "housekeeping" ||
    s === "maintenance" ||
    s === "no_show" ||
    s === "available"
  ) {
    return s as BookingStatus;
  }
  if (s === "pending") return "reservation";
  return undefined;
}

function mapDbPaymentStatus(s: unknown): PaymentStatus | undefined {
  if (s === "paid" || s === "pending" || s === "partial" || s === "refunded") {
    return s;
  }
  return undefined;
}

function mapDbPaymentMode(m: unknown): PaymentMode | undefined {
  if (
    m === "credit_card" ||
    m === "debit_card" ||
    m === "upi" ||
    m === "net_banking" ||
    m === "cash"
  ) {
    return m;
  }
  if (m === "online") return "net_banking";
  return undefined;
}

/** Resolves guest count from DB fields (Firestore may use `people`, `numberOfGuests`, `guests`, or `numberOfRooms`). */
function peopleFromDbRow(row: DbReservationRow): number {
  const direct = row.people;
  if (typeof direct === "number" && Number.isFinite(direct) && direct >= 1) {
    return Math.floor(direct);
  }
  const ng = row.numberOfGuests;
  if (ng !== undefined && ng !== null && ng !== "") {
    const n = typeof ng === "number" ? ng : parseInt(String(ng), 10);
    if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  }
  const guests = Array.isArray(row.guests) ? row.guests : [];
  if (guests.length > 0) return guests.length;
  const rooms = Number(row.numberOfRooms);
  if (Number.isFinite(rooms) && rooms >= 1) return Math.floor(rooms);
  return 1;
}

/**
 * Maps a hotel DB reservation document to a dashboard {@link BookingBlock}.
 * Preserves the full API/Firestore payload on {@link BookingBlock.dbReservation}.
 */
export function mapDbReservationToBookingBlock(
  raw: unknown,
  referenceDay: Date,
): BookingBlock | null {
  const row = raw as DbReservationRow;
  const bookingId = row.bookingId?.trim();
  if (!bookingId || !row.checkIn || !row.checkOut) return null;

  const checkIn = new Date(row.checkIn);
  const checkOut = new Date(row.checkOut);
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return null;
  }

  const people = peopleFromDbRow(row);

  const amount =
    typeof row.payment?.totalPrice === "number"
      ? row.payment.totalPrice
      : typeof row.payment?.price === "number"
        ? row.payment.price
        : 0;

  const derivedStatus = bookingId.startsWith("RES")
    ? "reservation"
    : (mapDbRowStatusToBookingStatus(row.status) ??
      deriveBookingStatusFromDates(checkIn, checkOut, referenceDay, bookingId));

  return {
    id: bookingId,
    orderId: bookingId,
    guestName: row.name?.trim() || "Guest",
    phone: row.phone || undefined,
    email: row.email || undefined,
    people,
    nights: Math.max(1, Number(row.nights) || 1),
    amount,
    status: derivedStatus,
    checkIn,
    checkOut,
    paymentStatus: mapDbPaymentStatus(row.payment?.paymentStatus),
    paymentMode: mapDbPaymentMode(row.payment?.mode),
    roomNo: row.roomNo?.trim(),
    dbReservation: raw as Record<string, unknown>,
  };
}

/**
 * Overlays live reservations onto the static room grid: any room whose `roomNo`
 * appears in the API list gets its `bookings` replaced by mapped rows (others unchanged).
 */
export function mergeDbReservationsIntoGroups(
  groups: RoomCategoryGroup[],
  apiReservations: unknown[] | null | undefined,
  referenceDay: Date,
): RoomCategoryGroup[] {
  if (!apiReservations || !Array.isArray(apiReservations)) {
    return groups;
  }

  const byRoomNo = new Map<string, BookingBlock[]>();

  for (const row of apiReservations) {
    const raw = row as DbReservationRow;
    const roomNo = raw.roomNo?.trim();
    if (!roomNo) continue;

    const block = mapDbReservationToBookingBlock(row, referenceDay);
    if (!block) continue;

    const list = byRoomNo.get(roomNo) ?? [];
    list.push(block);
    byRoomNo.set(roomNo, list);
  }

  for (const [roomNo, list] of byRoomNo) {
    const seen = new Set<string>();
    const deduped = list.filter((b) => {
      if (seen.has(b.orderId)) return false;
      seen.add(b.orderId);
      return true;
    });
    deduped.sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
    byRoomNo.set(roomNo, deduped);
  }

  if (byRoomNo.size === 0) return groups;

  return groups.map((g) => ({
    ...g,
    rooms: g.rooms.map((r) => {
      const live = byRoomNo.get(r.roomNo.trim());
      if (live && live.length > 0) {
        return {
          ...r,
          bookings: live.map((b) => ({
            ...b,
            checkIn: new Date(b.checkIn),
            checkOut: new Date(b.checkOut),
          })),
        };
      }
      return r;
    }),
  }));
}

/**
 * Maps a live room (from getLiveRooms API) to a BookingBlock for display on the grid.
 * The full LiveRoomData is preserved in dbReservation for access in the sheet.
 */
export function mapLiveRoomToBookingBlock(
  liveRoom: LiveRoomData,
): BookingBlock | null {
  const bd = liveRoom.bookingDetails;
  if (!bd || !bd.bookingId || !bd.checkIn || !bd.checkOut) return null;

  const checkIn = new Date(bd.checkIn);
  const checkOut = new Date(bd.checkOut);
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return null;
  }

  const statusLower = (bd.status || "").toLowerCase();
  const mappedStatus: BookingStatus =
    statusLower === "occupied" ? "ongoing" : "ongoing";

  return {
    id: bd.bookingId,
    orderId: bd.bookingId,
    guestName: bd.customer?.name?.trim() || "Guest",
    phone: bd.customer?.phone || undefined,
    email: bd.customer?.email || undefined,
    people: bd.noOfGuests || 1,
    nights: Math.max(1, bd.nights || 1),
    amount: bd.payment?.totalPrice || bd.payment?.price || 0,
    status: mappedStatus,
    checkIn,
    checkOut,
    paymentStatus: mapDbPaymentStatus(bd.payment?.paymentStatus),
    paymentMode: mapDbPaymentMode(bd.payment?.mode),
    roomNo: bd.location?.trim(),
    attendant: bd.attendant || undefined,
    specialRequirements: bd.specialRequirements || undefined,
    dbReservation: liveRoom as unknown as Record<string, unknown>,
  };
}

/**
 * Merges live rooms (ongoing bookings from getLiveRooms) into the grid groups.
 * Live room bookings take precedence over existing bookings for the same room.
 * Preserves existing reservations that don't conflict with live rooms.
 */
export function mergeLiveRoomsIntoGroups(
  groups: RoomCategoryGroup[],
  liveRoomsResponse: LiveRoomsResponse | null | undefined,
): RoomCategoryGroup[] {
  if (
    !liveRoomsResponse ||
    !liveRoomsResponse.rooms ||
    !Array.isArray(liveRoomsResponse.rooms)
  ) {
    return groups;
  }

  const liveByRoomNo = new Map<string, BookingBlock>();

  for (const liveRoom of liveRoomsResponse.rooms) {
    const roomNo = liveRoom.bookingDetails?.location?.trim();
    if (!roomNo) continue;

    const block = mapLiveRoomToBookingBlock(liveRoom);
    if (!block) continue;

    liveByRoomNo.set(roomNo, block);
  }

  if (liveByRoomNo.size === 0) return groups;

  return groups.map((g) => ({
    ...g,
    rooms: g.rooms.map((r) => {
      const liveBlock = liveByRoomNo.get(r.roomNo.trim());
      if (liveBlock) {
        const existingNonConflicting = r.bookings.filter((b) => {
          if (b.id === liveBlock.id || b.orderId === liveBlock.orderId)
            return false;
          const liveStart = liveBlock.checkIn.getTime();
          const liveEnd = liveBlock.checkOut.getTime();
          const bStart = b.checkIn.getTime();
          const bEnd = b.checkOut.getTime();
          return bEnd <= liveStart || bStart >= liveEnd;
        });

        const mergedBookings = [
          ...existingNonConflicting,
          {
            ...liveBlock,
            checkIn: new Date(liveBlock.checkIn),
            checkOut: new Date(liveBlock.checkOut),
          },
        ];

        mergedBookings.sort(
          (a, b) => a.checkIn.getTime() - b.checkIn.getTime(),
        );

        return {
          ...r,
          bookings: mergedBookings,
        };
      }
      return r;
    }),
  }));
}

/**
 * Client-side equivalent of staff `getReservationsInRange`: reservations whose check-in
 * falls within [startDate, endDate] using the same day-boundary rules as the server.
 */
export function filterReservationsForDashboardRange(
  allReservations: unknown,
  startDate: Date,
  endDate: Date,
): unknown[] {
  if (!Array.isArray(allReservations)) return [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return allReservations.filter((reservation: { checkIn?: string }) => {
    if (!reservation?.checkIn) return false;
    const checkInDate = new Date(reservation.checkIn);
    return checkInDate >= start && checkInDate <= end;
  });
}

/**
 * Client-side equivalent of staff `getLiveRooms` fields from a `hotel` document snapshot.
 */
export function liveRoomsFromHotelSnapshot(
  data: Record<string, unknown>,
): { rooms: LiveRoomData[]; status?: LiveRoomsResponse["status"] } | null {
  const live = data.live as
    | {
        rooms?: unknown;
        roomsData?: { status?: LiveRoomsResponse["status"] };
      }
    | undefined;
  if (!live?.rooms || !Array.isArray(live.rooms)) return null;
  return {
    rooms: live.rooms as LiveRoomData[],
    status: live.roomsData?.status,
  };
}

/**
 * Calculates the total pending amount from a live room's transactions, orders, services.
 */
export function calculateLiveRoomPendingTotal(liveRoom: LiveRoomData): number {
  let total = 0;

  if (liveRoom.bookingDetails?.payment?.paymentStatus === "pending") {
    total += liveRoom.bookingDetails.payment.totalPrice || 0;
  }

  if (liveRoom.diningDetails?.orders) {
    for (const order of liveRoom.diningDetails.orders) {
      if (order.payment?.paymentStatus === "pending") {
        total += order.payment.totalPrice || 0;
      }
    }
  }

  if (liveRoom.servicesUsed) {
    for (const service of liveRoom.servicesUsed) {
      if (
        service.payment?.paymentStatus === "pending" &&
        service.status?.toLowerCase() !== "cancelled"
      ) {
        total += service.payment.totalPrice || 0;
      }
    }
  }

  return total;
}
