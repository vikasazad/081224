/**
 * Stock Health API Functions
 * Queries for expiring, slow-moving, and overstocked items
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { InventoryItem } from "@/types/inventory";

// ============================================
// Query Functions
// ============================================

/**
 * Get items expiring within the specified number of days
 */
export function getExpiringSoonItems(
  items: InventoryItem[],
  days: number = 7
): InventoryItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  return items
    .filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= cutoffDate && expiryDate >= new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.expiryDate!);
      const dateB = new Date(b.expiryDate!);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Get items that are already expired
 */
export function getExpiredItems(items: InventoryItem[]): InventoryItem[] {
  const now = new Date();

  return items
    .filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate < now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.expiryDate!);
      const dateB = new Date(b.expiryDate!);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Get slow-moving items (not sold/used in specified days)
 */
export function getSlowMovingItems(
  items: InventoryItem[],
  idleDays: number = 30
): InventoryItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - idleDays);

  return items
    .filter((item) => {
      // Include items with no lastStockOutDate (never sold/used)
      if (!item.lastStockOutDate) return true;

      const lastOutDate = new Date(item.lastStockOutDate);
      return lastOutDate < cutoffDate;
    })
    .sort((a, b) => {
      // Sort by last stock out date (oldest first), items with no date at top
      if (!a.lastStockOutDate && !b.lastStockOutDate) return 0;
      if (!a.lastStockOutDate) return -1;
      if (!b.lastStockOutDate) return 1;

      const dateA = new Date(a.lastStockOutDate);
      const dateB = new Date(b.lastStockOutDate);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Get overstocked items (quantity exceeds max stock level)
 */
export function getOverstockedItems(items: InventoryItem[]): InventoryItem[] {
  return items
    .filter((item) => {
      if (!item.maxStockLevel) return false;
      return item.quantity > item.maxStockLevel;
    })
    .sort((a, b) => {
      // Sort by overage percentage (highest first)
      const overageA = a.maxStockLevel
        ? (a.quantity - a.maxStockLevel) / a.maxStockLevel
        : 0;
      const overageB = b.maxStockLevel
        ? (b.quantity - b.maxStockLevel) / b.maxStockLevel
        : 0;
      return overageB - overageA;
    });
}

/**
 * Get all stock health issues
 */
export function getAllStockHealthIssues(items: InventoryItem[]): {
  expired: InventoryItem[];
  expiringSoon: InventoryItem[];
  slowMoving: InventoryItem[];
  overstocked: InventoryItem[];
} {
  return {
    expired: getExpiredItems(items),
    expiringSoon: getExpiringSoonItems(items, 7),
    slowMoving: getSlowMovingItems(items, 30),
    overstocked: getOverstockedItems(items),
  };
}

// ============================================
// Update Functions
// ============================================

/**
 * Update item expiry date
 */
export async function updateItemExpiryDate(
  sku: string,
  expiryDate: string | null,
  userEmail: string = "vikumar.azad@gmail.com"
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const items: InventoryItem[] = docSnap.data().store?.items || [];
    const updatedItems = items.map((item) => {
      if (item.sku === sku) {
        return { ...item, expiryDate: expiryDate || undefined };
      }
      return item;
    });

    await updateDoc(docRef, {
      "store.items": updatedItems,
    });

    console.log(`Expiry date updated for ${sku}`);
    return true;
  } catch (error) {
    console.error("Error updating expiry date:", error);
    return false;
  }
}

/**
 * Update item max stock level
 */
export async function updateItemMaxStockLevel(
  sku: string,
  maxStockLevel: number | null,
  userEmail: string = "vikumar.azad@gmail.com"
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const items: InventoryItem[] = docSnap.data().store?.items || [];
    const updatedItems = items.map((item) => {
      if (item.sku === sku) {
        return { ...item, maxStockLevel: maxStockLevel || undefined };
      }
      return item;
    });

    await updateDoc(docRef, {
      "store.items": updatedItems,
    });

    console.log(`Max stock level updated for ${sku}`);
    return true;
  } catch (error) {
    console.error("Error updating max stock level:", error);
    return false;
  }
}

/**
 * Bulk update expiry dates (useful for batch imports)
 */
export async function bulkUpdateExpiryDates(
  updates: { sku: string; expiryDate: string }[],
  userEmail: string = "vikumar.azad@gmail.com"
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const items: InventoryItem[] = docSnap.data().store?.items || [];
    const updateMap = new Map(updates.map((u) => [u.sku, u.expiryDate]));

    const updatedItems = items.map((item) => {
      const newExpiryDate = updateMap.get(item.sku);
      if (newExpiryDate !== undefined) {
        return { ...item, expiryDate: newExpiryDate };
      }
      return item;
    });

    await updateDoc(docRef, {
      "store.items": updatedItems,
    });

    console.log(`Bulk updated expiry dates for ${updates.length} items`);
    return true;
  } catch (error) {
    console.error("Error bulk updating expiry dates:", error);
    return false;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since last stock out
 */
export function getDaysSinceLastStockOut(
  lastStockOutDate: string | undefined
): number | null {
  if (!lastStockOutDate) return null;

  const lastOut = new Date(lastStockOutDate);
  const now = new Date();
  const diffTime = now.getTime() - lastOut.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate overage percentage
 */
export function getOveragePercent(
  quantity: number,
  maxStockLevel: number | undefined
): number | null {
  if (!maxStockLevel || maxStockLevel <= 0) return null;
  if (quantity <= maxStockLevel) return 0;

  return Math.round(((quantity - maxStockLevel) / maxStockLevel) * 100);
}
