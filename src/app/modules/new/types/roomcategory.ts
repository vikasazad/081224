import { RoomStatus } from './allrooms';

export interface CategoryInfo {
  id: string;
  name: string;
  displayName: string;
  totalRooms: number;
  floorRange: string;
  amenitiesIncluded: string;
  breadcrumb: {
    parent: string;
    current: string;
  };
}

export interface RoomCardItem {
  id: string;
  roomNumber: string;
  type: string;
  status: RoomStatus;
  statusDescription: string;
  statusIcon?: string;
  guestName?: string;
  lastInspected?: string;
  checkoutTime?: string;
  specialNote?: string;
}

export interface RoomCategoryData {
  categoryInfo: CategoryInfo;
  rooms: RoomCardItem[];
}

export type CategoryTab = 'all' | 'deluxe-suite' | 'standard' | 'penthouse' | 'economy';

export interface DailyPerformance {
  day: string;
  bookings: number;
  dining: number;
  services: number;
  issues: number;
}

export type NoteType = 'housekeeping' | 'concierge' | 'maintenance' | 'general';

export interface StaffNote {
  id: string;
  type: NoteType;
  content: string;
  timestamp: string;
  author?: string;
}

export type StayStatus = 'confirmed' | 'arriving_soon' | 'checked_in' | 'pending';

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded';

export type PaymentMode = 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cash';

export type BookingSource = 'booking.com' | 'agoda' | 'mmt' | 'goibibo' | 'website' | 'phone' | 'agent' | 'walk_in' | 'expedia' | 'airbnb';

export interface UpcomingStay {
  id: string;
  reservationId: string;
  guestName: string;
  phone: string;
  email: string;
  roomNumber: string;
  people: number;
  amount: number;
  paymentId: string;
  bookingSource: BookingSource;
  checkIn: string;
  checkOut: string;
  status: StayStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  specialRequirements?: string;
}
