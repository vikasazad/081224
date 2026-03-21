"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, ArrowLeft, GripVertical, Plus } from "lucide-react";
import type { Supplier, POItem, InventoryItem } from "@/types/inventory";
import { SupplierForm } from "../../addItems/components/SupplierForm";
import { AddItemsToSupplierForm } from "./AddItemsToSupplierForm";

interface POCreateStep2Props {
  poId: string;
  items: InventoryItem[]; // All inventory items for search
  suppliers: Supplier[];
  poItems: POItem[];
  // Form state
  name: string;
  setName: (name: string) => void;
  type: "one-time" | "recurring";
  setType: (type: "one-time" | "recurring") => void;
  frequency?: string;
  executionDay?: string;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  // Item management (supplierId identifies the line when same item is from multiple suppliers)
  onUpdateItem: (
    sku: string,
    supplierId: string,
    field: keyof POItem,
    value: number | string,
  ) => void;
  onReassignItem: (
    sku: string,
    supplierId: string,
    newSupplierId: string,
    newSupplierName: string,
  ) => void;
  onReorderItems: (newOrder: string[]) => void; // newOrder is array of composite ids "sku-supplierId"
  onAddItems: (items: POItem[]) => void; // New: Add items to PO
  // Navigation & Actions
  onBack: () => void;
  saveSupplierData: (supplierDataToSave: Supplier[]) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
}

// Composite id for a PO line (same SKU can appear from multiple suppliers)
function poLineId(item: POItem): string {
  return `${item.sku}-${item.supplier.name}`;
}

// Sortable Item Row Component
function SortableItemRow({
  item,
  onUpdateQuantity,
  onUpdatePrice,
}: {
  item: POItem;
  onUpdateQuantity: (qty: number) => void;
  onUpdatePrice: (price: number) => void;
}) {
  const lineId = poLineId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lineId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-100 last:border-0"
    >
      <td className="py-3 px-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="py-3 px-2 w-[30%] ">
        <span className="font-medium text-gray-900">{item.itemName}</span>
      </td>
      <td className="py-3 px-2">
        <span className="text-sm text-gray-500 font-mono">{item.sku}</span>
      </td>
      <td className="py-3 px-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(parseInt(e.target.value) || 1)}
          className="w-20 text-center border-gray-300"
        />
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center">
          <span className="text-gray-400 mr-1">₹</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => onUpdatePrice(parseFloat(e.target.value) || 0)}
            className="w-24 border-gray-300"
          />
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="font-medium text-gray-900">
          ₹{item.amount.toFixed(2)}
        </span>
      </td>
    </tr>
  );
}

// Drag Overlay Item
function DragOverlayItem({ item }: { item: POItem }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg flex items-center gap-4">
      <GripVertical className="h-4 w-4 text-gray-400" />
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-xs">📦</span>
      </div>
      <span className="font-medium text-gray-900">{item.itemName}</span>
      <span className="text-sm text-gray-500 ml-auto">
        Qty: {item.quantity}
      </span>
    </div>
  );
}

// Droppable Supplier Header – drop an item here to reassign to this supplier
function DroppableSupplierHeader({
  supplierKey,
  supplierName,
  isPriority,
}: {
  supplierKey: string;
  supplierName: string;
  isPriority: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `supplier-${supplierKey}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 px-4 py-3 flex items-center gap-3 transition-colors ${
        isOver ? "bg-blue-50 border-b-2 border-blue-400" : ""
      }`}
    >
      <span className="font-medium text-gray-900">
        Supplier: {supplierName}
      </span>
      {isPriority && (
        <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-medium rounded">
          PRIORITY PARTNER
        </span>
      )}
      {isOver && (
        <span className="ml-auto text-xs text-blue-600 font-medium">
          Drop here to reassign
        </span>
      )}
    </div>
  );
}

export function POCreateStep2({
  poId,
  items,
  suppliers,
  poItems,
  name,
  setName,
  type,
  setType,
  frequency,
  executionDay,
  orderNotes,
  setOrderNotes,
  onUpdateItem,
  onReassignItem,
  onReorderItems,
  onAddItems,
  onBack,
  saveSupplierData,
  onSubmit,
  onSaveDraft,
  onDiscard,
}: POCreateStep2Props) {
  const [activeItem, setActiveItem] = useState<POItem | null>(null);

  // Dialog state management
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState<any>(null);
  const [supplierDataToSave, setSupplierDataToSave] = useState<any>([]);

  // Handle supplier form submission
  const handleSupplierSave = (supplierData: any) => {
    console.log("Supplier data saved:", supplierData);
    setNewSupplierData(supplierData);
    setIsSupplierDialogOpen(false);
    // Open the items dialog
    setIsItemsDialogOpen(true);
    setSupplierDataToSave([...supplierDataToSave, supplierData]);
  };

  // Handle items form submission
  const handleItemsSave = (items: any[]) => {
    console.log("Items saved for supplier:", newSupplierData?.name, items);

    // Convert selected items to POItem format
    const newPOItems: POItem[] = items.map((item) => ({
      sku: item.sku,
      itemName: item.itemName,
      supplier: newSupplierData,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    }));

    // Add items to the PO
    onAddItems(newPOItems);

    // Close dialog and reset state
    setIsItemsDialogOpen(false);
    setNewSupplierData(null);
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Group items by supplier (same item can appear in multiple groups if from different suppliers)
  const groupedBySupplier = useMemo(() => {
    const groups: Record<string, POItem[]> = {};
    poItems.forEach((item) => {
      const key = item.supplier.name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [poItems]);

  // Calculate totals
  const { subtotal, totalItems, supplierCount } = useMemo(() => {
    const subtotal = poItems.reduce((sum, item) => sum + item.amount, 0);
    return {
      subtotal,
      totalItems: poItems.length,
      supplierCount: Object.keys(groupedBySupplier).length,
    };
  }, [poItems, groupedBySupplier]);

  // Drag handlers (use composite id "sku-supplierId" for lines)
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = poItems.find((item) => poLineId(item) === active.id);
    if (draggedItem) {
      setActiveItem(draggedItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a supplier group header
    if (overId.startsWith("supplier-")) {
      const newSupplierId = overId.replace("supplier-", "");
      const supplier = suppliers.find((s) => s.name === newSupplierId);
      const draggedItem = poItems.find((item) => poLineId(item) === activeId);
      if (supplier && draggedItem) {
        onReassignItem(
          draggedItem.sku,
          draggedItem.supplier.name,
          supplier.name,
          supplier.name,
        );
      }
      return;
    }

    // Find the dragged item and the target item by composite id
    const draggedItem = poItems.find((item) => poLineId(item) === activeId);
    const targetItem = poItems.find((item) => poLineId(item) === overId);

    if (!draggedItem || !targetItem) return;

    // Check if items are from different suppliers
    const draggedSupplier = draggedItem.supplier.name;
    const targetSupplier = targetItem.supplier.name;

    if (draggedSupplier !== targetSupplier) {
      // Cross-supplier drop - reassign to target's supplier
      onReassignItem(
        draggedItem.sku,
        draggedItem.supplier.name,
        targetItem.supplier.name,
        targetItem.supplier.name,
      );
      return;
    }

    // Handle reordering within the same supplier group
    if (activeId !== overId) {
      const oldIndex = poItems.findIndex((item) => poLineId(item) === activeId);
      const newIndex = poItems.findIndex((item) => poLineId(item) === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const currentOrder = poItems.map((item) => poLineId(item));
        const [movedId] = currentOrder.splice(oldIndex, 1);
        currentOrder.splice(newIndex, 0, movedId);
        onReorderItems(currentOrder);
      }
    }
  };

  const handleFinalSubmit = () => {
    console.log("kjhakdsjfhas", supplierDataToSave, supplierDataToSave.length);
    if (supplierDataToSave.length > 0) {
      onSubmit();
      saveSupplierData(supplierDataToSave);
    } else {
      onSubmit();
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className=" ">
        <div className="w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Review & Edit Multi-Supplier Order
              </h1>
              <p className="text-sm text-gray-500">
                Manage items across multiple suppliers and verify quantities
                before approval.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onDiscard}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Discard Draft
            </Button>
            <Button
              onClick={handleFinalSubmit}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Save and Send for Approval
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items + Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items by Supplier */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items by Supplier
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {supplierCount} Suppliers
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {totalItems} Items
                  </span>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="space-y-6">
                  {Object.entries(groupedBySupplier)
                    .filter(([, items]) => items.length > 0)
                    .map(([supplierKey, supplierItems]) => {
                      const supplier = suppliers.find(
                        (s) => s.name === supplierKey,
                      );
                      const supplierName = supplier?.name || supplierKey;
                      const isPriority =
                        supplierKey.includes("Alpha") ||
                        supplierKey.includes("Priority");

                      return (
                        <div
                          key={supplierKey}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Supplier Header – droppable for cross-supplier reassign */}
                          <DroppableSupplierHeader
                            supplierKey={supplierKey}
                            supplierName={supplierName}
                            isPriority={isPriority}
                          />

                          {/* Items Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                  <th className="py-2 px-2 w-10"></th>
                                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Item Details
                                  </th>
                                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    SKU
                                  </th>
                                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Quantity
                                  </th>
                                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Unit Price
                                  </th>
                                  <th className="py-2 px-2 text-right text-xs font-medium text-gray-500 uppercase">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <SortableContext
                                  items={supplierItems.map((item) =>
                                    poLineId(item),
                                  )}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {supplierItems.map((item) => (
                                    <SortableItemRow
                                      key={poLineId(item)}
                                      item={item}
                                      onUpdateQuantity={(qty) =>
                                        onUpdateItem(
                                          item.sku,
                                          item.supplier.name,
                                          "quantity",
                                          qty,
                                        )
                                      }
                                      onUpdatePrice={(price) =>
                                        onUpdateItem(
                                          item.sku,
                                          item.supplier.name,
                                          "unitPrice",
                                          price,
                                        )
                                      }
                                    />
                                  ))}
                                </SortableContext>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <DragOverlay>
                  {activeItem ? <DragOverlayItem item={activeItem} /> : null}
                </DragOverlay>
              </DndContext>

              {/* Add New Supplier Group - only for one-time orders */}
              {type === "one-time" && (
                <button
                  type="button"
                  onClick={() => setIsSupplierDialogOpen(true)}
                  className="mt-4 w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Supplier Group
                </button>
              )}
            </div>

            {/* Additional Order Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-gray-300 rounded"></div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">
                  Additional Order Notes
                </h3>
              </div>
              <Textarea
                placeholder="Add specific instructions for all suppliers here..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="min-h-[100px] border-gray-300 resize-none"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl p-6 sticky top-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Order Summary
                </h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">Order Ref: {poId}</p>

              {/* PO Name */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">
                  PO Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Order Type */}
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">
                  Order Type
                </label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as "one-time" | "recurring")}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time Order</SelectItem>
                    <SelectItem value="recurring">Recurring Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recurring Order Indicator */}
              {type === "recurring" && (
                <div className="mb-6 p-3 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-purple-600 rounded-full flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-200">
                        Recurring Order
                      </p>
                      {frequency && executionDay ? (
                        <p className="text-xs text-purple-300/80">
                          {frequency.charAt(0).toUpperCase() +
                            frequency.slice(1)}{" "}
                          on {executionDay}
                        </p>
                      ) : (
                        <p className="text-xs text-purple-300/80">
                          This order will repeat daily
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 border-t border-slate-700 pt-4">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({totalItems} Items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 uppercase">
                    Total Amount
                  </span>
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                    FINAL TOTAL
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mt-1">
                  ₹{subtotal.toFixed(2)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleFinalSubmit}
                  className="w-full bg-white text-slate-900 hover:bg-gray-100"
                >
                  Save and Send for Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={onSaveDraft}
                  className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  Save as Draft
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                Approval workflow will be triggered upon sending.
              </p>

              {/* Quick Tip */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-4 bg-slate-600 rounded mt-0.5"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Quick Tip
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag items using the handle on the left to reassign them
                      to different suppliers. Prices will update automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Dialog - Step 1 */}
      <Dialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier&apos;s information below
          </DialogDescription>
          <SupplierForm
            onSave={handleSupplierSave}
            onCancel={() => setIsSupplierDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Items Dialog - Step 2 */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogTitle>Add Items to Order</DialogTitle>
          <DialogDescription>
            Add inventory items for {newSupplierData?.name || ""}
          </DialogDescription>
          <AddItemsToSupplierForm
            inventoryItems={items}
            onSave={handleItemsSave}
            onCancel={() => {
              setIsItemsDialogOpen(false);
              setNewSupplierData(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default POCreateStep2;
