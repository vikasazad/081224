import { BookingSource, PaymentStatus, PaymentMode } from "./roomcategory";

export type BookingStatus =
  | "checkout"
  | "ongoing"
  | "reservation"
  | "housekeeping"
  | "maintenance"
  | "no_show"
  | "available";

export interface BookingBlock {
  id: string;
  orderId: string;
  guestName: string;
  phone?: string;
  email?: string;
  people: number;
  nights: number;
  amount: number;
  status: BookingStatus;
  checkIn: Date;
  checkOut: Date;
  bookingSource?: BookingSource;
  paymentStatus?: PaymentStatus;
  paymentMode?: PaymentMode;
  specialRequirements?: string;
  attendant?: string;
  inclusions?: string[];
  images?: string[];
  /** Physical room number for this booking (e.g. "101"). */
  roomNo?: string;
  /**
   * Full Firestore reservation document when this row came from `mergeDbReservationsIntoGroups`.
   * Omitted for static/demo bookings or UI-created rows until persisted.
   */
  dbReservation?: Record<string, unknown>;
}

export interface GridRoom {
  id: string;
  roomNo: string;
  categoryId: string;
  categoryName: string;
  floor: number;
  type: string;
  pricePerNight: number;
  bookings: BookingBlock[];
  amenities: string[];
  images: string[];
}

export interface RoomCategoryGroup {
  id: string;
  name: string;
  floorLabel: string;
  rooms: GridRoom[];
}

export interface DailyStats {
  date: Date;
  bookingsCount: number;
  occupancyPercent: number;
  availableRooms: number;
}

export type { BookingSource, PaymentStatus, PaymentMode };

// ─── Live Room Types (from getLiveRooms API) ───

export interface LiveRoomGst {
  sgstPercentage: number;
  gstPercentage: number;
  sgstAmount: number;
  cgstAmount: number;
  gstAmount: number;
  cgstPercentage: number;
}

export interface LiveRoomDiscount {
  discount: number;
  type: string;
  amount: number | string;
  code: string;
}

export interface LiveRoomPayment {
  totalPrice: number;
  price: number;
  mode: string;
  paymentId: string;
  subtotal: number;
  gst: LiveRoomGst;
  priceAfterDiscount: string;
  discount: LiveRoomDiscount[] | LiveRoomDiscount;
  timeOfTransaction: string;
  paymentType: string;
  referenceId: string;
  paymentStatus: string;
  transctionId?: string;
}

export interface LiveRoomGuest {
  frontIdUrl: string | null;
  backIdUrl: string | null;
  id: string;
  name: string;
}

export interface LiveRoomCustomer {
  email: string;
  notificationToken: string;
  address: string;
  guests: LiveRoomGuest[];
  phone: string;
  name: string;
}

export interface LiveRoomBookingDetails {
  status: string;
  bookingDate: string;
  aggregator: string;
  reservationId: string;
  images: string[];
  nights: number;
  customer: LiveRoomCustomer;
  specialRequirements: string;
  attendant: string;
  attendantToken: string;
  attendantContact: string;
  payment: LiveRoomPayment;
  noOfGuests: number;
  aggregatorLogo: string;
  location: string;
  verifiedAt: string;
  roomType: string;
  checkOut: string;
  noOfRoom: number;
  bookingId: string;
  checkIn: string;
  inclusions: string[];
}

export interface LiveRoomTransaction {
  bookingId: string;
  location: string;
  reservationId: string;
  attendant: string;
  payment: LiveRoomPayment;
  against: string;
}

export interface LiveRoomOrderItem {
  name: string;
  price: string;
  count: number;
  quantity: string;
  id: string;
}

export interface LiveRoomOrder {
  items: LiveRoomOrderItem[];
  timeOfFullfilment: string;
  status: string;
  specialRequirement: string;
  attendantToken: string;
  orderId: string;
  payment: LiveRoomPayment;
  attendant: string;
  attendantContact: string;
  timeOfRequest: string;
}

export interface LiveRoomDiningDetails {
  noOfGuests: number;
  attendant: string;
  attendantContact: string;
  timeOfRequest: string;
  location: string;
  attendantToken: string;
  orders: LiveRoomOrder[];
  timeOfFullfilment: string;
}

export interface LiveRoomService {
  timeOfRequest: string;
  serviceName: string;
  price: number;
  attendant: string;
  startTime: string;
  payment: LiveRoomPayment;
  serviceId: string;
  attendantToken: string;
  status: string;
  endTime: string;
  description?: string;
}

export interface LiveRoomIssue {
  attendant: string;
  name: string;
  attendantContact: string;
  category: string;
  attendantToken: string;
  issueId: string;
  status: string;
  reportTime: string;
  timeOfFullfilment: string;
  description: string;
  imageUrl?: string;
}

export interface LiveRoomStatus {
  dining: string[];
  room: string[];
  service: string[];
  issue: string[];
}

export interface LiveRoomData {
  transctions: LiveRoomTransaction[];
  issuesReported: Record<string, LiveRoomIssue>;
  bookingDetails: LiveRoomBookingDetails;
  servicesUsed: LiveRoomService[];
  diningDetails: LiveRoomDiningDetails;
  /** Post-checkout checklist payload from `ChecklistDialog` (staff checkout flow). */
  checklist?: any;
}

export interface LiveRoomsResponse {
  rooms: LiveRoomData[];
  status: LiveRoomStatus;
}
