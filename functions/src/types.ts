/**
 * Staff member interface
 */
export interface StaffMember {
  contact: string;
  active: boolean;
  role?: string;
  lastInactiveTime?: string;
  [key: string]: unknown;
}

/**
 * Receptionist member interface (extends StaffMember)
 */
export interface ReceptionistMember extends StaffMember {
  role: string;
  notificationToken?: string;
  phoneNumber?: string;
}

/**
 * Receptionist token interface for notifications
 */
export interface ReceptionistToken {
  token: string;
  phoneNumber: string;
}

/**
 * Assignment data interface
 */
export interface Assignment {
  orderId?: string;
  staffContact?: string;
  customerName?: string;
  roomNumber?: string;
  status: string;
  timestamp: number;
  [key: string]: unknown;
}
