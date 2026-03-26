export interface RoomMetrics {
  lifetimeRevenue: {
    amount: number;
    currency: string;
    changePercentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  averageOccupancy: {
    percentage: number;
    comparison: string;
    isExceeding: boolean;
  };
  activeMaintenance: {
    status: 'none' | 'active' | 'scheduled';
    count?: number;
    lastCheck: string;
  };
}

export type HistoryEntryType = 'stay' | 'maintenance' | 'refund' | 'service' | 'cleaning';

export type HistoryEntryStatus = 'completed' | 'internal' | 'processed' | 'pending' | 'cancelled';

export interface HistoryEntry {
  id: string;
  date: string;
  dateRange?: string;
  year: string;
  provider: {
    name: string;
    type: 'guest' | 'service' | 'staff';
    subtitle?: string;
    initials: string;
    avatar?: string;
  };
  entryType: HistoryEntryType;
  amount: number;
  isNegative: boolean;
  status: HistoryEntryStatus;
}

export interface InsightCard {
  id: string;
  type: 'predictive' | 'operational';
  icon: string;
  title: string;
  description: string;
}

export interface RevenueIntelligence {
  title: string;
  description: string;
  image?: string;
}

export interface RoomHistoryData {
  roomInfo: {
    id: string;
    roomNumber: string;
    name: string;
    categoryName: string;
    status: string;
    dailyRate: number;
  };
  metrics: RoomMetrics;
  historyEntries: HistoryEntry[];
  insights: InsightCard[];
  revenueIntelligence: RevenueIntelligence;
  dateRange: {
    start: string;
    end: string;
  };
  pagination: {
    showing: string;
    total: number;
    currentPage: number;
    totalPages: number;
  };
}
