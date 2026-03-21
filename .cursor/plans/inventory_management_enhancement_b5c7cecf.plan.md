---
name: Inventory Management Enhancement
overview: Implement 5 major inventory management features (Purchase Order System, SKU Intelligence Algorithm, Lead Time Tracking, Stock Health Section, Physical Count with Discrepancy Alerts) while fixing existing data model inconsistencies and adding proper ID fields.
todos:
  - id: phase0-types
    content: Fix TypeScript interfaces in inventory.ts (quantity/reorderLevel as numbers, Supplier arrays, add new fields)
    status: completed
  - id: phase0-ids
    content: Create ID generator utility and add IDs to existing suppliers (one-time migration)
    status: completed
  - id: phase1-po-api
    content: Create PO API functions (poApi.ts) following existing arrayUnion/array replacement patterns
    status: completed
  - id: phase1-po-components
    content: Build PO components (POList, POCreateWizard, PODetail, POReceiveForm, DailyReorderList)
    status: completed
  - id: phase1-po-pages
    content: Create PO pages (/po, /po/create, /po/[id], /po/reorder-list)
    status: completed
  - id: phase2-sku-intel
    content: Implement SKU Intelligence algorithm (usage calc from all transaction types, supplier scoring)
    status: completed
  - id: phase2-triggers
    content: Add trigger calls in addNewTransaction() and saveInventoryItem() for SKU recalculation
    status: completed
  - id: phase3-stock-health
    content: Create Stock Health page with tabs (Expiring, Slow Moving, Overstocked)
    status: completed
  - id: phase4-stock-count-api
    content: Create Stock Count API functions (CRUD, variance handling, approvals)
    status: completed
  - id: phase4-stock-count-ui
    content: Build Stock Count components and pages
    status: completed
  - id: phase5-dashboard
    content: Update dashboard with new metric cards and widgets
    status: completed
isProject: false
---

# Inventory Management Enhancement Plan (Updated)

## Data Model Analysis

Based on the existing Firebase data and TypeScript interfaces, there are inconsistencies that need to be resolved:


| Field                        | TypeScript Interface | Actual Firebase Data |
| ---------------------------- | -------------------- | -------------------- |
| `InventoryItem.quantity`     | `string`             | `number` (5)         |
| `InventoryItem.reorderLevel` | `string`             | `number` (15)        |
| `Supplier.id`                | `number`             | Does not exist       |
| `Supplier.phoneNumber`       | `string`             | `string[]` (array)   |
| `Supplier.gstNumber`         | `string`             | `string[]` (array)   |


**Reference Strategy:**

- Items are identified by `sku` field (e.g., "ITEM001")
- Suppliers currently identified by `name` - will add `id` field (e.g., "SUP-001")
- Categories identified by `name`

---

## Phase 0: Data Model Fixes

### 0.1 Update TypeScript Interfaces

Update [src/types/inventory.ts](src/types/inventory.ts):

```typescript
export interface InventoryItem {
  sku: string;                    // Primary identifier
  name: string;
  category: string;
  quantity: number;               // Fix: was string
  quantityUnit: string;
  quantityType: string;
  unitPrice: number;
  amount: number;
  reorderLevel: number;           // Fix: was string
  supplier: string;               // Supplier name (legacy)
  supplierId?: string;            // New: supplier ID reference
  supplierGst: string;
  batchNo: string;
  date: string;
  paymentMode: string;
  description: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  updatedBy: string;
  lastUpdated: string;
  // New fields for enhanced features:
  trackedInPOId?: string;         // Which recurring PO tracks this item
  expiryDate?: string;            // For expiry tracking
  maxStockLevel?: number;         // For overstocked detection
  lastStockOutDate?: string;      // For slow-moving detection
}

export interface Supplier {
  id: string;                     // New: "SUP-001" format
  name: string;
  phoneNumber: string[];          // Fix: was string
  email: string;
  address: string;
  gstNumber: string[];            // Fix: was string
}

export interface Transaction {
  id: string;
  sku: string;
  name: string;
  category: string;
  transactionType: "Sale" | "Purchase" | "Stock In" | "Stock Out" | "Adjustment" | "Other";
  quantity: number;
  previousQuantity: number;
  supplierCustomer: string;
  dateTime: string;
  notes?: string;
}
```

### 0.2 Add ID Generation Utility

Create [src/app/modules/inventory/utils/idGenerator.ts](src/app/modules/inventory/utils/idGenerator.ts):

```typescript
export function generateSupplierId(): string {
  return `SUP-${Date.now().toString(36).toUpperCase()}`;
}

export function generatePOId(year: number, sequence: number): string {
  return `PO-${year}-${sequence.toString().padStart(3, '0')}`;
}

export function generateStockCountId(year: number, sequence: number): string {
  return `SC-${year}-${sequence.toString().padStart(3, '0')}`;
}

export function generateTransactionId(): string {
  return `TRANS-${Date.now().toString(36).toUpperCase()}`;
}
```

---

## Phase 1: Purchase Order (PO) System

### 1.1 Database Schema

Add to `store` object in Firestore:

```typescript
interface PurchaseOrder {
  id: string;                     // "PO-2026-001"
  name: string;
  type: "one-time" | "recurring";
  frequency?: "daily" | "weekly" | "monthly";
  executionDay?: string | number;
  autoAddReorderItems: boolean;
  status: "draft" | "scheduled" | "pending-approval" | "approved" | "sent" | "received" | "partially-received";
  trackedItemSkus: string[];      // Changed from trackedItemIds
  items: POItem[];
  totalAmount: number;
  expectedDeliveryDate?: string;  // New: for lead time tracking
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  sentAt?: string;
  receivedAt?: string;
}

interface POItem {
  sku: string;                    // Changed from itemId
  itemName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  receivedQty?: number;
  qualityOk?: boolean;
  receiveNotes?: string;
}
```

### 1.2 New Files

**Pages:**

- `src/app/inventory/po/page.tsx` - PO list with filters
- `src/app/inventory/po/create/page.tsx` - Multi-step PO creation
- `src/app/inventory/po/[id]/page.tsx` - PO detail, edit, receive
- `src/app/inventory/po/reorder-list/page.tsx` - Daily reorder items

**Module:**

```
src/app/modules/inventory/po/
├── components/
│   ├── POList.tsx
│   ├── PODetail.tsx
│   ├── POCreateWizard.tsx
│   ├── POItemsTable.tsx
│   ├── POReceiveForm.tsx
│   ├── DailyReorderList.tsx
│   ├── POStatusBadge.tsx
│   └── SupplierGroupCard.tsx
└── utils/
    └── poApi.ts
```

### 1.3 API Functions

In `src/app/modules/inventory/po/utils/poApi.ts`:

- `createPurchaseOrder(po)` - Uses `arrayUnion` pattern from existing code
- `getPurchaseOrders()` - Fetch from `store.purchaseOrders`
- `updatePOStatus(id, status, metadata)` - Update by finding in array
- `receivePOItems(id, receivedItems)` - Mark received, update inventory quantities
- `getItemsAtReorderLevel()` - Filter items where `quantity <= reorderLevel`

---

## Phase 2: SKU Intelligence Algorithm

### 2.1 Database Schema

Add to `store` object:

```typescript
interface SKUIntelligence {
  [sku: string]: {                // Keyed by item SKU
    avgDailyUsage: number;
    usageLast30Days: { date: string; qty: number }[];
    suggestedReorderLevel: number;
    suggestedOrderQty: number;
    lastOrderDate: string | null;
    avgLeadTimeDays: number;
    leadTimeHistory: { poId: string; days: number }[];
    lastPurchasePrice: number;
    priceHistory: { date: string; supplierId: string; price: number }[];
    preferredSupplierId: string;
    supplierScores: {
      supplierId: string;
      priceScore: number;
      reliabilityScore: number;
      combinedScore: number;
    }[];
    lastCalculated: string;
  };
}

interface SupplierMetrics {
  [supplierId: string]: {
    deliveries: {
      poId: string;
      expectedDate: string;
      actualDate: string;
      orderedQty: number;
      receivedQty: number;
      qualityOk: boolean;
    }[];
    avgLeadTimeDays: number;
    reliabilityScore: number;
  };
}
```

### 2.2 Algorithm Implementation

Create `src/app/modules/inventory/intelligence/utils/skuIntelligence.ts`:

```typescript
// Calculate usage from all transaction types
export function calculateAvgDailyUsage(
  sku: string,
  transactions: Transaction[]
): number {
  // Filter transactions for this SKU with types: Sale, Stock Out, Adjustment (negative)
  // Calculate daily average over last 30 days
}

// Update item's reorderLevel based on usage + lead time
export function calculateSuggestedReorderLevel(
  avgDailyUsage: number,
  avgLeadTimeDays: number,
  safetyBuffer: number = 1.5
): number {
  return Math.ceil(avgDailyUsage * avgLeadTimeDays * safetyBuffer);
}
```

### 2.3 Trigger Integration

Modify [src/app/modules/inventory/utils/inventoryAPI.ts](src/app/modules/inventory/utils/inventoryAPI.ts):

- In `addNewTransaction()` - call `updateSKUIntelligence()` after saving
- In `saveInventoryItem()` - update `lastStockOutDate` on Stock Out transactions

---

## Phase 3: Stock Health Section

### 3.1 New Fields on Items

Already defined in Phase 0:

- `expiryDate?: string`
- `maxStockLevel?: number`
- `lastStockOutDate?: string`

### 3.2 New Files

**Page:** `src/app/inventory/stock-health/page.tsx`

**Module:**

```
src/app/modules/inventory/stock-health/
├── components/
│   ├── StockHealth.tsx           # Tabs: Expiring | Slow Moving | Overstocked
│   ├── ExpiringSoon.tsx
│   ├── SlowMoving.tsx
│   └── Overstocked.tsx
└── utils/
    └── stockHealthApi.ts
```

### 3.3 Query Functions

```typescript
export function getExpiringSoonItems(items: Item[], days: number): Item[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return items.filter(item => 
    item.expiryDate && new Date(item.expiryDate) <= cutoff
  );
}

export function getSlowMovingItems(items: Item[], idleDays: number): Item[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - idleDays);
  return items.filter(item => 
    !item.lastStockOutDate || new Date(item.lastStockOutDate) < cutoff
  );
}

export function getOverstockedItems(items: Item[]): Item[] {
  return items.filter(item => 
    item.maxStockLevel && item.quantity > item.maxStockLevel
  );
}
```

---

## Phase 4: Physical Count & Discrepancy Alerts

### 4.1 Database Schema

Add to `store` object:

```typescript
interface StockCount {
  id: string;                     // "SC-2026-001"
  date: string;
  category?: string;              // Filter by category name
  status: "in-progress" | "pending-review" | "pending-approval" | "completed" | "rejected";
  countedBy: string;
  items: StockCountItem[];
  createdAt: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface StockCountItem {
  sku: string;                    // Changed from itemId
  itemName: string;
  systemQty: number;
  actualQty: number | null;
  variance: number;
  variancePercent: number;
  varianceValue: number;
  reasonCode?: "counting-error" | "damage" | "theft" | "unrecorded-usage" | "unrecorded-receipt" | "other";
  notes?: string;
  requiresApproval: boolean;      // true if variance > 5% or value > 500
}

interface StockAdjustment {
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
```

### 4.2 New Files

**Pages:**

- `src/app/inventory/stock-count/page.tsx`
- `src/app/inventory/stock-count/new/page.tsx`
- `src/app/inventory/stock-count/[id]/page.tsx`

**Module:**

```
src/app/modules/inventory/stock-count/
├── components/
│   ├── StockCountList.tsx
│   ├── CountSheet.tsx
│   ├── VarianceReport.tsx
│   ├── AdjustmentApproval.tsx
│   └── ReasonCodeSelect.tsx
└── utils/
    └── stockCountApi.ts
```

---

## Phase 5: Dashboard Integration

Update [src/app/modules/inventory/store/components/store.tsx](src/app/modules/inventory/store/components/store.tsx):

Add metric cards:

- **Pending POs** - Count of POs in `pending-approval` status
- **Items at Reorder** - Count of items where `quantity <= reorderLevel`
- **Expiring Soon** - Count of items expiring within 7 days
- **Pending Counts** - Count of stock counts awaiting approval

---

## Files Summary

**Files to Modify:**

- [src/types/inventory.ts](src/types/inventory.ts) - Fix interfaces, add new types
- [src/app/modules/inventory/utils/inventoryAPI.ts](src/app/modules/inventory/utils/inventoryAPI.ts) - Add SKU intelligence triggers
- [src/app/modules/inventory/store/components/store.tsx](src/app/modules/inventory/store/components/store.tsx) - Add dashboard widgets

**New Files (27 total):**

- 8 pages
- 15 components
- 4 utility files

