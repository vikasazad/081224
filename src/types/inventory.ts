// ============================================
// Core Inventory Types
// ============================================

export interface InventoryItem {
  sku: string; // Primary identifier
  name: string;
  category: string;
  quantity: number; // Fix: was string
  quantityUnit: string;
  quantityType: string;
  unitPrice: number;
  amount: number;
  reorderLevel: number; // Fix: was string
  supplier: string; // Supplier name (legacy)
  supplierId?: string; // New: supplier ID reference
  supplierGst: string;
  batchNo: string;
  date: string;
  paymentMode: string;
  description: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  updatedBy: string;
  lastUpdated: string;
  // New fields for enhanced features:
  trackedInPOId?: string; // Which recurring PO tracks this item
  expiryDate?: string; // For expiry tracking
  maxStockLevel?: number; // For overstocked detection
  lastStockOutDate?: string; // For slow-moving detection
  // Intelligence algorithm enhancements:
  isPerishable?: boolean; // Use lower safety factors for perishables
  shelfLifeDays?: number; // Expected shelf life in days
  orderCycleDays?: number; // Custom order cycle (default: 14 days)
}

export interface EditInventoryItem
  extends Omit<InventoryItem, "status" | "amount"> {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface Category {
  name: string;
  description: string;
  updatedBy: string;
  lastUpdated: string;
}

export interface EditCategory extends Omit<Category, "lastUpdated"> {
  name: string;
  description: string;
}

export interface Supplier {
  id: string; // New: "SUP-001" format
  name: string;
  phoneNumber: string[]; // Fix: was string
  email: string;
  address: string;
  gstNumber: string[]; // Fix: was string
}

export interface EditSupplier extends Omit<Supplier, "id"> {
  id?: string; // Optional for new suppliers
  name: string;
  phoneNumber: string[];
  email: string;
  address: string;
  gstNumber: string[];
}

// ============================================
// Transaction Types
// ============================================

export type TransactionType =
  | "Sale"
  | "Purchase"
  | "Stock In"
  | "Stock Out"
  | "Adjustment"
  | "Other";

export interface Transaction {
  id: string;
  sku: string;
  name: string;
  category: string;
  transactionType: TransactionType;
  quantity: number;
  previousQuantity: number;
  supplierCustomer: string;
  dateTime: string;
  notes?: string;
}

// ============================================
// Purchase Order Types
// ============================================

export type POStatus =
  | "draft"
  | "scheduled"
  | "pending-approval"
  | "approved"
  | "sent"
  | "received"
  | "partially-received";

export type POFrequency = "daily" | "weekly" | "monthly";

export interface POItem {
  sku: string;
  itemName: string;
  supplier: Supplier;
  quantity: number;
  unitPrice: number;
  amount: number;
  receivedQty?: number;
  qualityOk?: boolean;
  receiveNotes?: string;
}

export interface PurchaseOrder {
  id: string; // "PO-2026-001"
  name: string;
  type: "one-time" | "recurring";
  frequency?: POFrequency | null;
  executionDay?: string  | null;
  autoAddReorderItems: boolean;
  status: POStatus;
  trackedItemSkus: string[];
  items: POItem[];
  totalAmount: number;
  expectedDeliveryDate?: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  sentAt?: string;
  receivedAt?: string;
}

export interface ReceivedItem {
  sku: string;
  receivedQty: number;
  qualityOk: boolean;
  receiveNotes?: string;
}

// ============================================
// SKU Intelligence Types
// ============================================

export interface UsageRecord {
  date: string;
  qty: number;
}

export interface LeadTimeRecord {
  poId: string;
  days: number;
}

export interface PriceRecord {
  date: string;
  supplierId: string;
  price: number;
}

export interface SupplierScore {
  supplierId: string;
  priceScore: number;
  reliabilityScore: number;
  combinedScore: number;
}

export interface SKUIntelligenceData {
  avgDailyUsage: number;
  usageLast30Days: UsageRecord[];
  suggestedReorderLevel: number;
  suggestedOrderQty: number;
  lastOrderDate: string | null;
  avgLeadTimeDays: number;
  leadTimeHistory: LeadTimeRecord[];
  lastPurchasePrice: number;
  priceHistory: PriceRecord[];
  preferredSupplierId: string;
  supplierScores: SupplierScore[];
  lastCalculated: string;
  // Algorithm enhancement data:
  trend: "INCREASING" | "DECREASING" | "STABLE";
  outliersDetected: number;
  safetyFactorUsed: number;
}

export interface SKUIntelligence {
  [sku: string]: SKUIntelligenceData;
}

export interface DeliveryRecord {
  poId: string;
  expectedDate: string;
  actualDate: string;
  orderedQty: number;
  receivedQty: number;
  qualityOk: boolean;
}

export interface SupplierMetricsData {
  deliveries: DeliveryRecord[];
  avgLeadTimeDays: number;
  reliabilityScore: number;
}

export interface SupplierMetrics {
  [supplierId: string]: SupplierMetricsData;
}

// ============================================
// Stock Count Types
// ============================================

export type StockCountStatus =
  | "in-progress"
  | "pending-review"
  | "pending-approval"
  | "completed"
  | "rejected";

export type VarianceReasonCode =
  | "counting-error"
  | "damage"
  | "theft"
  | "unrecorded-usage"
  | "unrecorded-receipt"
  | "other";

export interface StockCountItem {
  sku: string;
  itemName: string;
  systemQty: number;
  actualQty: number | null;
  variance: number;
  variancePercent: number;
  varianceValue: number;
  reasonCode?: VarianceReasonCode;
  notes?: string;
  requiresApproval: boolean; // true if variance > 5% or value > 500
}

export interface StockCount {
  id: string; // "SC-2026-001"
  date: string;
  category?: string; // Filter by category name
  status: StockCountStatus;
  countedBy: string;
  items: StockCountItem[];
  createdAt: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface StockAdjustment {
  id: string;
  stockCountId: string;
  date: string;
  sku: string;
  systemQtyBefore: number;
  actualQty: number;
  variance: number;
  reasonCode: string;
  notes: string;
  adjustedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ============================================
// Store Data Structure
// ============================================

export interface InventoryStore {
  items: InventoryItem[];
  categories: Category[];
  suppliers: Supplier[];
  sku: { label: string; value: string }[];
  recentTransactions: Transaction[];
  purchaseOrders?: PurchaseOrder[];
  stockCounts?: StockCount[];
  stockAdjustments?: StockAdjustment[];
  skuIntelligence?: SKUIntelligence;
  supplierMetrics?: SupplierMetrics;
}

// ============================================
// Variance Thresholds
// ============================================

export const VARIANCE_PERCENT_THRESHOLD = 5; // Alert if variance > 5%
export const VARIANCE_VALUE_THRESHOLD = 500; // Alert if variance value > 500
