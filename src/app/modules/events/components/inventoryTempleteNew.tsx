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
  ArrowLeft,
} from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

// Event types available for selection
const EVENT_TYPES = [
  { id: "birthday", name: "Birthday Party" },
  { id: "wedding", name: "Wedding" },
  { id: "conference", name: "Conference" },
  { id: "corporate", name: "Corporate Event" },
  { id: "anniversary", name: "Anniversary" },
  { id: "other", name: "Other" },
];

const FOOD_TYPES = [
  { id: "veg", name: "Veg" },
  { id: "non-veg", name: "Non-Veg" },
  { id: "both", name: "Both" },
];

// Template item interface
interface TemplateItem {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

// Form data interface
export interface InventoryTemplateFormData {
  eventType: string;
  eventTypeName: string;
  foodType: string;
  foodTypeName: string;
  numberOfPeople: number;
  items: TemplateItem[];
}

interface InventoryTempleteNewProps {
  inventory: InventoryItem[];
  handleBackTemplete: () => void;
  onSaveTemplate: (data: InventoryTemplateFormData) => void;
  initialData?: InventoryTemplateFormData & { id?: string; createdAt?: string } | null;
  isEditing?: boolean;
}

type FilterOption = "all" | "category";

export function InventoryTempleteNew({ 
  inventory = [], 
  handleBackTemplete, 
  onSaveTemplate,
  initialData = null,
  isEditing = false
}: InventoryTempleteNewProps) {
  // Form state - initialize with initial data if editing
  const [eventType, setEventType] = useState<string>(initialData?.eventType || "");
  const [foodType, setFoodType] = useState<string>(initialData?.foodType || "");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(initialData?.numberOfPeople || 0);
  
  // Item selection state - initialize from initial data
  const [selectedItems, setSelectedItems] = useState<Set<string>>(() => {
    if (initialData?.items) {
      return new Set(initialData.items.map(item => item.sku));
    }
    return new Set();
  });
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(() => {
    if (initialData?.items) {
      const quantities: Record<string, number> = {};
      initialData.items.forEach(item => {
        quantities[item.sku] = item.quantity;
      });
      return quantities;
    }
    return {};
  });
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique categories from inventory
  const categories = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];
    const cats = new Set(inventory.map((item) => item.category));
    return Array.from(cats);
  }, [inventory]);

  // Filter items based on search and filter option
  const filteredItems = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];
    let result = inventory;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterOption === "category" && categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    return result;
  }, [inventory, searchQuery, filterOption, categoryFilter]);

  // Get selected items data
  const selectedItemsData = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];
    return inventory.filter((item) => selectedItems.has(item.sku));
  }, [inventory, selectedItems]);

  // Add item handler
  const handleAddItem = (sku: string) => {
    setSelectedItems((prev) => new Set([...prev, sku]));
    if (!itemQuantities[sku]) {
      setItemQuantities((prev) => ({ ...prev, [sku]: 1 }));
    }
  };

  // Remove item handler
  const handleRemoveItem = (sku: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(sku);
      return next;
    });
    setItemQuantities((prev) => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  };

  // Update quantity handler
  const handleUpdateQuantity = (sku: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [sku]: Math.max(1, quantity),
    }));
  };

  // Calculate total items count
  const totalItemsCount = useMemo(() => {
    return Object.values(itemQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [itemQuantities]);

  // Validate form
  const canSubmit = () => {
    return (
      eventType.trim().length > 0 &&
      numberOfPeople > 0 &&
      selectedItems.size > 0
    );
  };

  // Submit handler
  const handleSubmit = () => {
    const formData: InventoryTemplateFormData = {
      eventType: eventType,
      eventTypeName: EVENT_TYPES.find((e) => e.id === eventType)?.name || eventType,
      foodType: foodType,
      foodTypeName: FOOD_TYPES.find((e) => e.id === foodType)?.name || foodType,
      numberOfPeople: numberOfPeople,
      items: selectedItemsData.map((item) => ({
        sku: item.sku,
        name: item.name,
        category: item.category,
        quantity: itemQuantities[item.sku] || 1,
        unitPrice: item.unitPrice,
      })),
    };

    // Save the template via callback (this will also navigate back)
    onSaveTemplate(formData);
  };

  const hasSelectedItems = selectedItems.size > 0;

  return (
    <div className="">
      {/* Header */}
      <div className="px-8 py-4">
        <div className="w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Edit Inventory Template" : "Create New Inventory Template"}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? "Update your inventory template for the event." : "Set up an inventory template for your event."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackTemplete}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
                <ArrowLeft className="ml-2 h-4 w-4" />
              Back
              
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isEditing ? "Update Template" : "Save Template"}
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
          {/* Left Column - Event Details + Item Catalog */}
          <div className={hasSelectedItems ? "lg:col-span-2" : ""}>
            <div className="space-y-6">
              {/* EVENT DETAILS Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Event Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Type */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="event-type"
                      className="text-sm font-medium text-gray-700"
                    >
                      Event Type
                    </Label>
                    <Select
                      value={eventType}
                      onValueChange={(v) => setEventType(v)}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select event type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="event-type"
                      className="text-sm font-medium text-gray-700"
                    >
                      Food Type
                    </Label>
                    <Select
                      value={foodType}
                      onValueChange={(v) => setFoodType(v)}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select food type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {FOOD_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of People */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="num-people"
                      className="text-sm font-medium text-gray-700"
                    >
                      Number of People
                    </Label>
                    <Input
                      id="num-people"
                      type="number"
                      min="1"
                      placeholder="Enter number of attendees..."
                      value={numberOfPeople || ""}
                      onChange={(e) =>
                        setNumberOfPeople(parseInt(e.target.value) || 0)
                      }
                      className="border-gray-300"
                    />
                  </div>
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
                    Search and select items to add to your template.
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
                    <SelectTrigger className="w-full sm:w-[150px] border-gray-300">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="category">By Category</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Category Dropdown (only when category filter is active) */}
                  {filterOption === "category" && (
                    <Select
                      value={categoryFilter}
                      onValueChange={(v) => setCategoryFilter(v)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] border-gray-300">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Items List */}
                <div className="h-[500px] overflow-y-auto scrollbar-hide pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="space-y-3">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItems.has(item.sku);

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
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                                    {item.category}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {item.sku}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  isSelected
                                    ? handleRemoveItem(item.sku)
                                    : handleAddItem(item.sku)
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
                              <div className="text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                  Stock
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.quantity}
                                </p>
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
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {item.sku}
                              </p>
                            </div>

                            <div className="flex items-center gap-6 ml-4">
                              {/* Stock Info */}
                              <div className="text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                  Stock
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.quantity}
                                </p>
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
                                    ? handleRemoveItem(item.sku)
                                    : handleAddItem(item.sku)
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

          {/* Right Column - Selected Items (Only visible when items selected) */}
          {hasSelectedItems && (
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-xl p-4 sm:p-6 lg:sticky lg:top-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">
                      Template Items
                    </h2>
                  </div>
                  <span className="bg-slate-700 text-white text-xs font-medium px-2.5 py-1 rounded">
                    {selectedItems.size} ITEMS
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Review and adjust quantities for your event template.
                </p>

                {/* Items List */}
                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedItemsData.map((item) => {
                    const qty = itemQuantities[item.sku] || 1;

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
                              {item.category} • {item.sku}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.sku)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-slate-800 rounded-lg py-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.sku, qty - 1)
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
                                handleUpdateQuantity(
                                  item.sku,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-12 text-center bg-transparent text-white border-none focus:outline-none focus:ring-0 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.sku, qty + 1)
                              }
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-slate-400 text-sm">
                            × ₹{item.unitPrice}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between text-slate-400 mb-2">
                    <span>Total Items</span>
                    <span>{totalItemsCount}</span>
                  </div>
                  {eventType && (
                    <div className="flex justify-between text-slate-400 mb-2">
                      <span>Event Type</span>
                      <span>{EVENT_TYPES.find((e) => e.id === eventType)?.name}</span>
                    </div>
                  )}
                  {numberOfPeople > 0 && (
                    <div className="flex justify-between text-slate-400 mb-2">
                      <span>People</span>
                      <span>{numberOfPeople}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                  className="w-full mt-4 bg-white text-slate-900 hover:bg-gray-100"
                >
                  {isEditing ? "Update Template" : "Save Template"}
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

export default InventoryTempleteNew;
