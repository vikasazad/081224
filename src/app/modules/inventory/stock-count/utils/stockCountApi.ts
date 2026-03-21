/**
 * Stock Count API Functions
 * Handles physical inventory counts, variance tracking, and approvals
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  generateNextStockCountId,
  generateAdjustmentId,
} from "../../utils/idGenerator";
import type {
  StockCount,
  StockCountItem,
  StockCountStatus,
  StockAdjustment,
  InventoryItem,
  VarianceReasonCode,
  // VARIANCE_PERCENT_THRESHOLD,
  // VARIANCE_VALUE_THRESHOLD,
} from "@/types/inventory";

const DEFAULT_USER_EMAIL = "vikumar.azad@gmail.com";

// Threshold constants (imported from types but redefined for runtime)
const VARIANCE_PERCENT_LIMIT = 5;
const VARIANCE_VALUE_LIMIT = 500;

// ============================================
// Stock Count CRUD Operations
// ============================================

/**
 * Create a new stock count session
 */
export async function createStockCount(
  countedBy: string,
  category?: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<StockCount | null> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const store = docSnap.data().store;
    const items: InventoryItem[] = store?.items || [];
    const existingCounts: StockCount[] = store?.stockCounts || [];

    // Generate unique ID
    const id = generateNextStockCountId(existingCounts.map((sc) => sc.id));

    // Filter items by category if specified
    const filteredItems = category
      ? items.filter((item) => item.category === category)
      : items;

    // Create count items from inventory
    const countItems: StockCountItem[] = filteredItems.map((item) => ({
      sku: item.sku,
      itemName: item.name,
      systemQty: item.quantity,
      actualQty: null,
      variance: 0,
      variancePercent: 0,
      varianceValue: 0,
      requiresApproval: false,
    }));

    const newStockCount: StockCount = {
      id,
      date: new Date().toISOString().split("T")[0],
      category,
      status: "in-progress",
      countedBy,
      items: countItems,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(docRef, {
      "store.stockCounts": [...existingCounts, newStockCount],
    });

    console.log(`Stock count ${id} created successfully`);
    return newStockCount;
  } catch (error) {
    console.error("Error creating stock count:", error);
    return null;
  }
}

/**
 * Get all stock counts
 */
export async function getStockCounts(
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<StockCount[]> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    return docSnap.data().store?.stockCounts || [];
  } catch (error) {
    console.error("Error fetching stock counts:", error);
    return [];
  }
}

/**
 * Get a single stock count by ID
 */
export async function getStockCountById(
  id: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<StockCount | null> {
  try {
    const stockCounts = await getStockCounts(userEmail);
    return stockCounts.find((sc) => sc.id === id) || null;
  } catch (error) {
    console.error("Error fetching stock count:", error);
    return null;
  }
}

/**
 * Update a stock count item with actual quantity
 */
export async function updateStockCountItem(
  countId: string,
  sku: string,
  actualQty: number,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const stockCounts: StockCount[] = store?.stockCounts || [];
    const items: InventoryItem[] = store?.items || [];

    // Find the count
    const countIndex = stockCounts.findIndex((sc) => sc.id === countId);
    if (countIndex === -1) {
      return false;
    }

    const count = stockCounts[countIndex];

    // Find the item
    const itemIndex = count.items.findIndex((item) => item.sku === sku);
    if (itemIndex === -1) {
      return false;
    }

    const countItem = count.items[itemIndex];
    const inventoryItem = items.find((i) => i.sku === sku);
    const unitPrice = inventoryItem?.unitPrice || 0;

    // Calculate variance
    const variance = actualQty - countItem.systemQty;
    const variancePercent =
      countItem.systemQty > 0
        ? Math.abs((variance / countItem.systemQty) * 100)
        : actualQty > 0
        ? 100
        : 0;
    const varianceValue = Math.abs(variance * unitPrice);

    // Determine if approval is required
    const requiresApproval =
      variancePercent > VARIANCE_PERCENT_LIMIT ||
      varianceValue > VARIANCE_VALUE_LIMIT;

    // Update the item
    const updatedItem: StockCountItem = {
      ...countItem,
      actualQty,
      variance,
      variancePercent: Math.round(variancePercent * 100) / 100,
      varianceValue: Math.round(varianceValue * 100) / 100,
      requiresApproval,
    };

    count.items[itemIndex] = updatedItem;
    stockCounts[countIndex] = count;

    await updateDoc(docRef, {
      "store.stockCounts": stockCounts,
    });

    return true;
  } catch (error) {
    console.error("Error updating stock count item:", error);
    return false;
  }
}

/**
 * Update stock count item with reason code and notes
 */
export async function updateStockCountItemReason(
  countId: string,
  sku: string,
  reasonCode: VarianceReasonCode,
  notes?: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const stockCounts: StockCount[] = docSnap.data().store?.stockCounts || [];

    const countIndex = stockCounts.findIndex((sc) => sc.id === countId);
    if (countIndex === -1) {
      return false;
    }

    const count = stockCounts[countIndex];
    const itemIndex = count.items.findIndex((item) => item.sku === sku);
    if (itemIndex === -1) {
      return false;
    }

    count.items[itemIndex] = {
      ...count.items[itemIndex],
      reasonCode,
      notes,
    };

    stockCounts[countIndex] = count;

    await updateDoc(docRef, {
      "store.stockCounts": stockCounts,
    });

    return true;
  } catch (error) {
    console.error("Error updating reason code:", error);
    return false;
  }
}

// ============================================
// Status Transitions
// ============================================

/**
 * Submit stock count for review
 */
export async function submitForReview(
  countId: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  return updateStockCountStatus(countId, "pending-review", userEmail);
}

/**
 * Submit stock count for approval (when variances require approval)
 */
export async function submitForApproval(
  countId: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  return updateStockCountStatus(countId, "pending-approval", userEmail);
}

/**
 * Approve a stock count and apply adjustments
 */
export async function approveStockCount(
  countId: string,
  approvedBy: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const stockCounts: StockCount[] = store?.stockCounts || [];

    const countIndex = stockCounts.findIndex((sc) => sc.id === countId);
    if (countIndex === -1) {
      return false;
    }

    // Update status
    stockCounts[countIndex] = {
      ...stockCounts[countIndex],
      status: "completed",
      completedAt: new Date().toISOString(),
      approvedBy,
      approvedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, {
      "store.stockCounts": stockCounts,
    });

    // Apply adjustments
    await applyStockAdjustments(countId, approvedBy, userEmail);

    console.log(`Stock count ${countId} approved`);
    return true;
  } catch (error) {
    console.error("Error approving stock count:", error);
    return false;
  }
}

/**
 * Reject a stock count
 */
export async function rejectStockCount(
  countId: string,
  reason: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const stockCounts: StockCount[] = docSnap.data().store?.stockCounts || [];

    const countIndex = stockCounts.findIndex((sc) => sc.id === countId);
    if (countIndex === -1) {
      return false;
    }

    stockCounts[countIndex] = {
      ...stockCounts[countIndex],
      status: "rejected",
    };

    await updateDoc(docRef, {
      "store.stockCounts": stockCounts,
    });

    console.log(`Stock count ${countId} rejected: ${reason}`);
    return true;
  } catch (error) {
    console.error("Error rejecting stock count:", error);
    return false;
  }
}

/**
 * Update stock count status
 */
async function updateStockCountStatus(
  countId: string,
  status: StockCountStatus,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const stockCounts: StockCount[] = docSnap.data().store?.stockCounts || [];

    const countIndex = stockCounts.findIndex((sc) => sc.id === countId);
    if (countIndex === -1) {
      return false;
    }

    stockCounts[countIndex] = {
      ...stockCounts[countIndex],
      status,
    };

    await updateDoc(docRef, {
      "store.stockCounts": stockCounts,
    });

    return true;
  } catch (error) {
    console.error("Error updating stock count status:", error);
    return false;
  }
}

// ============================================
// Adjustments
// ============================================

/**
 * Apply stock adjustments from a completed count
 */
export async function applyStockAdjustments(
  countId: string,
  adjustedBy: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const stockCounts: StockCount[] = store?.stockCounts || [];
    const items: InventoryItem[] = store?.items || [];
    const adjustments: StockAdjustment[] = store?.stockAdjustments || [];

    const count = stockCounts.find((sc) => sc.id === countId);
    if (!count) {
      return false;
    }

    const newAdjustments: StockAdjustment[] = [];

    // Apply each variance as an adjustment
    const updatedItems = items.map((item) => {
      const countItem = count.items.find((ci) => ci.sku === item.sku);

      if (countItem && countItem.actualQty !== null && countItem.variance !== 0) {
        // Create adjustment record
        newAdjustments.push({
          id: generateAdjustmentId(),
          stockCountId: countId,
          date: new Date().toISOString(),
          sku: item.sku,
          systemQtyBefore: countItem.systemQty,
          actualQty: countItem.actualQty,
          variance: countItem.variance,
          reasonCode: countItem.reasonCode || "other",
          notes: countItem.notes || "",
          adjustedBy,
          approvedBy: adjustedBy,
          approvedAt: new Date().toISOString(),
        });

        // Update item quantity
        return {
          ...item,
          quantity: countItem.actualQty,
          lastUpdated: new Date().toISOString(),
          status: getStockStatus(countItem.actualQty, item.reorderLevel),
        };
      }

      return item;
    });

    // Save updates
    await updateDoc(docRef, {
      "store.items": updatedItems,
      "store.stockAdjustments": [...adjustments, ...newAdjustments],
    });

    console.log(`Applied ${newAdjustments.length} adjustments from ${countId}`);
    return true;
  } catch (error) {
    console.error("Error applying stock adjustments:", error);
    return false;
  }
}

/**
 * Get all stock adjustments
 */
export async function getStockAdjustments(
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<StockAdjustment[]> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    return docSnap.data().store?.stockAdjustments || [];
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    return [];
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get stock status based on quantity and reorder level
 */
function getStockStatus(
  quantity: number,
  reorderLevel: number
): "In Stock" | "Low Stock" | "Out of Stock" {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}

/**
 * Calculate count completion percentage
 */
export function getCountCompletionPercent(count: StockCount): number {
  if (count.items.length === 0) return 100;

  const countedItems = count.items.filter(
    (item) => item.actualQty !== null
  ).length;

  return Math.round((countedItems / count.items.length) * 100);
}

/**
 * Check if count has variances requiring approval
 */
export function hasVariancesRequiringApproval(count: StockCount): boolean {
  return count.items.some((item) => item.requiresApproval);
}

/**
 * Get pending approval counts
 */
export async function getPendingApprovalCounts(
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<StockCount[]> {
  const counts = await getStockCounts(userEmail);
  return counts.filter((count) => count.status === "pending-approval");
}
