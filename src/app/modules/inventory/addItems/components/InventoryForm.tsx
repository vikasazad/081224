"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, CheckIcon, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SupplierForm } from "./SupplierForm";

const formSchema = z.object({
  sku: z.string().min(1, { message: "SKU is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  quantity: z.number().min(0, { message: "Quantity must be 0 or greater" }),
  unitPrice: z.number().min(0, { message: "Unit price must be 0 or greater" }),
  reorderLevel: z
    .number()
    .min(0, { message: "Reorder level must be 0 or greater" }),
  supplier: z.string().min(1, { message: "Supplier is required" }),
  supplierGst: z.string().min(1, { message: "Supplier GST is required" }),
  quantityUnit: z.string().min(1, { message: "Quantity unit is required" }),
  batchNo: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  paymentMode: z.string().min(1, { message: "Payment mode is required" }),
  amount: z.number().min(0, { message: "Amount must be 0 or greater" }),
});

const skus = [
  { value: "SKU001", label: "SKU001: Item 1" },
  { value: "SKU002", label: "SKU002: Item 2" },
  { value: "SKU003", label: "SKU003: Item 3" },
];

const suppliers = [
  { value: "supplier1", label: "Supplier 1", gstNumbers: ["GST001", "GST002"] },
  { value: "supplier2", label: "Supplier 2", gstNumbers: ["GST003", "GST004"] },
  { value: "supplier3", label: "Supplier 3", gstNumbers: ["GST005", "GST006"] },
];

const quantityUnits = [
  { value: "units", label: "Units" },
  { value: "kg", label: "Kilograms" },
  { value: "g", label: "Grams" },
  { value: "pair", label: "Pair" },
];

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit Card" },
  { value: "bank", label: "Bank Transfer" },
];

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food & Beverages" },
  { value: "furniture", label: "Furniture" },
  { value: "stationery", label: "Stationery" },
  { value: "tools", label: "Tools & Equipment" },
];

export function InventoryForm() {
  const [supplierGstOptions, setSupplierGstOptions] = useState<string[]>([]);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "",
      quantity: 0,
      unitPrice: 0,
      reorderLevel: 0,
      supplier: "",
      supplierGst: "",
      quantityUnit: "",
      batchNo: "",
      date: new Date(),
      paymentMode: "",
      amount: 0,
    },
  });

  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unitPrice");
  const selectedSupplier = form.watch("supplier");

  useEffect(() => {
    const amount = quantity * unitPrice;
    form.setValue("amount", amount);
  }, [quantity, unitPrice, form]);

  useEffect(() => {
    const supplier = suppliers.find((s) => s.value === selectedSupplier);
    if (supplier) {
      setSupplierGstOptions(supplier.gstNumbers);
      form.setValue("supplierGst", supplier.gstNumbers[0] || "");
    } else {
      setSupplierGstOptions([]);
      form.setValue("supplierGst", "");
    }
  }, [selectedSupplier, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function handleAddSupplier(supplierData: any) {
    // Here you would typically send this data to your backend
    // and get a response with the new supplier's ID
    const newSupplierId = `supplier${suppliers.length + 1}`;
    const newSupplier = {
      value: newSupplierId,
      label: supplierData.name,
      gstNumbers: supplierData.gstNumbers,
    };
    suppliers.push(newSupplier);
    form.setValue("supplier", newSupplierId);
    setIsAddingSupplier(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Inventory Item</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>SKU</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? skus.find((sku) => sku.value === field.value)
                                ?.label
                            : "Select SKU"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search SKU..." />
                        <CommandList>
                          <CommandEmpty>No SKU found.</CommandEmpty>
                          <CommandGroup>
                            {skus.map((sku) => (
                              <CommandItem
                                value={sku.label}
                                key={sku.value}
                                onSelect={() => {
                                  form.setValue("sku", sku.value);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    sku.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {sku.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? categories.find((category) => category.value === field.value)
                                ?.label
                            : "Select category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                value={category.label}
                                key={category.value}
                                onSelect={() => {
                                  form.setValue("category", category.value);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {category.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === "add") {
                        setIsAddingSupplier(true);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.value} value={supplier.value}>
                          {supplier.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="add">Add Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <Dialog
                    open={isAddingSupplier}
                    onOpenChange={setIsAddingSupplier}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                        <DialogDescription>
                          Enter the details of the new supplier.
                        </DialogDescription>
                      </DialogHeader>
                      <SupplierForm
                        onSave={(supplierData) => {
                          handleAddSupplier(supplierData);
                          setIsAddingSupplier(false);
                        }}
                        onCancel={() => setIsAddingSupplier(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierGst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier GST</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier GST" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplierGstOptions.map((gst) => (
                        <SelectItem key={gst} value={gst}>
                          {gst}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantityUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quantity unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {quantityUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batchNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch No</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            field.value.toLocaleDateString()
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Auto-calculated based on quantity and unit price
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isAddingSupplier}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
