"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Filter,
  AlertTriangle,
  Check,
} from "lucide-react";
import type { InventoryItem, POFrequency } from "@/types/inventory";

interface POCreateStep1Props {
  items: InventoryItem[];
  // Form state
  name: string;
  setName: (name: string) => void;
  onOrderTypeChange: (type: { id: string; name: string }) => void;
  type: "one-time" | "recurring";
  frequency: POFrequency;
  executionDay: string;
  // Selected items state
  selectedItems: Set<string>;
  itemQuantities: Record<string, number>;
  itemPrices: Record<string, number>;
  onAddItem: (sku: string) => void;
  onRemoveItem: (sku: string) => void;
  onUpdateQuantity: (sku: string, quantity: number) => void;
  onUpdatePrice: (sku: string, price: number) => void;
  // Navigation
  onReview: () => void;
}

type FilterOption =
  | "all"
  | "reorder-level"
  | "low-stock"
  | "in-stock"
  | "out-of-stock";

export function POCreateStep1({
  items,
  name,
  setName,
  onOrderTypeChange,
  type,
  frequency,
  executionDay,
  selectedItems,
  itemQuantities,
  itemPrices,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onUpdatePrice,
  onReview,
}: POCreateStep1Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  // Items at or below reorder level
  const reorderItems = useMemo(() => {
    return items.filter((item) => item.quantity <= item.reorderLevel);
  }, [items]);

  // Filter items based on search and filter option
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query)
      );
    }

    // Apply stock filter
    switch (filterOption) {
      case "reorder-level":
        result = result.filter((item) => item.quantity <= item.reorderLevel);
        break;
      case "low-stock":
        result = result.filter(
          (item) => item.quantity <= item.reorderLevel && item.quantity > 0
        );
        break;
      case "in-stock":
        result = result.filter((item) => item.quantity > item.reorderLevel);
        break;
      case "out-of-stock":
        result = result.filter((item) => item.quantity === 0);
        break;
      default:
        break;
    }

    return result;
  }, [items, searchQuery, filterOption]);

  // Get selected items data
  const selectedItemsData = useMemo(() => {
    return items.filter((item) => selectedItems.has(item.sku));
  }, [items, selectedItems]);

  // Calculate totals
  const { subtotal, grandTotal } = useMemo(() => {
    let subtotal = 0;
    selectedItemsData.forEach((item) => {
      const qty = itemQuantities[item.sku] || 1;
      const price = itemPrices[item.sku] ?? item.unitPrice;
      subtotal += qty * price;
    });
    return { subtotal, grandTotal: subtotal };
  }, [selectedItemsData, itemQuantities, itemPrices]);

  const canReview = () => {
    let review = false;
    if (name.trim().length > 0 && selectedItems.size > 0) {
      if (type === "one-time") {
        review = true;
      } else {
        if (frequency === "daily" || executionDay.trim().length > 0) {
          review = true;
        }
      }
    }
    return review;
  };
  const hasSelectedItems = selectedItems.size > 0;

  // Select all items at reorder level
  const handleSelectAllReorderItems = () => {
    reorderItems.forEach((item) => {
      if (!selectedItems.has(item.sku)) {
        onAddItem(item.sku);
      }
    });
  };

  // Check if all reorder items are selected
  const allReorderItemsSelected =
    reorderItems.length > 0 &&
    reorderItems.every((item) => selectedItems.has(item.sku));

  return (
    <div className="">
      {/* Header */}
      <div>
        <div className="w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {type === "recurring" ? "Recurring" : "One-time"} Purchase Order
                Editor
              </h1>
              <p className="text-sm text-gray-500">
                Set up and manage your inventory restock in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onReview}
              disabled={!canReview()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Review Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 py-6 md:px-6">
        <div
          className={`grid grid-cols-1 gap-6 ${
            hasSelectedItems ? "lg:grid-cols-3" : ""
          }`}
        >
          {/* Left Column - Order Details + Item Catalog */}
          <div className={hasSelectedItems ? "lg:col-span-2" : ""}>
            <div className="space-y-6">
              {/* ORDER DETAILS Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Order Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Purchase Order Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="po-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Purchase Order Name
                    </Label>
                    <Input
                      id="po-name"
                      placeholder="Enter PO name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  {/* Order Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Order Type
                    </Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOrderTypeChange({
                            id: "one-time",
                            name: "one-time",
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          type === "one-time"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        One-time
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOrderTypeChange({
                            id: "recurring",
                            name: "recurring",
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          type === "recurring"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Recurring
                      </button>
                    </div>
                  </div>

                  {/* Frequency - only for recurring */}
                  {type === "recurring" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Frequency
                        </Label>
                        <Select
                          value={frequency}
                          onValueChange={(v) =>
                            onOrderTypeChange({ id: "frequency", name: v })
                          }
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Day of Week for weekly */}
                      {frequency === "weekly" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Day of Week
                          </Label>
                          <Select
                            value={executionDay}
                            onValueChange={(v) =>
                              onOrderTypeChange({ id: "execution", name: v })
                            }
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">
                                Wednesday
                              </SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Day of Month for monthly */}
                      {frequency === "monthly" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Day of Month
                          </Label>
                          <Select
                            value={executionDay}
                            onValueChange={(v) =>
                              onOrderTypeChange({ id: "execution", name: v })
                            }
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 30 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Item Catalog Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Item Catalog
                  </h2>
                  <p className="text-sm text-gray-500">
                    Search and select items to add to your order.
                  </p>
                </div>

                {/* Search and Filter Row */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items, SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <Select
                    value={filterOption}
                    onValueChange={(v) => setFilterOption(v as FilterOption)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] border-gray-300">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="reorder-level">
                        At Reorder Level
                      </SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Select All Reorder Items Button */}
                  {reorderItems.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSelectAllReorderItems}
                      disabled={allReorderItemsSelected}
                      className={`whitespace-nowrap border-gray-300 ${
                        allReorderItemsSelected
                          ? "bg-gray-100 text-gray-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {allReorderItemsSelected ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          All Selected
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Select Reorder Items ({reorderItems.length})
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Items List - Hidden scrollbar using Tailwind */}
                <div className="h-[500px] overflow-y-auto scrollbar-hide pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                          {/* Mobile Layout */}
                          <div className="sm:hidden">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
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
                                  {item.sku} • {item.supplier}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  isSelected
                                    ? onRemoveItem(item.sku)
                                    : onAddItem(item.sku)
                                }
                                className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
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
                            <div className="flex items-center justify-between gap-4">
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
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                  Price
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{item.unitPrice}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex sm:items-center sm:justify-between">
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
                                {item.sku} • {item.supplier}
                              </p>
                            </div>

                            <div className="flex items-center gap-6 ml-4">
                              {/* Stock Info - Separated */}
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
                                onClick={() =>
                                  isSelected
                                    ? onRemoveItem(item.sku)
                                    : onAddItem(item.sku)
                                }
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
                        <p className="text-sm">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Current Order (Only visible when items selected) */}
          {hasSelectedItems && (
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-xl p-4 sm:p-6 lg:sticky lg:top-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">
                      Current Order
                    </h2>
                  </div>
                  <span className="bg-slate-700 text-white text-xs font-medium px-2.5 py-1 rounded">
                    {selectedItems.size} ITEMS
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Review quantities and unit prices before submitting.
                </p>

                {/* Items List - Expands naturally */}
                <div className="space-y-3 mb-6">
                  {selectedItemsData.map((item) => {
                    const qty = itemQuantities[item.sku] || 1;
                    const price = itemPrices[item.sku] ?? item.unitPrice;
                    const lineTotal = qty * price;

                    return (
                      <div
                        key={item.sku}
                        className="space-y-2 pb-4 border-b border-slate-700 last:border-0 last:pb-0"
                      >
                        {/* Item Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-400">
                              STOCK: {item.quantity}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.sku)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Controls Row - Responsive */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {/* Quantity Control */}
                          <div className="flex items-center bg-slate-800 rounded-lg py-0">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item.sku, Math.max(1, qty - 1))
                              }
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) =>
                                onUpdateQuantity(
                                  item.sku,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-10 sm:w-12 text-center bg-transparent text-white border-none focus:outline-none focus:ring-0 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item.sku, qty + 1)
                              }
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price Input */}
                          <div className="flex items-center bg-slate-800 rounded-lg px-2 sm:px-3 py-1.5">
                            <span className="text-slate-400 mr-1 text-sm">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={price}
                              onChange={(e) =>
                                onUpdatePrice(
                                  item.sku,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-14 sm:w-16 bg-transparent text-white border-none focus:outline-none focus:ring-0 text-right text-sm"
                            />
                          </div>

                          {/* Line Total */}
                          <span className="text-white font-medium text-sm sm:text-base ml-auto">
                            ₹{lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-slate-700 pt-4 ">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white text-lg font-semibold">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={onReview}
                  disabled={!canReview()}
                  className="w-full mt-4 bg-white text-slate-900 hover:bg-gray-100"
                >
                  Review Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default POCreateStep1;
