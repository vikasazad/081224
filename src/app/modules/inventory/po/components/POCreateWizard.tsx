"use client";

import React, { useState, useMemo, useCallback } from "react";
import { POCreateStep1 } from "./POCreateStep1";
import { POCreateStep2 } from "./POCreateStep2";
import type {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  POItem,
  POFrequency,
} from "@/types/inventory";
import { addNewSupplier } from "../../utils/inventoryAPI";

interface POCreateWizardProps {
  items: InventoryItem[];
  suppliers: Supplier[];
  onSubmit: (po: Omit<PurchaseOrder, "createdAt">) => void;
  onCancel: () => void;
  currentUser: string;
  initialPO?: PurchaseOrder | null;
}

type Step = "editor" | "review";

function poItemKey(item: POItem): string {
  return `${item.sku}-${item.supplier.name}`;
}

export function POCreateWizard({
  items,
  suppliers,
  onSubmit,
  onCancel,
  currentUser,
  initialPO,
}: POCreateWizardProps) {
  // console.log("POCREATEWIZARD DATA:", items, suppliers, currentUser);

  const [step, setStep] = useState<Step>("editor");

  // Form state - initialize from initialPO if provided
  const [poId, setPoId] = useState(initialPO?.id || "");
  const [name, setName] = useState(initialPO?.name || "");
  const [type, setType] = useState<"one-time" | "recurring">(initialPO?.type || "one-time");
  const [frequency, setFrequency] = useState<POFrequency>(initialPO?.frequency || "weekly");
  const [executionDay, setExecutionDay] = useState<string>(initialPO?.executionDay || "");
  const [orderNotes, setOrderNotes] = useState("");

  // Selected items state (Step 1) - initialize from initialPO if provided
  const [selectedItems, setSelectedItems] = useState<Set<string>>(() => {
    if (initialPO?.items) {
      return new Set(initialPO.items.map(item => item.sku));
    }
    return new Set();
  });
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(() => {
    if (initialPO?.items) {
      return initialPO.items.reduce((acc, item) => {
        acc[item.sku] = item.quantity;
        return acc;
      }, {} as Record<string, number>);
    }
    return {};
  });
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(() => {
    if (initialPO?.items) {
      return initialPO.items.reduce((acc, item) => {
        acc[item.sku] = item.unitPrice;
        return acc;
      }, {} as Record<string, number>);
    }
    return {};
  });

  // Step 2: list of PO lines (same item can appear from multiple suppliers)
  const [poItemsList, setPoItemsList] = useState<POItem[]>(initialPO?.items || []);

  const totalAmount = useMemo(
    () => poItemsList.reduce((sum, item) => sum + item.amount, 0),
    [poItemsList]
  );

  function suggestOrderQty(item: InventoryItem): number {
    // Suggest enough to bring stock to 2x reorder level
    const target = item.reorderLevel * 2;
    return Math.max(target - item.quantity, 1);
  }

  // Build initial PO items from Step 1 selection (for when entering review)
  const buildPoItemsFromStep1 = useCallback((): POItem[] => {
    // console.log(suppliers);
    // console.log(selectedItems);
    const selectedData = items.filter((i) => selectedItems.has(i.sku));
    // console.log("selectedData", selectedData);
    return selectedData.map((item) => {
      // console.log(item);
      const quantity = itemQuantities[item.sku] || suggestOrderQty(item);
      const unitPrice = itemPrices[item.sku] ?? item.unitPrice;
      const supplier = suppliers.find((s) => s.name === item.supplier) ?? null;
      return {
        sku: item.sku,
        itemName: item.name,
        supplier: supplier as Supplier,
        quantity,
        unitPrice,
        amount: quantity * unitPrice,
      };
    });
  }, [items, selectedItems, itemQuantities, itemPrices, suppliers]);

  // Item management handlers
  const handleAddItem = useCallback(
    (sku: string) => {
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.add(sku);
        return next;
      });
      const item = items.find((i) => i.sku === sku);
      if (item && !itemQuantities[sku]) {
        setItemQuantities((prev) => ({
          ...prev,
          [sku]: suggestOrderQty(item),
        }));
      }
    },
    [items, itemQuantities]
  );

  const handleRemoveItem = useCallback((sku: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(sku);
      return next;
    });
  }, []);

  const handleUpdateQuantity = useCallback((sku: string, quantity: number) => {
    setItemQuantities((prev) => ({ ...prev, [sku]: quantity }));
  }, []);

  const handleUpdatePrice = useCallback((sku: string, price: number) => {
    setItemPrices((prev) => ({ ...prev, [sku]: price }));
  }, []);

  // Update item in review step (identified by sku + supplierId so same item from multiple suppliers can be edited)
  const handleUpdateItem = useCallback(
    (
      sku: string,
      supplierName: string,
      field: keyof POItem,
      value: number | string
    ) => {
      setPoItemsList((prev) =>
        prev.map((item) => {
          if (item.sku !== sku || item.supplier.name !== supplierName)
            return item;
          const next =
            field === "quantity"
              ? { ...item, quantity: value as number }
              : field === "unitPrice"
              ? { ...item, unitPrice: value as number }
              : { ...item, [field]: value };
          next.amount =
            (next.quantity ?? item.quantity) *
            (next.unitPrice ?? item.unitPrice);
          return next;
        })
      );
    },
    []
  );

  // Reassign one line to a different supplier (identified by sku + supplier name)
  const handleReassignItem = useCallback(
    (
      sku: string,
      supplierName: string,
      newSupplierId: string,
      newSupplierName: string
    ) => {
      const newSupplier = suppliers.find(
        (s) => s.name === newSupplierName || s.id === newSupplierId
      );
      if (!newSupplier) return;
      setPoItemsList((prev) =>
        prev.map((item) =>
          item.sku === sku && item.supplier.name === supplierName
            ? { ...item, supplier: newSupplier }
            : item
        )
      );
    },
    [suppliers]
  );

  // Reorder items (newOrder is array of composite ids "sku-supplierId")
  const handleReorderItems = useCallback((newOrder: string[]) => {
    setPoItemsList((prev) => {
      const byId = new Map(prev.map((p) => [poItemKey(p), p]));
      return newOrder
        .map((id) => byId.get(id))
        .filter((p): p is POItem => p != null);
    });
  }, []);

  // Add new items from Add Supplier dialog — append to list so same item can exist from multiple suppliers
  const handleAddItems = useCallback((newItems: POItem[]) => {
    setPoItemsList((prev) => [...prev, ...newItems]);
  }, []);

  // Navigation handlers — when entering review, set poItemsList from Step 1 and keep any items added from "Add supplier"
  const handleReview = useCallback(() => {
    if(poId.trim().length === 0){
    let year;
    if (type === "one-time") {
      year = "ONT";
    } else if (type === "recurring") {
      if (frequency === "daily") {
        year = "DAL";
      } else if (frequency === "weekly") {
        year = "WEK";
      } else if (frequency === "monthly") {
        year = "MON";
      }
    }
    const random = Math.floor(Math.random() * 9000) + 1000;
    const poId = `PO-${year}-${random}`;
    setPoId(poId);
  }
    const fromStep1 = buildPoItemsFromStep1();
    // console.log("fromStep1", fromStep1);
    setPoItemsList((prev) => {
      const addedFromStep2 = prev.filter((p) =>
        String(p.supplier.name).startsWith("TEMP-")
      );
      // console.log("addedFromStep2", addedFromStep2);
      return [...fromStep1, ...addedFromStep2];
    });
    setStep("review");
  }, [buildPoItemsFromStep1, type, frequency]);

  const handleBack = useCallback(() => {
    setStep("editor");
  }, []);

  // Action handlers
  const handleSubmit = useCallback(() => {
    const uniqueSkus = Array.from(
      new Set(poItemsList.map((item) => `${item.sku}-${item.itemName}`))
    );
    console.log("UNIQUE SKUS", uniqueSkus);
    console.log("PO ITEMS LIST", poItemsList);
    const po: Omit<PurchaseOrder, "createdAt"> = {
      id: poId,
      name,
      type,
      frequency: type === "recurring" ? frequency : null,
      executionDay: type === "recurring" ? executionDay : null,
      autoAddReorderItems: false,
      status: "pending-approval",
      trackedItemSkus: type === "recurring" ? uniqueSkus : [],
      items: poItemsList,
      totalAmount,
      createdBy: currentUser,
    };
    console.log("SUBMIT PO DATA:", po);
    onSubmit(po);
  }, [
    name,
    type,
    frequency,
    executionDay,
    poItemsList,
    totalAmount,
    currentUser,
    onSubmit,
  ]);

  const handleSaveDraft = useCallback(() => {
    const uniqueSkus = Array.from(new Set(poItemsList.map((item) => item.sku)));

    const po: Omit<PurchaseOrder, "createdAt"> = {
      id: poId,
      name,
      type,
      frequency: type === "recurring" ? frequency : null,
      executionDay: type === "recurring" ? executionDay : null,
      autoAddReorderItems: false,
      status: "draft",
      trackedItemSkus: type === "recurring" ? uniqueSkus : [],
      items: poItemsList,
      totalAmount,
      createdBy: currentUser,
    };
    console.log("SAVE DRAFT PO DATA:", po);
    onSubmit(po);
  }, [
    poId,
    name,
    type,
    frequency,
    executionDay,
    poItemsList,
    totalAmount,
    currentUser,
    onSubmit,
  ]);

  const saveSupplierData = useCallback((supplierDataToSave: Supplier[]) => {
    console.log("SAVE SUPPLIER DATA", supplierDataToSave);
    supplierDataToSave.forEach(async (supplier) => {
      await addNewSupplier(supplier);
    });
  }, []);

  const handleDiscard = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Render based on current step

  const handleOrderTypeChange = useCallback(
    (type: { id: string; name: string }) => {
      console.log("TYPEEEEEE", type);
      if (type.id === "recurring") {
        setType(type.name as "recurring");
      } else if (type.id === "frequency") {
        setFrequency(type.name as POFrequency);
        setExecutionDay("");
      } else if (type.id === "execution") {
        setExecutionDay(type.name);
      } else {
        setType("one-time");
        setExecutionDay("");
      }
    },
    []
  );

  // console.log(type, frequency, executionDay);
  if (step === "editor") {
    return (
      <POCreateStep1
        items={items}
        name={name}
        setName={setName}
        onOrderTypeChange={handleOrderTypeChange}
        type={type}
        frequency={frequency}
        executionDay={executionDay}
        selectedItems={selectedItems}
        itemQuantities={itemQuantities}
        itemPrices={itemPrices}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdatePrice={handleUpdatePrice}
        onReview={handleReview}
      />
    );
  }

  return (
    <POCreateStep2
      poId={poId}
      items={items}
      suppliers={suppliers}
      poItems={poItemsList}
      name={name}
      setName={setName}
      type={type}
      setType={setType}
      frequency={frequency}
      executionDay={executionDay}
      orderNotes={orderNotes}
      setOrderNotes={setOrderNotes}
      onUpdateItem={handleUpdateItem}
      onReassignItem={handleReassignItem}
      onReorderItems={handleReorderItems}
      onAddItems={handleAddItems}
      onBack={handleBack}
      onSubmit={handleSubmit}
      saveSupplierData={saveSupplierData}
      onSaveDraft={handleSaveDraft}
      onDiscard={handleDiscard}
    />
  );
}

export default POCreateWizard;
