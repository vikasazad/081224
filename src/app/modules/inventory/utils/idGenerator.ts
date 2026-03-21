/**
 * ID Generator Utilities for Inventory Management
 * Generates unique, human-readable IDs for various entities
 */

/**
 * Generate a unique supplier ID
 * Format: SUP-{timestamp in base36}
 * Example: SUP-LX5K9A2B
 */
export function generateSupplierId(): string {
  return `SUP-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Generate a Purchase Order ID
 * Format: PO-{year}-{sequence padded to 3 digits}
 * Example: PO-2026-001
 */
export function generatePOId(year: number, sequence: number): string {
  return `PO-${year}-${sequence.toString().padStart(3, "0")}`;
}

/**
 * Generate a Stock Count ID
 * Format: SC-{year}-{sequence padded to 3 digits}
 * Example: SC-2026-001
 */
export function generateStockCountId(year: number, sequence: number): string {
  return `SC-${year}-${sequence.toString().padStart(3, "0")}`;
}

/**
 * Generate a unique Transaction ID
 * Format: TRANS-{timestamp in base36}
 * Example: TRANS-LX5K9A2B
 */
export function generateTransactionId(): string {
  return `TRANS-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Generate a unique Stock Adjustment ID
 * Format: ADJ-{timestamp in base36}
 * Example: ADJ-LX5K9A2B
 */
export function generateAdjustmentId(): string {
  return `ADJ-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Get the next sequence number for POs or Stock Counts
 * based on existing records for the given year
 */
export function getNextSequence(
  existingIds: string[],
  prefix: string,
  year: number
): number {
  const yearPrefix = `${prefix}-${year}-`;
  const relevantIds = existingIds.filter((id) => id.startsWith(yearPrefix));

  if (relevantIds.length === 0) {
    return 1;
  }

  const sequences = relevantIds.map((id) => {
    const sequencePart = id.replace(yearPrefix, "");
    return parseInt(sequencePart, 10);
  });

  return Math.max(...sequences) + 1;
}

/**
 * Generate the next Stock Count ID based on existing counts
 */
export function generateNextStockCountId(
  existingStockCountIds: string[]
): string {
  const year = new Date().getFullYear();
  const sequence = getNextSequence(existingStockCountIds, "SC", year);
  return generateStockCountId(year, sequence);
}
