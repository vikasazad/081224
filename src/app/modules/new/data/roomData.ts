import { RoomDashboardData, RoomInfo, TimelineDay, ActivityLogEntry, InventoryItem, AlertNotification } from '../types/roomData';
import { BookingSource, PaymentMode, PaymentStatus, StayStatus } from '../types/roomcategory';
import { RoomStatus } from '../types/allrooms';

export const roomInfoMap: Record<string, RoomInfo> = {
  'room-402': {
    id: 'room-402',
    roomNumber: '402',
    name: 'Deluxe Suite',
    categoryId: 'deluxe-suite',
    categoryName: 'Deluxe Suite',
    status: 'available',
    dailyRate: 12500,
  },
  'room-401': {
    id: 'room-401',
    roomNumber: '401',
    name: 'Deluxe Suite',
    categoryId: 'deluxe-suite',
    categoryName: 'Deluxe Suite',
    status: 'available',
    dailyRate: 12000,
  },
  'room-403': {
    id: 'room-403',
    roomNumber: '403',
    name: 'Deluxe Suite',
    categoryId: 'deluxe-suite',
    categoryName: 'Deluxe Suite',
    status: 'in_preparation',
    dailyRate: 12500,
  },
  'room-201': {
    id: 'room-201',
    roomNumber: '201',
    name: 'Standard Room',
    categoryId: 'standard',
    categoryName: 'Standard',
    status: 'available',
    dailyRate: 5500,
  },
  'room-202': {
    id: 'room-202',
    roomNumber: '202',
    name: 'Standard Room',
    categoryId: 'standard',
    categoryName: 'Standard',
    status: 'occupied',
    dailyRate: 5500,
  },
};

const formatDate = (date: Date): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
};

const getDayOfWeek = (date: Date): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[date.getDay()];
};

const getShortDayOfWeek = (date: Date): string => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
};

export const generateTimeline = (centerDate: Date = new Date()): TimelineDay[] => {
  const timeline: TimelineDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statusPatterns: Record<number, RoomStatus> = {
    [-12]: 'booked',
    [-11]: 'booked',
    [-10]: 'available',
    [-8]: 'occupied',
    [-7]: 'occupied',
    [-6]: 'occupied',
    [-5]: 'in_preparation',
    [-3]: 'booked',
    [-2]: 'booked',
    [-1]: 'booked',
    [0]: 'occupied',
    [1]: 'occupied',
    [2]: 'in_preparation',
    [5]: 'booked',
    [6]: 'booked',
    [7]: 'booked',
    [10]: 'maintenance',
    [12]: 'booked',
    [13]: 'booked',
  };

  for (let i = -15; i <= 15; i++) {
    const date = new Date(centerDate);
    date.setDate(centerDate.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isFuture = date > today;

    timeline.push({
      date: formatDate(date),
      fullDate: new Date(date),
      dayOfWeek: getShortDayOfWeek(date),
      status: statusPatterns[i] || 'available',
      isToday,
      isPast,
      isFuture,
      bookingId: statusPatterns[i] === 'booked' || statusPatterns[i] === 'occupied' ? `BK-${99000 + Math.abs(i)}` : undefined,
      guestName: statusPatterns[i] === 'booked' || statusPatterns[i] === 'occupied' ? 'Guest' : undefined,
      maintenanceNote: statusPatterns[i] === 'maintenance' ? 'Scheduled AC maintenance' : undefined,
    });
  }

  return timeline;
};

export const generateActivityLog = (roomId: string): ActivityLogEntry[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entries: ActivityLogEntry[] = [];

  const sampleGuests: Array<{
    name: string;
    phone: string;
    email: string;
    source: BookingSource;
  }> = [
    { name: 'David Chen', phone: '+91 96543 21087', email: 'david.chen@gmail.com', source: 'mmt' },
    { name: 'Sarah Miller', phone: '+91 85432 10976', email: 'sarah.m@outlook.com', source: 'goibibo' },
    { name: 'Robert Kim', phone: '+91 74321 09865', email: 'r.kim@business.co', source: 'phone' },
    { name: 'Julianna Vargos', phone: '+91 98765 43210', email: 'julianna.v@email.com', source: 'booking.com' },
    { name: 'Marcus Thorne', phone: '+91 87654 32109', email: 'marcus.thorne@corp.com', source: 'agoda' },
    { name: 'Elena Kostic', phone: '+91 76543 21098', email: 'elena.k@travel.net', source: 'website' },
    { name: 'Anna Williams', phone: '+91 93456 78901', email: 'anna.w@mail.com', source: 'walk_in' },
    { name: 'Mike Johnson', phone: '+91 82345 67890', email: 'mike.j@yahoo.com', source: 'expedia' },
  ];

  const statusOptions: StayStatus[] = ['confirmed', 'arriving_soon', 'checked_in', 'pending'];
  const paymentStatusOptions: PaymentStatus[] = ['paid', 'pending', 'partial'];
  const paymentModeOptions: PaymentMode[] = ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash'];
  const specialReqs = [
    'Late checkout requested, anniversary celebration',
    'Extra towels, hypoallergenic pillows',
    'Ground floor if possible',
    'Business trip, need work desk setup',
    'Early check-in if available',
    'Spa appointments daily, vegan meals only',
    undefined,
    undefined,
  ];

  for (let i = -15; i <= 15; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const isToday = i === 0;
    const isPast = i < 0;
    const isFuture = i > 0;

    const hasBooking = Math.random() > 0.3;

    if (hasBooking) {
      const guestIdx = Math.abs(i) % sampleGuests.length;
      const guest = sampleGuests[guestIdx];
      const amount = Math.floor(Math.random() * 50000) + 10000;
      const people = Math.floor(Math.random() * 4) + 1;

      const checkInDate = new Date(date);
      const checkOutDate = new Date(date);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1);

      entries.push({
        id: `activity-${roomId}-${i + 15}`,
        date: `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}, ${date.getFullYear()}`,
        fullDate: new Date(date),
        dayOfWeek: getDayOfWeek(date),
        isPast,
        isToday,
        isFuture,
        reservationId: `RES:STD:${2500 + Math.abs(i)}`,
        guest: {
          name: guest.name,
          initials: guest.name.split(' ').map(n => n[0]).join(''),
          phone: guest.phone,
          email: guest.email,
        },
        people,
        amount,
        paymentId: `PAY-${78600 + Math.abs(i)}`,
        bookingSource: guest.source,
        status: i < 0 ? 'confirmed' : statusOptions[Math.abs(i) % statusOptions.length],
        paymentStatus: paymentStatusOptions[Math.abs(i) % paymentStatusOptions.length],
        paymentMode: paymentModeOptions[Math.abs(i) % paymentModeOptions.length],
        checkIn: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][checkInDate.getMonth()]} ${checkInDate.getDate()}`,
        checkOut: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][checkOutDate.getMonth()]} ${checkOutDate.getDate()}`,
        specialRequirements: specialReqs[guestIdx],
      });
    } else {
      entries.push({
        id: `activity-${roomId}-${i + 15}`,
        date: `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}, ${date.getFullYear()}`,
        fullDate: new Date(date),
        dayOfWeek: getDayOfWeek(date),
        isPast,
        isToday,
        isFuture,
        status: 'available' as RoomStatus,
      });
    }
  }

  return entries.sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime());
};

export const inventoryItems: InventoryItem[] = [
  { id: 'inv-1', name: 'Mini Bar', status: 'restocked' },
  { id: 'inv-2', name: 'Toiletries', status: 'ok' },
  { id: 'inv-3', name: 'HVAC System', status: 'maintenance_due' },
];

export const alertNotifications: AlertNotification[] = [
  {
    id: 'alert-1',
    type: 'inspection',
    title: 'Visual Inspection Required',
    description: 'Housekeeping flagged a linen update for the master suite. Verification needed before next check-in at 2:00 PM.',
    image: '/images/alerts/inspection.jpg',
    deadline: '2:00 PM',
  },
];

export const getRoomDashboardData = (roomId: string): RoomDashboardData | null => {
  const roomInfo = roomInfoMap[roomId];
  const today = new Date();

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 15);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 15);

  const formatDateRange = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (!roomInfo) {
    const defaultRoomInfo: RoomInfo = {
      id: roomId,
      roomNumber: roomId.replace('room-', ''),
      name: 'Deluxe Suite',
      categoryId: 'deluxe-suite',
      categoryName: 'Deluxe Suite',
      status: 'available',
      dailyRate: 12500,
    };

    const activityLog = generateActivityLog(roomId);

    return {
      roomInfo: defaultRoomInfo,
      timeline: generateTimeline(today),
      activityLog,
      inventory: inventoryItems,
      alerts: alertNotifications,
      dateRange: {
        start: formatDateRange(startDate),
        end: formatDateRange(endDate),
      },
      pagination: {
        showing: activityLog.filter(a => a.guest).length,
        total: 31,
      },
    };
  }

  const activityLog = generateActivityLog(roomId);

  return {
    roomInfo,
    timeline: generateTimeline(today),
    activityLog,
    inventory: inventoryItems,
    alerts: alertNotifications,
    dateRange: {
      start: formatDateRange(startDate),
      end: formatDateRange(endDate),
    },
    pagination: {
      showing: activityLog.filter(a => a.guest).length,
      total: 31,
    },
  };
};

export const filterActivityLogByDateRange = (
  activityLog: ActivityLogEntry[],
  startDate: Date,
  endDate: Date
): ActivityLogEntry[] => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return activityLog.filter(entry => {
    const entryDate = new Date(entry.fullDate);
    return entryDate >= start && entryDate <= end;
  });
};

export const exportToCSV = (data: ActivityLogEntry[], filename: string = 'room-activity-log.csv'): void => {
  const headers = [
    'Reservation ID',
    'Guest Name',
    'Phone',
    'Email',
    'People',
    'Amount',
    'Payment ID',
    'Booking Source',
    'Check In',
    'Check Out',
    'Status',
    'Payment Status',
    'Payment Mode',
    'Special Requirements',
    'Date',
    'Day'
  ];

  const rows = data.map(entry => [
    entry.reservationId || '-',
    entry.guest?.name || '-',
    entry.guest?.phone || '-',
    entry.guest?.email || '-',
    entry.people?.toString() || '-',
    entry.amount?.toString() || '-',
    entry.paymentId || '-',
    entry.bookingSource || '-',
    entry.checkIn || '-',
    entry.checkOut || '-',
    entry.status || '-',
    entry.paymentStatus || '-',
    entry.paymentMode || '-',
    entry.specialRequirements || '-',
    entry.date,
    entry.dayOfWeek
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printActivityLog = (data: ActivityLogEntry[], roomInfo: RoomInfo): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Room ${roomInfo.roomNumber} - Activity Log</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        .room-info { text-align: center; margin-bottom: 30px; color: #666; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        .confirmed { background: #dcfce7; color: #166534; }
        .pending { background: #fef3c7; color: #92400e; }
        .paid { background: #dcfce7; color: #166534; }
        @media print {
          body { padding: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Room ${roomInfo.roomNumber} - ${roomInfo.name}</h1>
      <p class="room-info">${roomInfo.categoryName} | Daily Rate: ${formatCurrency(roomInfo.dailyRate)}</p>
      <table>
        <thead>
          <tr>
            <th>Reservation ID</th>
            <th>Guest</th>
            <th>Phone</th>
            <th>Email</th>
            <th>People</th>
            <th>Amount</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          ${data.filter(entry => entry.guest).map(entry => `
            <tr>
              <td>${entry.reservationId || '-'}</td>
              <td>${entry.guest?.name || '-'}</td>
              <td>${entry.guest?.phone || '-'}</td>
              <td>${entry.guest?.email || '-'}</td>
              <td>${entry.people || '-'}</td>
              <td>${entry.amount ? formatCurrency(entry.amount) : '-'}</td>
              <td>${entry.checkIn || '-'}</td>
              <td>${entry.checkOut || '-'}</td>
              <td><span class="status-badge ${entry.status}">${entry.status}</span></td>
              <td><span class="status-badge ${entry.paymentStatus}">${entry.paymentStatus || '-'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
