/**
 * Supplier Scoring and Metrics
 * Tracks supplier performance and calculates preference rankings
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type {
  Supplier,
  SupplierMetricsData,
  DeliveryRecord,
  PurchaseOrder,
} from "@/types/inventory";
import {
  calculateReliabilityScore,
  calculatePriceScore,
  calculateCombinedScore,
} from "./skuIntelligence";

// ============================================
// Supplier Metrics Calculations
// ============================================

/**
 * Calculate average lead time from delivery records
 */
export function calculateAvgLeadTime(deliveries: DeliveryRecord[]): number {
  if (deliveries.length === 0) return 7; // Default 7 days

  const totalDays = deliveries.reduce((sum, d) => {
    const sent = new Date(d.expectedDate);
    // Estimate sent date by subtracting expected lead time
    const received = new Date(d.actualDate);
    const days = Math.floor(
      (received.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + Math.max(days, 1);
  }, 0);

  return Math.round(totalDays / deliveries.length);
}

/**
 * Update supplier metrics after receiving a PO
 */
export function updateSupplierMetricsFromPO(
  currentMetrics: SupplierMetricsData | undefined,
  po: PurchaseOrder,
  receivedDate: string,
  itemsReceived: {
    supplierId: string;
    orderedQty: number;
    receivedQty: number;
    qualityOk: boolean;
  }[]
): SupplierMetricsData {
  const existingDeliveries = currentMetrics?.deliveries || [];

  // Group by supplier for this PO
  const newDelivery: DeliveryRecord = {
    poId: po.id,
    expectedDate: po.expectedDeliveryDate || po.sentAt || po.createdAt,
    actualDate: receivedDate,
    orderedQty: itemsReceived.reduce((sum, i) => sum + i.orderedQty, 0),
    receivedQty: itemsReceived.reduce((sum, i) => sum + i.receivedQty, 0),
    qualityOk: itemsReceived.every((i) => i.qualityOk),
  };

  const allDeliveries = [...existingDeliveries, newDelivery];

  // Keep only last 20 deliveries for performance
  const recentDeliveries = allDeliveries.slice(-20);

  return {
    deliveries: recentDeliveries,
    avgLeadTimeDays: calculateAvgLeadTime(recentDeliveries),
    reliabilityScore: calculateReliabilityScore(recentDeliveries),
  };
}

// ============================================
// Supplier Ranking
// ============================================

/**
 * Rank suppliers for a specific item based on scores
 */
export function rankSuppliersForItem(
  suppliers: Supplier[],
  supplierMetrics: Record<string, SupplierMetricsData>,
  pricesBySupplier: Record<string, number> // avg price by supplier for this item
): {
  supplierId: string;
  supplierName: string;
  priceScore: number;
  reliabilityScore: number;
  combinedScore: number;
}[] {
  // Find lowest price
  const prices = Object.values(pricesBySupplier).filter((p) => p > 0);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return suppliers
    .map((supplier) => {
      const metrics = supplierMetrics[supplier.id];
      const avgPrice = pricesBySupplier[supplier.id] || 0;

      const priceScore =
        avgPrice > 0 ? calculatePriceScore(avgPrice, lowestPrice) : 50;
      const reliabilityScore = metrics?.reliabilityScore || 50;
      const combinedScore = calculateCombinedScore(priceScore, reliabilityScore);

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        priceScore,
        reliabilityScore,
        combinedScore,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

/**
 * Select the preferred supplier for an item
 */
export function selectPreferredSupplier(
  suppliers: Supplier[],
  supplierMetrics: Record<string, SupplierMetricsData>,
  pricesBySupplier: Record<string, number>
): string {
  const rankings = rankSuppliersForItem(
    suppliers,
    supplierMetrics,
    pricesBySupplier
  );

  return rankings.length > 0 ? rankings[0].supplierId : "";
}

// ============================================
// Database Operations
// ============================================

/**
 * Update supplier metrics in Firestore
 */
export async function updateSupplierMetricsInDB(
  userEmail: string,
  supplierId: string,
  metricsData: SupplierMetricsData
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Inventory document does not exist");
      return false;
    }

    const store = docSnap.data().store;
    const currentMetrics = store?.supplierMetrics || {};

    await updateDoc(docRef, {
      "store.supplierMetrics": {
        ...currentMetrics,
        [supplierId]: metricsData,
      },
    });

    console.log(`Supplier metrics updated for ${supplierId}`);
    return true;
  } catch (error) {
    console.error("Error updating supplier metrics:", error);
    return false;
  }
}

/**
 * Get all supplier metrics
 */
export async function getAllSupplierMetrics(
  userEmail: string
): Promise<Record<string, SupplierMetricsData>> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {};
    }

    return docSnap.data().store?.supplierMetrics || {};
  } catch (error) {
    console.error("Error fetching supplier metrics:", error);
    return {};
  }
}

/**
 * Update metrics for all suppliers involved in a PO receipt
 */
export async function updateMetricsOnPOReceipt(
  userEmail: string,
  po: PurchaseOrder
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const store = docSnap.data().store;
    const currentMetrics = store?.supplierMetrics || {};

    // Group items by supplier
    const itemsBySupplier: Record<
      string,
      { orderedQty: number; receivedQty: number; qualityOk: boolean }[]
    > = {};

    po.items.forEach((item) => {
      if (!itemsBySupplier[item.supplier.name]) {
        itemsBySupplier[item.supplier.name] = [];
      }
      itemsBySupplier[item.supplier.name].push({
        orderedQty: item.quantity,
        receivedQty: item.receivedQty || 0,
        qualityOk: item.qualityOk ?? true,
      });
    });

    const updatedMetrics = { ...currentMetrics };

    for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
      const itemsWithSupplierId = items.map((i) => ({
        ...i,
        supplierId,
      }));

      updatedMetrics[supplierId] = updateSupplierMetricsFromPO(
        currentMetrics[supplierId],
        po,
        po.receivedAt || new Date().toISOString(),
        itemsWithSupplierId
      );
    }

    await updateDoc(docRef, {
      "store.supplierMetrics": updatedMetrics,
    });

    console.log("Supplier metrics updated for PO:", po.id);
    return true;
  } catch (error) {
    console.error("Error updating metrics on PO receipt:", error);
    return false;
  }
}
