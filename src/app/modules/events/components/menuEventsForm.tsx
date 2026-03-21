"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, X, ChevronDown, IndianRupee } from "lucide-react";
import { saveEventMenuPackages } from "../utils/eventsApi";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

// Types
interface MenuItem {
  id: string;
  name: string;
  nature: "Veg" | "Non-Veg";
  available?: boolean;
  categoryName?: string;
  description?: string;
  price?: Record<string, string>;
}

interface MenuCategory {
  id: string;
  name: string;
  categoryLogo: string;
  position: string;
  menuItems: MenuItem[];
}

interface PackageCategory {
  categoryId: string;
  categoryName: string;
  items: MenuItem[];
}

interface InitialData {
  nature: string;
  pricePerPlate: number;
  menu: PackageCategory[];
}

interface MenuEventsFormProps {
  menu: {
    categories: MenuCategory[];
  };
  menuPackages?: any;
  initialData?: InitialData | null;
  isEditing?: boolean;
}

type PackageNature = "veg" | "nonveg" | "mixed";

const MenuEventsForm = ({ menu, initialData, isEditing = false }: MenuEventsFormProps) => {
  // State
  const [pricePerPlate, setPricePerPlate] = useState<string>("");
  const [nature, setNature] = useState<PackageNature>("veg");
  const [selectedItems, setSelectedItems] = useState<Map<string, string[]>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      // Set price
      setPricePerPlate(initialData.pricePerPlate.toString());
      
      // Set nature
      setNature(initialData.nature as PackageNature);
      
      // Build selectedItems map from initial data
      const newSelectedItems = new Map<string, string[]>();
      initialData.menu.forEach((category) => {
        const itemIds = category.items.map((item) => item.id);
        if (itemIds.length > 0) {
          newSelectedItems.set(category.categoryId, itemIds);
        }
      });
      setSelectedItems(newSelectedItems);
    } else {
      // Reset form for new package
      setPricePerPlate("");
      setNature("veg");
      setSelectedItems(new Map());
    }
  }, [initialData]);

  // Get filtered menu items based on nature
  const getFilteredItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      // Only filter out items explicitly marked as unavailable
      if (item.available === false) return false;

      if (nature === "veg") {
        return item.nature === "Veg";
      } else if (nature === "nonveg") {
        return item.nature === "Non-Veg";
      }
      // mixed - show all
      return true;
    });
  };

  // Get selected count for a category
  const getSelectedCount = (categoryId: string): number => {
    return selectedItems.get(categoryId)?.length || 0;
  };

  // Get total selected count
  const getTotalSelectedCount = (): number => {
    let total = 0;
    selectedItems.forEach((items) => {
      total += items.length;
    });
    return total;
  };

  // Check if item is selected
  const isItemSelected = (categoryId: string, itemId: string): boolean => {
    return selectedItems.get(categoryId)?.includes(itemId) || false;
  };

  // Toggle item selection
  const toggleItem = (categoryId: string, itemId: string) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const categoryItems = newMap.get(categoryId) || [];

      if (categoryItems.includes(itemId)) {
        // Remove item
        const filtered = categoryItems.filter((id) => id !== itemId);
        if (filtered.length === 0) {
          newMap.delete(categoryId);
        } else {
          newMap.set(categoryId, filtered);
        }
      } else {
        // Add item
        newMap.set(categoryId, [...categoryItems, itemId]);
      }

      return newMap;
    });
  };

  // Get summary grouped by category
  const getSummary = useMemo(() => {
    const summary: { categoryName: string; categoryId: string; items: MenuItem[] }[] = [];

    selectedItems.forEach((itemIds, categoryId) => {
      const category = menu.categories.find((c: MenuCategory) => c.id === categoryId);
      if (category) {
        const items = itemIds
          .map((itemId) => category.menuItems.find((item: MenuItem) => item.id === itemId))
          .filter((item): item is MenuItem => item !== undefined);

        if (items.length > 0) {
          summary.push({
            categoryName: category.name,
            categoryId: category.id,
            items,
          });
        }
      }
    });

    return summary;
  }, [selectedItems, menu.categories]);

  // Handle submit
  const handleSubmit = async () => {
    if (!pricePerPlate || getTotalSelectedCount() === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    const packageData = {
      pricePerPlate: pricePerPlate ? Number(pricePerPlate) : 0,
      nature,
      menu: getSummary.map((s) => (s)),
    };

    console.log("Package Details:", packageData);
    const result = await saveEventMenuPackages(packageData);
    if (result) {
      toast.success(isEditing ? "Package updated successfully" : "Package saved successfully");
      // Don't reset form when editing - keep the data visible
      if (!isEditing) {
        setPricePerPlate("");
        setNature("veg");
        setSelectedItems(new Map());
      }
    } else {
      toast.error("Failed to save package");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Left Column - Package Details */}
      <div className="w-[35%] space-y-6">
        {/* Package Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Edit Package" : "New Package"}
            </h2>
            {isEditing && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Editing
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {isEditing ? "Modify your catering package" : "Define your catering package"}
          </p>

          {/* Price Per Plate */}
          <div className="space-y-2 mb-4">
            <Label className="font-medium text-gray-700">Price Per Plate</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <IndianRupee className="h-4 w-4" />
              </span>
              <Input
                type="number"
                placeholder="Enter price"
                value={pricePerPlate}
                onChange={(e) => setPricePerPlate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Package Nature */}
          <div className="space-y-2 mb-4">
            <Label className="font-medium text-gray-700">Package Nature</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setNature("veg")}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                  nature === "veg"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Vegetarian
              </button>
              <button
                onClick={() => setNature("nonveg")}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                  nature === "nonveg"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Non-Veg
              </button>
              <button
                onClick={() => setNature("mixed")}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                  nature === "mixed"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Mixed
              </button>
            </div>
          </div>

          {/* Selected Items Count */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <span className="text-gray-600">Selected Items:</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-900">
              {getTotalSelectedCount()} items
            </Badge>
          </div>
        </div>

        {/* Package Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Package Summary
          </h3>

          {getSummary.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No items selected yet. Click on categories to add items.
            </p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {getSummary.map((category) => (
                <div key={category.categoryId}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {category.categoryName}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700"
                      >
                        {item.name}
                        <button
                          onClick={() => toggleItem(category.categoryId, item.id)}
                          className="ml-1 hover:text-gray-900"
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!pricePerPlate || getTotalSelectedCount() === 0 || isLoading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isEditing ? "Update Package" : "Save Package"} 
          {isLoading && <Icons.spinner className="w-4 h-4 animate-spin ml-2" />}
        </Button>
      </div>

      {/* Right Column - Menu Selection */}
      <div className="w-[65%]">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Select Menu Items
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Click categories to browse and select items
          </p>

          {/* Categories Grid with Accordions */}
          {menu.categories.filter((category: MenuCategory) => getFilteredItems(category.menuItems).length > 0).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No categories available for {nature === "veg" ? "Vegetarian" : nature === "nonveg" ? "Non-Veg" : "Mixed"} items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {menu.categories
                .filter((category: MenuCategory) => getFilteredItems(category.menuItems).length > 0)
                .map((category: MenuCategory) => {
                const filteredItems = getFilteredItems(category.menuItems);
                const selectedCount = getSelectedCount(category.id);

                return (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <Accordion type="single" collapsible>
                      <AccordionItem value={category.id} className="border-0">
                        <AccordionTrigger className="px-4 py-4 hover:bg-gray-50 hover:no-underline">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-gray-900">
                              {category.name}
                              {selectedCount > 0 && (
                                <span className="ml-2 text-white font-normal bg-blue-500 rounded-full w-5 h-6 px-2 py-0.5 text-xs ">
                                  {selectedCount} 
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-gray-500">
                              {filteredItems.length} items available
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-2">
                            {filteredItems.map((item) => {
                              const isSelected = isItemSelected(
                                category.id,
                                item.id
                              );
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                    isSelected
                                      ? "bg-gray-100 border-gray-900"
                                      : "bg-white border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        item.nature === "Veg"
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                    <span className="text-sm text-gray-900">
                                      {item.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      toggleItem(category.id, item.id)
                                    }
                                    className={`p-1 rounded transition-colors ${
                                      isSelected
                                        ? "text-gray-900 hover:text-gray-700"
                                        : "text-gray-500 hover:text-gray-900"
                                    }`}
                                  >
                                    {isSelected ? (
                                      <X className="h-4 w-4" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuEventsForm;
