/**
 * Migration Utilities for Inventory Data
 * One-time migrations for updating existing data structure
 */

import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { generateSupplierId } from "./idGenerator";
import type { Supplier } from "@/types/inventory";

/**
 * Migrate existing suppliers to have unique IDs
 * This is a one-time migration that adds 'id' field to all suppliers
 * that don't already have one
 */
export async function migrateSupplierIds(userEmail: string): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Inventory document does not exist");
      return false;
    }

    const store = docSnap.data().store;
    const suppliers = store?.suppliers || [];

    // Check if migration is needed
    const needsMigration = suppliers.some(
      (supplier: Partial<Supplier>) => !supplier.id
    );

    if (!needsMigration) {
      console.log("All suppliers already have IDs. No migration needed.");
      return true;
    }

    // Add IDs to suppliers that don't have them
    const updatedSuppliers = suppliers.map(
      (supplier: Partial<Supplier>, index: number) => {
        if (supplier.id) {
          return supplier;
        }

        // Generate unique ID with slight delay to ensure uniqueness
        const id = `${generateSupplierId()}-${index}`;
        return { ...supplier, id };
      }
    );

    // Save updated suppliers back to Firestore
    await updateDoc(docRef, {
      "store.suppliers": updatedSuppliers,
    });

    console.log(
      `Successfully migrated ${
        updatedSuppliers.filter(
          (_: Partial<Supplier>, i: number) => !suppliers[i]?.id
        ).length
      } suppliers with IDs`
    );
    return true;
  } catch (error) {
    console.error("Error migrating supplier IDs:", error);
    return false;
  }
}

/**
 * Migrate existing items to ensure numeric types for quantity/reorderLevel
 * and add default values for new fields
 */
export async function migrateItemFields(userEmail: string): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Inventory document does not exist");
      return false;
    }

    const store = docSnap.data().store;
    const items = store?.items || [];

    // Update items with proper types and new fields
    const updatedItems = items.map((item: Record<string, unknown>) => ({
      ...item,
      // Ensure numeric types
      quantity:
        typeof item.quantity === "string"
          ? parseFloat(item.quantity as string) || 0
          : item.quantity,
      reorderLevel:
        typeof item.reorderLevel === "string"
          ? parseFloat(item.reorderLevel as string) || 0
          : item.reorderLevel,
      unitPrice:
        typeof item.unitPrice === "string"
          ? parseFloat(item.unitPrice as string) || 0
          : item.unitPrice || 0,
      amount:
        typeof item.amount === "string"
          ? parseFloat(item.amount as string) || 0
          : item.amount || 0,
      // Add missing fields with defaults
      quantityUnit: item.quantityUnit || "pcs",
      description: item.description || "",
      batchNo: item.batchNo || "",
      date: item.date || new Date().toISOString(),
      paymentMode: item.paymentMode || "",
      supplierGst: item.supplierGst || "",
    }));

    await updateDoc(docRef, {
      "store.items": updatedItems,
    });

    console.log(`Successfully migrated ${updatedItems.length} items`);
    return true;
  } catch (error) {
    console.error("Error migrating items:", error);
    return false;
  }
}

/**
 * Initialize new collections for enhanced features
 */
export async function initializeEnhancedCollections(
  userEmail: string
): Promise<boolean> {
  try {
    const docRef = doc(db, userEmail, "inventory");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Inventory document does not exist");
      return false;
    }

    const store = docSnap.data().store;

    // Only add collections that don't exist
    const updates:any = {};

    if (!store?.purchaseOrders) {
      updates["store.purchaseOrders"] = [];
    }
    if (!store?.stockCounts) {
      updates["store.stockCounts"] = [];
    }
    if (!store?.stockAdjustments) {
      updates["store.stockAdjustments"] = [];
    }
    if (!store?.skuIntelligence) {
      updates["store.skuIntelligence"] = {};
    }
    if (!store?.supplierMetrics) {
      updates["store.supplierMetrics"] = {};
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(docRef, updates);
      console.log("Initialized new collections:", Object.keys(updates));
    } else {
      console.log("All collections already initialized");
    }

    return true;
  } catch (error) {
    console.error("Error initializing collections:", error);
    return false;
  }
}

/**
 * Run all migrations
 */
export async function runAllMigrations(userEmail: string): Promise<boolean> {
  console.log("Starting inventory migrations...");

  const supplierMigration = await migrateSupplierIds(userEmail);
  if (!supplierMigration) {
    console.error("Supplier migration failed");
    return false;
  }

  const itemMigration = await migrateItemFields(userEmail);
  if (!itemMigration) {
    console.error("Item migration failed");
    return false;
  }

  const collectionInit = await initializeEnhancedCollections(userEmail);
  if (!collectionInit) {
    console.error("Collection initialization failed");
    return false;
  }

  console.log("All migrations completed successfully!");
  return true;
}
