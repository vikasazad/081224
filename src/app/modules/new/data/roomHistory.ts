import { RoomHistoryData, RoomMetrics, HistoryEntry, InsightCard, RevenueIntelligence } from '../types/roomHistory';

export const roomMetrics: RoomMetrics = {
  lifetimeRevenue: {
    amount: 142850.00,
    currency: 'USD',
    changePercentage: 12.4,
    trend: 'up',
  },
  averageOccupancy: {
    percentage: 94.2,
    comparison: 'floor average',
    isExceeding: true,
  },
  activeMaintenance: {
    status: 'none',
    lastCheck: '4 days ago',
  },
};

export const historyEntries: HistoryEntry[] = [
  {
    id: 'hist-1',
    date: 'Oct 12 - 15',
    dateRange: 'Oct 12 - 15',
    year: '2023',
    provider: {
      name: 'Elena Mistral',
      type: 'guest',
      subtitle: 'Loyalty Member (Gold)',
      initials: 'EM',
    },
    entryType: 'stay',
    amount: 1450.00,
    isNegative: false,
    status: 'completed',
  },
  {
    id: 'hist-2',
    date: 'Oct 08',
    year: '2023',
    provider: {
      name: 'Rapid Air HVAC',
      type: 'service',
      subtitle: 'Routine Filter Change',
      initials: 'RA',
    },
    entryType: 'maintenance',
    amount: 120.00,
    isNegative: true,
    status: 'internal',
  },
  {
    id: 'hist-3',
    date: 'Sep 28',
    year: '2023',
    provider: {
      name: 'Julian Weber',
      type: 'guest',
      subtitle: 'Connectivity Issue',
      initials: 'JW',
    },
    entryType: 'refund',
    amount: 45.00,
    isNegative: true,
    status: 'processed',
  },
  {
    id: 'hist-4',
    date: 'Sep 25',
    year: '2023',
    provider: {
      name: 'Marcus Chen',
      type: 'guest',
      subtitle: 'Business Traveler',
      initials: 'MC',
    },
    entryType: 'stay',
    amount: 2100.00,
    isNegative: false,
    status: 'completed',
  },
  {
    id: 'hist-5',
    date: 'Sep 20',
    year: '2023',
    provider: {
      name: 'CleanPro Services',
      type: 'service',
      subtitle: 'Deep Cleaning',
      initials: 'CP',
    },
    entryType: 'cleaning',
    amount: 85.00,
    isNegative: true,
    status: 'internal',
  },
];

export const insightCards: InsightCard[] = [
  {
    id: 'insight-1',
    type: 'predictive',
    icon: 'trending-up',
    title: 'Predictive Analysis',
    description: 'Occupancy predicted to hit 98% in Q4',
  },
  {
    id: 'insight-2',
    type: 'operational',
    icon: 'shield-check',
    title: 'Operational Health',
    description: 'Safety and sanitization audits compliant',
  },
];

export const revenueIntelligence: RevenueIntelligence = {
  title: 'Revenue Intelligence',
  description: 'The historical logs indicate a strong preference for high-end corporate stays during mid-week cycles. Operational health is at 100% compliance.',
  image: '/images/revenue-intelligence.jpg',
};

export const getRoomHistoryData = (roomId: string): RoomHistoryData => {
  const roomNumber = roomId.replace('room-', '');
  
  return {
    roomInfo: {
      id: roomId,
      roomNumber: roomNumber,
      name: 'Deluxe Suite',
      categoryName: 'Deluxe Suite',
      status: 'available',
      dailyRate: 12500,
    },
    metrics: roomMetrics,
    historyEntries: historyEntries,
    insights: insightCards,
    revenueIntelligence: revenueIntelligence,
    dateRange: {
      start: 'Oct 14, 2023',
      end: 'Nov 13, 2023',
    },
    pagination: {
      showing: '1-15',
      total: 248,
      currentPage: 1,
      totalPages: 17,
    },
  };
};
