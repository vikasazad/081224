"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, ChevronRight, IndianRupee } from "lucide-react";
import MenuEventsForm from "./menuEventsForm";
import { Badge } from "@/components/ui/badge";

// Types
interface MenuItem {
  id: string;
  name: string;
  nature: "Veg" | "Non-Veg";
  available?: boolean;
  categoryName?: string;
  description?: string;
}

interface PackageCategory {
  categoryId: string;
  categoryName: string;
  items: MenuItem[];
}

interface SavedPackage {
  nature: string;
  pricePerPlate: number;
  menu: PackageCategory[];
}

interface MenuPackages {
  [price: string]: {
    [nature: string]: SavedPackage;
  };
}

interface MenuEventsProps {
  menu: any;
  menuPackages?: MenuPackages;
}

const MenuEvents = ({ menu, menuPackages }: MenuEventsProps) => {
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<SavedPackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isNewPackage, setIsNewPackage] = useState(false);

  // Parse prices from menuPackages
  const availablePrices = useMemo(() => {
    if (!menuPackages) return [];
    return Object.keys(menuPackages).sort((a, b) => Number(a) - Number(b));
  }, [menuPackages]);

  // Get available natures for a price
  const getAvailableNatures = (price: string) => {
    if (!menuPackages || !menuPackages[price]) return [];
    return Object.keys(menuPackages[price]);
  };

  // Get nature display name
  const getNatureDisplayName = (nature: string) => {
    switch (nature) {
      case "veg":
        return "Vegetarian";
      case "nonveg":
        return "Non-Veg";
      case "mixed":
        return "Mixed";
      default:
        return nature;
    }
  };

  // Get nature color classes
  const getNatureColors = (nature: string) => {
    switch (nature) {
      case "veg":
        return "border-green-500 text-green-700 hover:bg-green-100";
      case "nonveg":
        return "border-red-500 text-red-700 hover:bg-red-100";
      case "mixed":
        return "border-orange-500 text-orange-700 hover:bg-orange-100";
      default:
        return "border-gray-300 text-gray-700 hover:bg-gray-100";
    }
  };

  // Handle price card click
  const handlePriceClick = (price: string) => {
    if (selectedPrice === price) {
      setSelectedPrice(null);
    } else {
      setSelectedPrice(price);
    }
  };

  // Handle nature selection
  const handleNatureSelect = (price: string, nature: string) => {
    if (menuPackages && menuPackages[price] && menuPackages[price][nature]) {
      setSelectedPackage(menuPackages[price][nature]);
      setIsNewPackage(false);
      setShowForm(true);
    }
  };

  // Handle create new package
  const handleCreateNew = () => {
    setSelectedPackage(null);
    setIsNewPackage(true);
    setShowForm(true);
    setSelectedPrice(null);
  };

  // Handle back to packages list
  const handleBackToList = () => {
    setShowForm(false);
    setSelectedPackage(null);
    setIsNewPackage(false);
  };

  // Get total items count for a package
  const getPackageItemCount = (pkg: SavedPackage): number => {
    return pkg.menu.reduce((total, category) => total + category.items.length, 0);
  };

  // Show form view
  if (showForm) {
    return (
      <div>
        {/* Back button */}
        <div className="px-6 pt-4">
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="text-gray-600 hover:text-gray-900 -ml-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Packages
          </Button>
        </div>
        
        <MenuEventsForm
          menu={menu}
          menuPackages={menuPackages}
          initialData={selectedPackage}
          isEditing={!isNewPackage && selectedPackage !== null}
        />
      </div>
    );
  }

  // Show packages list view
  return (
    <div className=" px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Menu Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a price to view available packages or create a new one
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Package
        </Button>
      </div>

      {/* Price Cards Grid */}
      {availablePrices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first menu package to get started
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availablePrices.map((price) => {
            const isSelected = selectedPrice === price;
            const natures = getAvailableNatures(price);

            return (
              <div key={price} className="relative">
                {/* Price Card */}
                <button
                  onClick={() => handlePriceClick(price)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-gray-900 bg-gray-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 flex items-center ">
                      <IndianRupee className="h-4 w-4" strokeWidth={4}/>{Number(price).toLocaleString()} 
                    </span>
                    <p className="text-sm text-gray-500">per plate</p>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        isSelected ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  
                  <div className="mt-3 flex gap-1">
                    {natures.map((nature) => (
                        <Badge key={nature} variant="outline" className="flex items-center gap-1 text-[10px] text-gray-500" >
                      <span
                        key={nature}
                        className={`w-2 h-2 rounded-full ${
                          nature === "veg"
                            ? "bg-green-500"
                            : nature === "nonveg"
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                      />
                      {nature === "veg"
                            ? "Veg"
                            : nature === "nonveg"
                            ? "Non-Veg"
                            : "Mixed"}
                      </Badge>
                    ))}
                  </div>
                </button>

                {/* Expanded Nature Options */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isSelected ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-2">
                    {natures.map((nature) => {
                      const pkg = menuPackages![price][nature];
                      const itemCount = getPackageItemCount(pkg);
                      const categoryCount = pkg.menu.length;

                      return (
                        <button
                          key={nature}
                          onClick={() => handleNatureSelect(price, nature)}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${getNatureColors(
                            nature
                          )}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold">
                                {getNatureDisplayName(nature)}
                              </span>
                              <div className="flex gap-3 mt-1 text-xs opacity-80">
                                <span>{itemCount} items</span>
                                <span>•</span>
                                <span>{categoryCount} categories</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

     
    </div>
  );
};

export default MenuEvents;
