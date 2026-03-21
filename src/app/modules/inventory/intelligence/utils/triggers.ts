/**
 * Trigger handlers for SKU Intelligence recalculation
 * Called after transactions, PO receipts, and other inventory changes
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { calculateSKUIntelligence } from "./skuIntelligence";
import { updateMetricsOnPOReceipt } from "./supplierScoring";
import type {
  Transaction,
  InventoryItem,
  PurchaseOrder,
  PriceRecord,
} from "@/types/inventory";

const DEFAULT_USER_EMAIL = "vikumar.azad@gmail.com";

// ============================================
// Transaction Triggers
// ============================================

/**
 * Called after a new transaction is recorded
 * Updates SKU intelligence for the affected item
 */
export async function onStockTransaction(
  transaction: Transaction,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  console.log("onStockTransaction trigger called for", transaction);
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const items: InventoryItem[] = store?.items || [];
    const transactions: Transaction[] = store?.recentTransactions || [];
    const currentIntelligence = store?.skuIntelligence || {};

    // Find the affected item
    const item = items.find((i) => i.sku === transaction.sku);
    if (!item) {
      console.warn(`Item with SKU ${transaction.sku} not found`);
      return false;
    }

    // Get existing intelligence data
    const existingData = currentIntelligence[transaction.sku];
    const priceHistory = existingData?.priceHistory || [];
    const avgLeadTimeDays = existingData?.avgLeadTimeDays || 7;

    // Add to price history if this is a purchase
    let updatedPriceHistory = priceHistory;
    if (
      transaction.transactionType === "Purchase" ||
      transaction.transactionType === "Stock In"
    ) {
      // Extract price from transaction if available
      // For now, use the item's unit price
      const newPriceRecord: PriceRecord = {
        date: transaction.dateTime,
        supplierId: item.supplierId || "",
        price: item.unitPrice,
      };
      updatedPriceHistory = [...priceHistory, newPriceRecord].slice(-50); // Keep last 50
    }

    // Recalculate intelligence
    const updatedIntelligence = calculateSKUIntelligence(
      item,
      transactions,
      updatedPriceHistory,
      avgLeadTimeDays
    );

    console.log("Updated intelligence:", updatedIntelligence);

    // Update in database
    await updateDoc(docRef, {
      [`store.skuIntelligence.${transaction.sku}`]: updatedIntelligence,
    });

    console.log(`SKU intelligence updated for ${transaction.sku}`);
    return true;
  } catch (error) {
    console.error("Error in onStockTransaction trigger:", error);
    return false;
  }
}

/**
 * Update lastStockOutDate when a stock out transaction occurs
 */
export async function updateLastStockOutDate(
  sku: string,
  dateTime: string,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  console.log("updateLastStockOutDate trigger called for", sku);
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const items: InventoryItem[] = store?.items || [];

    const updatedItems = items.map((item) => {
      if (item.sku === sku) {
        return { ...item, lastStockOutDate: dateTime };
      }
      return item;
    });

    await updateDoc(docRef, {
      "store.items": updatedItems,
    });

    return true;
  } catch (error) {
    console.error("Error updating lastStockOutDate:", error);
    return false;
  }
}

// ============================================
// PO Receipt Triggers
// ============================================

/**
 * Called after a PO is received
 * Updates supplier metrics and lead time history
 */
export async function onPOReceived(
  po: PurchaseOrder,
  userEmail: string = DEFAULT_USER_EMAIL
): Promise<boolean> {
  try {
    // Update supplier metrics
    await updateMetricsOnPOReceipt(userEmail, po);

    // Update lead time history for each SKU
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const currentIntelligence = store?.skuIntelligence || {};

    // Calculate lead time for this PO
    const sentDate = po.sentAt ? new Date(po.sentAt) : new Date(po.createdAt);
    const receivedDate = po.receivedAt
      ? new Date(po.receivedAt)
      : new Date();
    const leadTimeDays = Math.ceil(
      (receivedDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const updates: Record<string, unknown> = {};

    for (const poItem of po.items) {
      const existingData = currentIntelligence[poItem.sku];
      if (existingData) {
        const leadTimeHistory = [
          ...(existingData.leadTimeHistory || []),
          { poId: po.id, days: leadTimeDays },
        ].slice(-10); // Keep last 10

        // Recalculate average lead time
        const avgLeadTimeDays =
          leadTimeHistory.reduce((sum, lt) => sum + lt.days, 0) /
          leadTimeHistory.length;

        // Update price history
        const priceHistory = [
          ...(existingData.priceHistory || []),
          {
            date: po.receivedAt || new Date().toISOString(),
            supplierId: poItem.supplier.name,
            price: poItem.unitPrice,
          },
        ].slice(-50);

        updates[`store.skuIntelligence.${poItem.sku}.leadTimeHistory`] =
          leadTimeHistory;
        updates[`store.skuIntelligence.${poItem.sku}.avgLeadTimeDays`] =
          avgLeadTimeDays;
        updates[`store.skuIntelligence.${poItem.sku}.priceHistory`] =
          priceHistory;
        updates[`store.skuIntelligence.${poItem.sku}.lastPurchasePrice`] =
          poItem.unitPrice;
        updates[`store.skuIntelligence.${poItem.sku}.lastOrderDate`] =
          po.createdAt;
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(docRef, updates);
    }

    console.log(`Intelligence updated for PO ${po.id} receipt`);
    return true;
  } catch (error) {
    console.error("Error in onPOReceived trigger:", error);
    return false;
  }
}

// ============================================
// Batch Operations
// ============================================

/**
 * Recalculate suggested reorder levels based on latest intelligence
 * and optionally update item reorderLevel fields
 */
export async function syncReorderLevels(
  userEmail: string = DEFAULT_USER_EMAIL,
  applyToItems: boolean = false
): Promise<{
  suggestions: { sku: string; current: number; suggested: number }[];
}> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { suggestions: [] };
    }

    const store = docSnap.data().store;
    const items: InventoryItem[] = store?.items || [];
    const intelligence = store?.skuIntelligence || {};

    const suggestions: { sku: string; current: number; suggested: number }[] =
      [];

    const updatedItems = items.map((item) => {
      const intel = intelligence[item.sku];
      if (intel && intel.suggestedReorderLevel > 0) {
        suggestions.push({
          sku: item.sku,
          current: item.reorderLevel,
          suggested: intel.suggestedReorderLevel,
        });

        if (applyToItems) {
          return { ...item, reorderLevel: intel.suggestedReorderLevel };
        }
      }
      return item;
    });

    if (applyToItems && suggestions.length > 0) {
      await updateDoc(docRef, {
        "store.items": updatedItems,
      });
      console.log(`Applied ${suggestions.length} reorder level updates`);
    }

    return { suggestions };
  } catch (error) {
    console.error("Error syncing reorder levels:", error);
    return { suggestions: [] };
  }
}
