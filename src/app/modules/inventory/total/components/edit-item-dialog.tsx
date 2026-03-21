"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EditInventoryItem,
  InventoryItem,
  TransactionType,
} from "@/types/inventory";
import { SkuAddDialog } from "../../addItems/components/sku-add-dialog";

interface EditItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  sku: any;
  suppliers: any;
  categories: any;
  onOpenChange: (open: boolean) => void;
  onSave: (
    item: EditInventoryItem,
    transactionType: TransactionType,
    previousQuantity: number
  ) => void;
  newSku: any;
}

export function EditItemDialog({
  item,
  sku,
  suppliers,
  categories,
  open,
  onOpenChange,
  onSave,
  newSku,
}: EditItemDialogProps) {
  console.log("ITEM Data Got from Props", (item));
  const [formData, setFormData] = useState<any>({
    name: item?.name || "",
    sku: item?.sku || "",
    category: item?.category || "",
    quantity: item?.quantity || "",
    reorderLevel: item?.reorderLevel || "",
    lastUpdated: new Date().toString(),
    quantityType: item?.quantityType || item?.quantityUnit || "units",
    supplier: item?.supplier || "",
  });

  const [isAddingSku, setIsAddingSku] = useState(false);
  const [transactionType, setTransactionType] = useState<string | undefined>(
    undefined
  );
  const [previousQuantity, setPreviousQuantity] = useState<number>(
    Number(item?.quantity) || 0
  );
  const [hasQuantityChanged, setHasQuantityChanged] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const quantityUnits = [
    { value: "units", label: "Units" },
    { value: "kg", label: "Kilograms" },
    { value: "g", label: "Grams" },
    { value: "dzn", label: "Dozens" },
    { value: "pair", label: "Pair" },
  ];

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);



  // Update formData whenever item changes or dialog opens
  useEffect(() => {
    if (open && item) {
      console.log('here in the effect')
      setFormData({
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "",
        quantity: item.quantity || "",
        reorderLevel: item.reorderLevel || "",
        lastUpdated: new Date().toString(),
        quantityType: item.quantityType || item.quantityUnit || "units",
        supplier: item.supplier || "",
      });
      setPreviousQuantity(Number(item.quantity) || 0);
      setTransactionType(undefined);
      setHasQuantityChanged(false);
      setErrors({});
    }
  }, [item, open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleClose]);

  const handleQuantityChange = (value: string) => {
    const newQuantity = Number(value);
    // console.log("here1", newQuantity);
    const hasChanged = newQuantity !== previousQuantity;
    // console.log("here2", hasChanged);
    setHasQuantityChanged(hasChanged);
    // console.log("here3", formData.quantity);
    // console.log("here4", previousQuantity);

    if (!hasChanged) {
      setTransactionType(undefined);
    } else if (newQuantity < previousQuantity) {
      setTransactionType("Stock Out");
    }

    setFormData({
      ...formData,
      quantity: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check for empty values
    const requiredFields = [
      "name",
      "sku",
      "category",
      "quantity",
      "reorderLevel",
      "quantityType",
      "supplier",
    ];
    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      const newErrors = emptyFields.reduce(
        (acc, field) => ({
          ...acc,
          [field]: `${field} is required`,
        }),
        {}
      );
      setErrors(newErrors);
      return;
    }

    // Validate numeric fields
    const currentStock = Number(formData.quantity);
    const reorderLevel = Number(formData.reorderLevel);

    if (isNaN(currentStock) || isNaN(reorderLevel)) {
      setErrors({
        ...errors,
        quantity: isNaN(currentStock) ? "Must be a number" : "",
        reorderLevel: isNaN(reorderLevel) ? "Must be a number" : "",
      });
      return;
    }

    // Modify transaction type validation to only check if quantity has changed
    if (hasQuantityChanged && !transactionType) {
      setErrors({
        ...errors,
        transactionType: "Transaction type is required",
      });
      return;
    }

    // Pass undefined as transaction type if quantity hasn't changed
    onSave(
      formData,
      hasQuantityChanged ? transactionType! : formData.transactionType,
      previousQuantity
    );
    onOpenChange(false);
  };

  const handleAddSku = (skuData: { sku: string; itemName: string }) => {
    const newSkuItem = {
      value: skuData.sku,
      label: skuData.itemName,
    };

    sku.push(newSkuItem); // Assuming sku is an array

    setFormData({
      ...formData,
      value: skuData.sku,
      label: skuData.itemName,
    });

    // Call the prop function to notify the parent
    newSku({
      value: skuData.sku,
      label: skuData.itemName,
    });

    console.log("New SKU created in Edit Dialog:", {
      value: skuData.sku,
      label: skuData.itemName,
    });
  };

  if (!open) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-item-dialog-title"
    >
      <div
        className="fixed inset-0 bg-black/80 animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative z-50 grid w-full max-w-2xl max-h-[80vh] overflow-y-auto gap-4 border bg-background p-6 shadow-lg rounded-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2
            id="edit-item-dialog-title"
            className="text-lg font-semibold leading-none tracking-tight"
          >
            {item ? "Edit Item" : "Add New Item"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !formData.sku && "text-muted-foreground"
                    )}
                  >
                    {formData.sku
                      ? sku.find(
                          (skuItem: any) => skuItem.value === formData.sku
                        )?.label
                      : "Select SKU"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search SKU..." />
                    <CommandList>
                      <CommandEmpty>No SKU found.</CommandEmpty>
                      <CommandGroup>
                        {sku?.map((skuItem: any) => (
                          <CommandItem
                            value={skuItem.label}
                            key={skuItem.value}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                sku: skuItem.value,
                                label: skuItem.label,
                              });
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                skuItem.value === formData.sku
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {`${skuItem.value}: ${skuItem.label}`}
                          </CommandItem>
                        ))}
                        <CommandItem
                          value="add-new"
                          onSelect={() => setIsAddingSku(true)}
                        >
                          <span className="text-blue-500">+ Add new SKU</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !formData.category && "text-muted-foreground"
                    )}
                  >
                    {formData.category
                      ? categories.find(
                          (category: any) => category.name === formData.category
                        )?.name
                      : "Select category"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories?.map((category: any) => (
                          <CommandItem
                            value={category.name}
                            key={category.name}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                category: category.name,
                              });
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                category.name === formData.category
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderLevel: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantityType">Quantity Type</Label>
              <Select
                value={formData.quantityType}
                onValueChange={(value) =>
                  setFormData({ ...formData, quantityType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity type" />
                </SelectTrigger>
                <SelectContent>
                  {quantityUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier: any) => (
                    <SelectItem key={supplier.name} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasQuantityChanged && (
              <div className="grid gap-2">
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger
                    className={cn(errors.transactionType && "border-red-500")}
                  >
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent container={null}>
                    {Number(formData.quantity) < previousQuantity ? (
                      <>
                        <SelectItem value="Stock Out">Stock Out</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Stock In">Stock In</SelectItem>
                        <SelectItem value="Return">Return</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.transactionType && (
                  <span className="text-sm text-red-500">
                    {errors.transactionType}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button type="submit">Save</Button>
          </div>
        </form>

        <SkuAddDialog
          isOpen={isAddingSku}
          onClose={() => setIsAddingSku(false)}
          onSave={handleAddSku}
          lastSku={sku[sku.length - 1]?.value || "SKU000"}
        />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dialogContent, document.body)
    : null;
}
