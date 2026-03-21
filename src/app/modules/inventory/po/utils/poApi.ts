/**
 * Purchase Order API Functions
 * Handles CRUD operations and business logic for Purchase Orders
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type {
  PurchaseOrder,
  POItem,
  ReceivedItem,
  InventoryItem,
  POStatus,
} from "@/types/inventory";

const INVENTORY_DOC = "inventory";

/**
 * Get user email from session (placeholder - should use auth)
 */
async function getUserEmail(): Promise<string> {
  // TODO: Replace with actual auth session
  return "vikumar.azad@gmail.com";
}

/**
 * Get inventory document reference
 */
async function getInventoryDocRef() {
  const userEmail = await getUserEmail();
  return doc(db, userEmail, INVENTORY_DOC);
}

// ============================================
// Purchase Order CRUD Operations
// ============================================

/**
 * Create a new Purchase Order
 */
export async function createPurchaseOrder(
  poData: Omit<PurchaseOrder, "createdAt">
): Promise<PurchaseOrder | null> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Inventory document does not exist");
      return null;
    }

    const store = docSnap.data().store;
    const existingPOs: PurchaseOrder[] = store?.purchaseOrders || [];

    const newPO: PurchaseOrder = {
      ...poData,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(docRef, {
      "store.purchaseOrders": [...existingPOs, newPO],
    });

    console.log(`Purchase Order ${newPO.id} created successfully`);
    return newPO;
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return null;
  }
}

/**
 * Get all Purchase Orders
 */
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    return docSnap.data().store?.purchaseOrders || [];
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return [];
  }
}

/**
 * Get a single Purchase Order by ID
 */
export async function getPurchaseOrderById(
  id: string
): Promise<PurchaseOrder | null> {
  try {
    const purchaseOrders = await getPurchaseOrders();
    return purchaseOrders.find((po) => po.id === id) || null;
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return null;
  }
}

/**
 * Update a Purchase Order
 */
export async function updatePurchaseOrder(
  updatedPO: PurchaseOrder
): Promise<boolean> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const purchaseOrders: PurchaseOrder[] = store?.purchaseOrders || [];

    const updatedPOs = purchaseOrders.map((po) =>
      po.id === updatedPO.id ? updatedPO : po
    );

    await updateDoc(docRef, {
      "store.purchaseOrders": updatedPOs,
    });

    console.log(`Purchase Order ${updatedPO.id} updated successfully`);
    return true;
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return false;
  }
}

/**
 * Update Purchase Order status with metadata
 */
export async function updatePOStatus(
  id: string,
  status: POStatus,
  metadata?: {
    approvedBy?: string;
    approvedAt?: string;
    sentAt?: string;
    receivedAt?: string;
  }
): Promise<boolean> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const purchaseOrders: PurchaseOrder[] = store?.purchaseOrders || [];

    const updatedPOs = purchaseOrders.map((po) => {
      if (po.id !== id) return po;

      return {
        ...po,
        status,
        ...metadata,
      };
    });

    await updateDoc(docRef, {
      "store.purchaseOrders": updatedPOs,
    });

    console.log(`Purchase Order ${id} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error("Error updating PO status:", error);
    return false;
  }
}

/**
 * Delete a Purchase Order
 */
export async function deletePurchaseOrder(id: string): Promise<boolean> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const purchaseOrders: PurchaseOrder[] = store?.purchaseOrders || [];

    const updatedPOs = purchaseOrders.filter((po) => po.id !== id);

    await updateDoc(docRef, {
      "store.purchaseOrders": updatedPOs,
    });

    console.log(`Purchase Order ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return false;
  }
}

// ============================================
// Receiving Operations
// ============================================

/**
 * Mark items as received in a Purchase Order
 * Updates inventory quantities accordingly
 */
export async function receivePOItems(
  poId: string,
  receivedItems: ReceivedItem[]
): Promise<boolean> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const purchaseOrders: PurchaseOrder[] = store?.purchaseOrders || [];
    const items: InventoryItem[] = store?.items || [];

    // Find the PO
    const poIndex = purchaseOrders.findIndex((po) => po.id === poId);
    if (poIndex === -1) {
      console.error(`Purchase Order ${poId} not found`);
      return false;
    }

    const po = purchaseOrders[poIndex];

    // Aggregate receivedItems by SKU (handles multiple entries with same SKU)
    const receivedBySku = receivedItems.reduce<
      Record<string, { receivedQty: number; qualityOk: boolean; receiveNotes?: string }>
    >((acc, ri) => {
      if (!acc[ri.sku]) {
        acc[ri.sku] = { receivedQty: 0, qualityOk: true, receiveNotes: ri.receiveNotes };
      }
      acc[ri.sku].receivedQty += ri.receivedQty;
      acc[ri.sku].qualityOk = acc[ri.sku].qualityOk && ri.qualityOk;
      if (ri.receiveNotes && !acc[ri.sku].receiveNotes) {
        acc[ri.sku].receiveNotes = ri.receiveNotes;
      }
      return acc;
    }, {});

    // Per SKU: sum of receivedQty only where qualityOk (for inventory)
    const qtyToAddBySku = receivedItems.reduce<Record<string, number>>((acc, ri) => {
      if (ri.qualityOk) {
        acc[ri.sku] = (acc[ri.sku] ?? 0) + ri.receivedQty;
      }
      return acc;
    }, {});

    // Update PO items with received quantities (using aggregated by SKU)
    const updatedPOItems = po.items.map((poItem: POItem) => {
      const aggregated = receivedBySku[poItem.sku];
      if (aggregated) {
        return {
          ...poItem,
          receivedQty: aggregated.receivedQty,
          qualityOk: aggregated.qualityOk,
          receiveNotes: aggregated.receiveNotes,
        };
      }
      return poItem;
    });

    // Determine if fully or partially received
    const totalOrdered = updatedPOItems.reduce(
      (sum: number, item: POItem) => sum + item.quantity,
      0
    );
    const totalReceived = updatedPOItems.reduce(
      (sum: number, item: POItem) => sum + (item.receivedQty || 0),
      0
    );

    const newStatus: POStatus =
      totalReceived >= totalOrdered ? "received" : "partially-received";

    // Update the PO
    const updatedPO: PurchaseOrder = {
      ...po,
      items: updatedPOItems,
      status: newStatus,
      receivedAt: new Date().toISOString(),
    };

    purchaseOrders[poIndex] = updatedPO;

    // Update inventory quantities (sums all receivedQty per SKU where qualityOk)
    const updatedItems = items.map((item: InventoryItem) => {
      const qtyToAdd = qtyToAddBySku[item.sku] ?? 0;
      if (qtyToAdd > 0) {
        const newQuantity = item.quantity + qtyToAdd;
        return {
          ...item,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
          status: getStockStatus(newQuantity, item.reorderLevel),
        };
      }
      return item;
    });

    // Save both updates
    await updateDoc(docRef, {
      "store.purchaseOrders": purchaseOrders,
      "store.items": updatedItems,
    });

    console.log(`PO ${poId} items received successfully`);
    return true;
  } catch (error) {
    console.error("Error receiving PO items:", error);
    return false;
  }
}

// ============================================
// Reorder Helpers
// ============================================

/**
 * Get items at or below reorder level
 */
export async function getItemsAtReorderLevel(): Promise<InventoryItem[]> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    const items: InventoryItem[] = docSnap.data().store?.items || [];

    return items.filter((item) => item.quantity <= item.reorderLevel);
  } catch (error) {
    console.error("Error fetching items at reorder level:", error);
    return [];
  }
}

/**
 * Get items tracked in a specific recurring PO
 */
export async function getTrackedItems(poId: string): Promise<InventoryItem[]> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    const items: InventoryItem[] = docSnap.data().store?.items || [];

    return items.filter((item) => item.trackedInPOId === poId);
  } catch (error) {
    console.error("Error fetching tracked items:", error);
    return [];
  }
}

/**
 * Get untracked items at reorder level (for daily reorder list)
 */
export async function getUntrackedItemsAtReorder(): Promise<InventoryItem[]> {
  try {
    const docRef = await getInventoryDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    const items: InventoryItem[] = docSnap.data().store?.items || [];

    return items.filter(
      (item) => item.quantity <= item.reorderLevel && !item.trackedInPOId
    );
  } catch (error) {
    console.error("Error fetching untracked items at reorder:", error);
    return [];
  }
}

/**
 * Group items by supplier for PO creation
 */
export function groupItemsBySupplier(
  items: InventoryItem[]
): Map<string, InventoryItem[]> {
  const grouped = new Map<string, InventoryItem[]>();

  items.forEach((item) => {
    const supplierId = item.supplierId || item.supplier;
    const existing = grouped.get(supplierId) || [];
    grouped.set(supplierId, [...existing, item]);
  });

  return grouped;
}

/**
 * Calculate PO total amount
 */
export function calculatePOTotal(items: POItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Get POs by status
 */
export async function getPOsByStatus(
  status: POStatus
): Promise<PurchaseOrder[]> {
  try {
    const purchaseOrders = await getPurchaseOrders();
    return purchaseOrders.filter((po) => po.status === status);
  } catch (error) {
    console.error("Error fetching POs by status:", error);
    return [];
  }
}

/**
 * Get pending approval POs count
 */
export async function getPendingApprovalCount(): Promise<number> {
  try {
    const pending = await getPOsByStatus("pending-approval");
    return pending.length;
  } catch (error) {
    console.error("Error getting pending approval count:", error);
    return 0;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Determine stock status based on quantity and reorder level
 */
function getStockStatus(
  quantity: number,
  reorderLevel: number
): "In Stock" | "Low Stock" | "Out of Stock" {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}
