"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

interface SelectedItem {
  sku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface AddItemsToSupplierFormProps {
  inventoryItems: InventoryItem[]; // All available inventory items
  onSave: (items: SelectedItem[]) => void;
  onCancel: () => void;
}

export function AddItemsToSupplierForm({
  inventoryItems,
  onSave,
  onCancel,
}: AddItemsToSupplierFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return inventoryItems;
    }

    const query = searchQuery.toLowerCase();
    return inventoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [inventoryItems, searchQuery]);

  // Get selected items data
  const selectedItemsData = useMemo(() => {
    return inventoryItems.filter((item) => selectedItems.has(item.sku));
  }, [inventoryItems, selectedItems]);

  // Calculate total
  const totalAmount = useMemo(() => {
    let total = 0;
    selectedItemsData.forEach((item) => {
      const qty = itemQuantities[item.sku] || 1;
      const price = itemPrices[item.sku] ?? item.unitPrice;
      total += qty * price;
    });
    return total;
  }, [selectedItemsData, itemQuantities, itemPrices]);

  const handleToggleItem = (sku: string) => {
    const newSelected = new Set(selectedItems);

    if (newSelected.has(sku)) {
      // Remove item
      newSelected.delete(sku);

      // Clean up quantities and prices
      const newQuantities = { ...itemQuantities };
      const newPrices = { ...itemPrices };
      delete newQuantities[sku];
      delete newPrices[sku];
      setItemQuantities(newQuantities);
      setItemPrices(newPrices);
    } else {
      // Add item
      newSelected.add(sku);

      // Set default quantity and price
      const item = inventoryItems.find((i) => i.sku === sku);
      if (item) {
        setItemQuantities((prev) => ({ ...prev, [sku]: 1 }));
        setItemPrices((prev) => ({ ...prev, [sku]: item.unitPrice }));
      }
    }

    setSelectedItems(newSelected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.size === 0) {
      alert("Please select at least one item");
      return;
    }

    const items: SelectedItem[] = selectedItemsData.map((item) => {
      const qty = itemQuantities[item.sku] || 1;
      const price = itemPrices[item.sku] ?? item.unitPrice;
      return {
        sku: item.sku,
        itemName: item.name,
        quantity: qty,
        unitPrice: price,
        amount: qty * price,
      };
    });

    onSave(items);
  };

  const hasSelectedItems = selectedItems.size > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search items, SKU, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-300"
        />
      </div>

      {/* Items List - Full Width */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="h-[50vh] overflow-y-auto scrollbar-hide pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isSelected = selectedItems.has(item.sku);
              const isLowStock = item.quantity <= item.reorderLevel;
              const isOutOfStock = item.quantity === 0;

              return (
                <div
                  key={item.sku}
                  className={`p-4 rounded-lg border transition-all ${
                    isSelected
                      ? "border-slate-400 bg-slate-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
                        {isLowStock && !isOutOfStock && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                            LOW
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                            OUT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.sku} • {item.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                      {/* Stock Info */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Current
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.quantity}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Reorder
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.reorderLevel}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Price
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{item.unitPrice}
                        </p>
                      </div>

                      {/* Add/Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.sku)}
                        className={`p-2.5 rounded-full transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Plus
                          className={`h-4 w-4 transition-transform ${
                            isSelected ? "rotate-45" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No items found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Total and Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          {hasSelectedItems && (
            <>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedItems.size}</span> item
                {selectedItems.size !== 1 ? "s" : ""} selected
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Total Amount:{" "}
                <span className="text-slate-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-slate-900 text-white hover:bg-slate-800"
            disabled={!hasSelectedItems}
          >
            Save Items ({selectedItems.size})
          </Button>
        </div>
      </div>
    </form>
  );
}
