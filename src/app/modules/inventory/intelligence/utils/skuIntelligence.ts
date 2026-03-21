/**
 * SKU Intelligence Algorithm
 * Calculates usage patterns, reorder points, and suggested quantities
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type {
  Transaction,
  InventoryItem,
  SKUIntelligenceData,
  UsageRecord,
  PriceRecord,
} from "@/types/inventory";

// ============================================
// Helper Functions for Enhanced Algorithm
// ============================================

/**
 * Detect outlier transactions (>3x average)
 * Returns filtered transactions and outlier count
 */
function detectOutliers(
  transactions: Transaction[]
): { filtered: Transaction[]; outliersCount: number } {
  if (transactions.length === 0) {
    return { filtered: [], outliersCount: 0 };
  }

  // Calculate initial average
  const totalQty = transactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const avgQty = totalQty / transactions.length;

  // Filter out transactions > 3x average
  const threshold = avgQty * 3;
  const filtered = transactions.filter((t) => Math.abs(t.quantity) <= threshold);
  const outliersCount = transactions.length - filtered.length;

  return { filtered, outliersCount };
}

/**
 * Calculate weighted average giving more weight to recent data
 * 60% weight to last 7 days, 40% to previous 23 days
 */
function calculateWeightedAverage(
  recentUsage: number,
  historicalUsage: number
): number {
  return recentUsage * 0.6 + historicalUsage * 0.4;
}

/**
 * Detect usage trend: INCREASING, DECREASING, or STABLE
 */
function detectTrend(
  recent7DaysAvg: number,
  previous23DaysAvg: number
): "INCREASING" | "DECREASING" | "STABLE" {
  const threshold = 0.15; // 15% change threshold

  if (recent7DaysAvg > previous23DaysAvg * (1 + threshold)) {
    return "INCREASING";
  } else if (recent7DaysAvg < previous23DaysAvg * (1 - threshold)) {
    return "DECREASING";
  }
  return "STABLE";
}

/**
 * Calculate dynamic safety factor based on item properties and trend
 */
function getDynamicSafetyFactor(
  item: InventoryItem,
  trend: "INCREASING" | "DECREASING" | "STABLE"
): number {
  let baseFactor = 1.5;

  // Lower safety factor for perishables
  if (item.isPerishable) {
    baseFactor = 1.2;
  }

  // Adjust based on trend
  if (trend === "INCREASING") {
    return baseFactor + 0.2; // More buffer for increasing demand
  } else if (trend === "DECREASING") {
    return Math.max(baseFactor - 0.2, 1.1); // Less buffer, but minimum 1.1x
  }

  return baseFactor;
}

// ============================================
// Usage Calculations
// ============================================


/**
 * Calculate average daily usage for an item based on transactions
 * Enhanced with outlier detection and weighted averages
 * Considers: Sale, Stock Out, Adjustment (negative quantities)
 */
export function calculateAvgDailyUsage(
  sku: string,
  transactions: Transaction[],
  days: number = 30,
  item?: InventoryItem
): { avgDailyUsage: number; outliersDetected: number } {
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Filter relevant transactions for this SKU
  const relevantTransactions = transactions.filter((t) => {
    const txDate = new Date(t.dateTime);
    return (
      t.sku === sku &&
      txDate >= cutoffDate &&
      (t.transactionType === "Sale" ||
        t.transactionType === "Stock Out" ||
        (t.transactionType === "Adjustment" && t.quantity < 0))
    );
  });

  if (relevantTransactions.length === 0) {
    return { avgDailyUsage: 0, outliersDetected: 0 };
  }

  // Detect and filter outliers
  const { filtered, outliersCount } = detectOutliers(relevantTransactions);

  // For perishables, use weighted average favoring recent data more heavily
  const useWeightedAvg = item?.isPerishable || false;

  if (useWeightedAvg && filtered.length >= 7) {
    // Split into recent 7 days and previous 23 days
    const recent7Date = new Date(now);
    recent7Date.setDate(recent7Date.getDate() - 7);

    const recentTxs = filtered.filter(
      (t) => new Date(t.dateTime) >= recent7Date
    );
    const historicalTxs = filtered.filter(
      (t) => new Date(t.dateTime) < recent7Date
    );

    const recentUsage = recentTxs.reduce(
      (sum, t) => sum + Math.abs(t.quantity),
      0
    );
    const historicalUsage = historicalTxs.reduce(
      (sum, t) => sum + Math.abs(t.quantity),
      0
    );

    const recentAvg = recentUsage / 7;
    const historicalAvg = historicalUsage / 23;

    const weightedAvg = calculateWeightedAverage(recentAvg, historicalAvg);

    return { avgDailyUsage: weightedAvg, outliersDetected: outliersCount };
  }

  // Standard calculation (with outliers removed)
  const totalUsage = filtered.reduce((sum, t) => {
    return sum + Math.abs(t.quantity);
  }, 0);

  return {
    avgDailyUsage: totalUsage / days,
    outliersDetected: outliersCount,
  };
}

/**
 * Get usage records for the last N days
 */
export function getUsageByDay(
  sku: string,
  transactions: Transaction[],
  days: number = 30
): UsageRecord[] {
  const now = new Date();
  const records: Record<string, number> = {};

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    records[dateStr] = 0;
  }

  // Sum transactions by day
  transactions
    .filter(
      (t) =>
        t.sku === sku &&
        (t.transactionType === "Sale" ||
          t.transactionType === "Stock Out" ||
          (t.transactionType === "Adjustment" && t.quantity < 0))
    )
    .forEach((t) => {
      const dateStr = new Date(t.dateTime).toISOString().split("T")[0];
      if (records[dateStr] !== undefined) {
        records[dateStr] += Math.abs(t.quantity);
      }
    });

  // Convert to array
  return Object.entries(records)
    .map(([date, qty]) => ({ date, qty }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================
// Reorder Calculations
// ============================================

/**
 * Calculate suggested reorder level based on usage and lead time
 * Formula: (avgDailyUsage * avgLeadTimeDays) * safetyFactor
 */
export function calculateSuggestedReorderLevel(
  avgDailyUsage: number,
  avgLeadTimeDays: number,
  safetyFactor: number = 1.5
): number {
  if (avgDailyUsage === 0 || avgLeadTimeDays === 0) {
    return 0;
  }
  return Math.ceil(avgDailyUsage * avgLeadTimeDays * safetyFactor);
}

/**
 * Calculate suggested order quantity
 * Orders enough to cover lead time + buffer period
 */
export function calculateSuggestedOrderQty(
  avgDailyUsage: number,
  avgLeadTimeDays: number,
  currentStock: number,
  orderCycleDays: number = 14
): number {
  if (avgDailyUsage === 0) {
    return 0;
  }

  // Target stock to cover lead time + order cycle
  const targetStock = avgDailyUsage * (avgLeadTimeDays + orderCycleDays);

  // Order the difference
  const orderQty = Math.ceil(targetStock - currentStock);

  return Math.max(orderQty, 0);
}

// ============================================
// Supplier Scoring
// ============================================

/**
 * Calculate price score for a supplier
 * Higher score = better (lower) prices
 * Score = (lowestPrice / supplierAvgPrice) * 100
 */
export function calculatePriceScore(
  supplierAvgPrice: number,
  lowestMarketPrice: number
): number {
  if (supplierAvgPrice <= 0) return 0;
  const score = (lowestMarketPrice / supplierAvgPrice) * 100;
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate reliability score for a supplier based on deliveries
 * Considers: on-time delivery, quantity accuracy, quality
 */
export function calculateReliabilityScore(
  deliveries: {
    expectedDate: string;
    actualDate: string;
    orderedQty: number;
    receivedQty: number;
    qualityOk: boolean;
  }[]
): number {
  if (deliveries.length === 0) return 50; // Default score for new suppliers

  let totalScore = 0;

  deliveries.forEach((delivery) => {
    let deliveryScore = 100;

    // On-time penalty (max -30 points)
    const expected = new Date(delivery.expectedDate);
    const actual = new Date(delivery.actualDate);
    const daysLate = Math.floor(
      (actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLate > 0) {
      deliveryScore -= Math.min(daysLate * 5, 30);
    }

    // Quantity accuracy penalty (max -30 points)
    if (delivery.orderedQty > 0) {
      const qtyRatio = delivery.receivedQty / delivery.orderedQty;
      if (qtyRatio < 1) {
        deliveryScore -= Math.round((1 - qtyRatio) * 30);
      }
    }

    // Quality penalty (max -40 points)
    if (!delivery.qualityOk) {
      deliveryScore -= 40;
    }

    totalScore += Math.max(deliveryScore, 0);
  });

  return Math.round(totalScore / deliveries.length);
}

/**
 * Calculate combined supplier score
 * Weighted average of price and reliability
 */
export function calculateCombinedScore(
  priceScore: number,
  reliabilityScore: number,
  priceWeight: number = 0.4,
  reliabilityWeight: number = 0.6
): number {
  return Math.round(priceScore * priceWeight + reliabilityScore * reliabilityWeight);
}

// ============================================
// Full SKU Intelligence Update
// ============================================

/**
 * Calculate full SKU intelligence data for an item
 */
export function calculateSKUIntelligence(
  item: InventoryItem,
  transactions: Transaction[],
  priceHistory: PriceRecord[] = [],
  avgLeadTimeDays: number = 7
): SKUIntelligenceData {
  // Calculate usage with outlier detection
  const { avgDailyUsage, outliersDetected } = calculateAvgDailyUsage(
    item.sku,
    transactions,
    30,
    item
  );

  console.log("avgDailyUsage", avgDailyUsage);
  console.log("outliersDetected", outliersDetected);

  const usageLast30Days = getUsageByDay(item.sku, transactions);
  console.log("usageLast30Days", usageLast30Days);

  // Detect trend by comparing recent vs historical usage
  const now = new Date();
  const recent7Date = new Date(now);
  recent7Date.setDate(recent7Date.getDate() - 7);
  const previous23Date = new Date(now);
  previous23Date.setDate(previous23Date.getDate() - 30);

  const relevantTxs = transactions.filter((t) => {
    const txDate = new Date(t.dateTime);
    return (
      t.sku === item.sku &&
      txDate >= previous23Date &&
      (t.transactionType === "Sale" ||
        t.transactionType === "Stock Out" ||
        (t.transactionType === "Adjustment" && t.quantity < 0))
    );
  });

  const recentTxs = relevantTxs.filter(
    (t) => new Date(t.dateTime) >= recent7Date
  );
  const historicalTxs = relevantTxs.filter(
    (t) => new Date(t.dateTime) < recent7Date && new Date(t.dateTime) >= previous23Date
  );

  const recent7DaysUsage = recentTxs.reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );
  const previous23DaysUsage = historicalTxs.reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );

  const recent7DaysAvg = recent7DaysUsage / 7;
  const previous23DaysAvg = previous23DaysUsage / 23;

  const trend = detectTrend(recent7DaysAvg, previous23DaysAvg);
  console.log("trend", trend);

  // Calculate dynamic safety factor
  const safetyFactor = getDynamicSafetyFactor(item, trend);
  console.log("safetyFactor", safetyFactor);

  // Get last purchase price from price history
  const lastPurchasePrice =
    priceHistory.length > 0
      ? priceHistory[priceHistory.length - 1].price
      : item.unitPrice;

  console.log("lastPurchasePrice", lastPurchasePrice);

  // Use custom order cycle if defined
  const orderCycleDays = item.orderCycleDays || 14;

  const suggestedReorderLevel = calculateSuggestedReorderLevel(
    avgDailyUsage,
    avgLeadTimeDays,
    safetyFactor
  );

  const suggestedOrderQty = calculateSuggestedOrderQty(
    avgDailyUsage,
    avgLeadTimeDays,
    item.quantity,
    orderCycleDays
  );

  console.log("calculateSuggestedReorderLevel", suggestedReorderLevel);
  console.log("calculateSuggestedOrderQty", suggestedOrderQty);

  return {
    avgDailyUsage,
    usageLast30Days,
    suggestedReorderLevel,
    suggestedOrderQty,
    lastOrderDate: null, // Will be updated when PO is created
    avgLeadTimeDays,
    leadTimeHistory: [],
    lastPurchasePrice,
    priceHistory,
    preferredSupplierId: item.supplierId || "",
    supplierScores: [],
    lastCalculated: new Date().toISOString(),
    // Enhanced algorithm data
    trend,
    outliersDetected,
    safetyFactorUsed: safetyFactor,
  };
}

// ============================================
// Database Operations
// ============================================

/**
 * Update SKU intelligence data in Firestore
 */
export async function updateSKUIntelligenceInDB(
  userEmail: string,
  sku: string,
  intelligenceData: SKUIntelligenceData
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Inventory document does not exist");
      return false;
    }

    const store = docSnap.data().store;
    const currentIntelligence = store?.skuIntelligence || {};

    await updateDoc(docRef, {
      "store.skuIntelligence": {
        ...currentIntelligence,
        [sku]: intelligenceData,
      },
    });

    console.log(`SKU Intelligence updated for ${sku}`);
    return true;
  } catch (error) {
    console.error("Error updating SKU intelligence:", error);
    return false;
  }
}

/**
 * Get SKU intelligence data from Firestore
 */
export async function getSKUIntelligence(
  userEmail: string,
  sku: string
): Promise<SKUIntelligenceData | null> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const intelligence = docSnap.data().store?.skuIntelligence;
    return intelligence?.[sku] || null;
  } catch (error) {
    console.error("Error fetching SKU intelligence:", error);
    return null;
  }
}

/**
 * Recalculate intelligence for all SKUs
 */
export async function recalculateAllSKUIntelligence(
  userEmail: string
): Promise<boolean> {
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

    const updatedIntelligence: Record<string, SKUIntelligenceData> = {};

    for (const item of items) {
      const existingData = currentIntelligence[item.sku];
      const priceHistory = existingData?.priceHistory || [];
      const avgLeadTimeDays = existingData?.avgLeadTimeDays || 7;

      updatedIntelligence[item.sku] = calculateSKUIntelligence(
        item,
        transactions,
        priceHistory,
        avgLeadTimeDays
      );
    }

    await updateDoc(docRef, {
      "store.skuIntelligence": updatedIntelligence,
    });

    console.log(
      `Recalculated SKU intelligence for ${Object.keys(updatedIntelligence).length} items`
    );
    return true;
  } catch (error) {
    console.error("Error recalculating SKU intelligence:", error);
    return false;
  }
}
