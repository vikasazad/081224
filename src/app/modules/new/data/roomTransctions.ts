import { RoomTransactionsData, TransactionItem, FolioSummary, GuestInfo, SystemInfo } from '../types/roomTransctions';

export const transactionItems: TransactionItem[] = [
  {
    id: 'txn-1',
    date: 'Oct 12, 2023',
    roomNumber: '402',
    against: 'Nightly Stay',
    attendant: 'System (Auto)',
    orderId: 'SYS-100234',
    payment: 'account',
    time: '15:00',
    amount: 850.00,
    finalAmount: 850.00,
    status: 'posted',
  },
  {
    id: 'txn-2',
    date: 'Oct 12, 2023',
    roomNumber: '402',
    against: 'Room Service',
    attendant: 'Elena S.',
    orderId: 'POS-9921',
    payment: 'room_charge',
    time: '19:42',
    couponCode: 'LOYALTY10',
    amount: 142.50,
    finalAmount: 128.25,
    status: 'posted',
  },
  {
    id: 'txn-3',
    date: 'Oct 13, 2023',
    roomNumber: '402',
    against: 'Deep Tissue Massage',
    attendant: 'Marcus V.',
    orderId: 'SPA-8872',
    payment: 'room_charge',
    time: '11:15',
    amount: 220.00,
    finalAmount: 220.00,
    status: 'posted',
  },
  {
    id: 'txn-4',
    date: 'Oct 13, 2023',
    roomNumber: '402',
    against: 'Express Laundry',
    attendant: 'Sarah K.',
    orderId: 'SRV-4421',
    payment: 'cash',
    time: '16:30',
    amount: 45.00,
    finalAmount: 45.00,
    status: 'paid',
  },
  {
    id: 'txn-5',
    date: 'Oct 14, 2023',
    roomNumber: '402',
    against: 'Minibar Restock',
    attendant: 'John D.',
    orderId: 'INV-0091',
    payment: 'room_charge',
    time: '09:12',
    amount: 12.00,
    finalAmount: 12.00,
    status: 'pending',
  },
];

export const folioSummary: FolioSummary = {
  runningTotal: 2105.25,
  appliedCoupons: 14.25,
  taxRate: 10,
  taxAmount: 210.53,
  folioBalance: 2301.53,
};

export const guestInfo: GuestInfo = {
  id: 'guest-avb',
  name: 'Alexander Van Der Bellen',
  folioStatus: 'active',
};

export const systemInfo: SystemInfo = {
  version: '2023 V4.2.0',
  fiscalId: 'GB-992-110-22',
  isEncrypted: true,
  isVerified: true,
  folioTransmissionActive: true,
};

export const getRoomTransactionsData = (roomId: string): RoomTransactionsData => {
  const roomNumber = roomId.replace('room-', '');
  
  return {
    roomInfo: {
      id: roomId,
      roomNumber: roomNumber,
      name: 'Deluxe Suite',
      categoryName: 'Deluxe Suite',
    },
    guest: guestInfo,
    transactions: transactionItems,
    folioSummary: folioSummary,
    systemInfo: systemInfo,
  };
};

export const calculateFolioSummary = (transactions: TransactionItem[]): FolioSummary => {
  const runningTotal = transactions.reduce((sum, txn) => sum + txn.finalAmount, 0);
  const appliedCoupons = transactions.reduce((sum, txn) => sum + (txn.amount - txn.finalAmount), 0);
  const taxRate = 10;
  const taxAmount = runningTotal * (taxRate / 100);
  const folioBalance = runningTotal + taxAmount - appliedCoupons;

  return {
    runningTotal,
    appliedCoupons,
    taxRate,
    taxAmount,
    folioBalance,
  };
};
