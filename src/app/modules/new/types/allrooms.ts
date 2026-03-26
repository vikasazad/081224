export type RoomStatus = 'available' | 'booked' | 'occupied' | 'reserved' | 'in_preparation' | 'cleaning' | 'maintenance';

export type CategoryTier = 'premium' | 'essential' | 'luxury' | 'value';

export interface RoomCategory {
  id: string;
  name: string;
  tier: CategoryTier;
  totalRooms: number;
  availableRooms: number;
  occupancyPercentage: number;
  icon: string;
  statusBreakdown: {
    available: number;
    booked: number;
    occupied: number;
    cleaning: number;
    maintenance: number;
  };
  occupancyTrend: number[];
}

export interface RoomGuest {
  id: string;
  name: string;
  avatar?: string;
}

export interface RoomListItem {
  id: string;
  roomNumber: string;
  name: string;
  floor: number;
  view: string;
  type: string;
  categoryId: string;
  status: RoomStatus;
  pricePerNight: number;
  currentGuest?: RoomGuest;
  image?: string;
}

export interface AllRoomsData {
  categories: RoomCategory[];
  rooms: RoomListItem[];
  totalRooms: number;
}

export type RoomFilterTab = 'all' | 'occupied' | 'cleaning';

export type ActivityType = 'booking' | 'dining' | 'service' | 'issue';

export type BookingSource = 'booking.com' | 'agoda' | 'mmt' | 'goibibo' | 'website' | 'phone' | 'agent' | 'walk_in' | 'expedia' | 'airbnb';

export type ActivityStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'pending';

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded';

export interface RoomActivity {
  id: string;
  type: ActivityType;
  bookingSource?: BookingSource;
  guestName: string;
  roomNumber: string;
  roomId: string;
  people: number;
  price: number;
  status: ActivityStatus;
  attendant: string;
  paymentId: string;
  startTime: string;
  endTime: string;
  paymentStatus: PaymentStatus;
  specialRequirements?: string;
}
