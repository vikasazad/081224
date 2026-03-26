export type TransactionStatus = 'posted' | 'paid' | 'pending' | 'cancelled' | 'refunded';

export type PaymentMethod = 'account' | 'room_charge' | 'cash' | 'card' | 'online';

export interface TransactionItem {
  id: string;
  date: string;
  roomNumber: string;
  against: string;
  attendant: string;
  orderId: string;
  payment: PaymentMethod;
  time: string;
  couponCode?: string;
  amount: number;
  finalAmount: number;
  status: TransactionStatus;
}

export interface FolioSummary {
  runningTotal: number;
  appliedCoupons: number;
  taxRate: number;
  taxAmount: number;
  folioBalance: number;
}

export interface GuestInfo {
  id: string;
  name: string;
  folioStatus: 'active' | 'settled' | 'pending';
}

export interface SystemInfo {
  version: string;
  fiscalId: string;
  isEncrypted: boolean;
  isVerified: boolean;
  folioTransmissionActive: boolean;
}

export interface RoomTransactionsData {
  roomInfo: {
    id: string;
    roomNumber: string;
    name: string;
    categoryName: string;
  };
  guest: GuestInfo;
  transactions: TransactionItem[];
  folioSummary: FolioSummary;
  systemInfo: SystemInfo;
}
