import { RoomStatus } from './allrooms';
import { BookingSource, PaymentMode, PaymentStatus, StayStatus } from './roomcategory';

export interface RoomInfo {
  id: string;
  roomNumber: string;
  name: string;
  categoryId: string;
  categoryName: string;
  status: RoomStatus;
  dailyRate: number;
}

export interface TimelineDay {
  date: string;
  fullDate: Date;
  dayOfWeek: string;
  status: RoomStatus;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  bookingId?: string;
  guestName?: string;
  maintenanceNote?: string;
}

export interface ActivityLogEntry {
  id: string;
  date: string;
  fullDate: Date;
  dayOfWeek: string;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  reservationId?: string;
  guest?: {
    name: string;
    initials: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
  people?: number;
  amount?: number;
  paymentId?: string;
  bookingSource?: BookingSource;
  status: RoomStatus | StayStatus;
  paymentStatus?: PaymentStatus;
  paymentMode?: PaymentMode;
  checkIn?: string;
  checkOut?: string;
  specialRequirements?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  status: 'ok' | 'restocked' | 'maintenance_due' | 'low' | 'empty';
}

export interface AlertNotification {
  id: string;
  type: 'inspection' | 'maintenance' | 'housekeeping' | 'guest_request';
  title: string;
  description: string;
  image?: string;
  deadline?: string;
}

export interface RoomDashboardData {
  roomInfo: RoomInfo;
  timeline: TimelineDay[];
  activityLog: ActivityLogEntry[];
  inventory: InventoryItem[];
  alerts: AlertNotification[];
  dateRange: {
    start: string;
    end: string;
  };
  pagination: {
    showing: number;
    total: number;
  };
}

export type { BookingSource, PaymentMode, PaymentStatus, StayStatus };
