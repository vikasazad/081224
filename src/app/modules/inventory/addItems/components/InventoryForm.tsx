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
import { SkuAddDialog } from "./sku-add-dialog";

const formSchema = z.object({
  sku: z.string().min(1, { message: "SKU is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  quantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Quantity must be a valid number greater than or equal to 0",
    }),
  unitPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Unit price must be a valid number greater than or equal to 0",
    }),
  reorderLevel: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message:
        "Reorder level must be a valid number greater than or equal to 0",
    }),
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

const quantityUnits = [
  { value: "units", label: "Units" },
  { value: "kg", label: "Kilograms" },
  { value: "g", label: "Grams" },
  { value: "dzn", label: "Dozens" },
  { value: "pair", label: "Pair" },
];

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit Card" },
  { value: "bank", label: "Bank Transfer" },
];

export function InventoryForm({
  data,
  session,
  onSubmit: onSubmitProp,
  newSku,
}: any) {
  // console.log("DATA", data);
  const [supplierGstOptions, setSupplierGstOptions] = useState<string[]>([]);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isAddingSku, setIsAddingSku] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "",
      quantity: "",
      unitPrice: "",
      reorderLevel: "",
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
    const amount = Number(quantity) * Number(unitPrice);
    form.setValue("amount", amount);
  }, [quantity, unitPrice, form]);

  useEffect(() => {
    const supplier = data?.suppliers.find(
      (s: any) => s.name === selectedSupplier
    );
    if (supplier) {
      setSupplierGstOptions(supplier.gstNumber);
      form.setValue("supplierGst", supplier?.gstNumber[0] || "");
    } else {
      setSupplierGstOptions([]);
      form.setValue("supplierGst", "");
    }
  }, [selectedSupplier, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Format the date to be more readable
    const formattedValues = {
      name: values.name,
      sku: values.sku,
      description: values.description,
      category: values.category,
      quantity: values.quantity,
      quantityUnit: values.quantityUnit,
      supplier: values.supplier,
      supplierGst: values.supplierGst,
      batchNo: values.batchNo,
      paymentMode: values.paymentMode,
      amount: values.amount,
      unitPrice: values.unitPrice,
      status:
        Number(values.quantity) === 0
          ? "Out of Stock"
          : Number(values.quantity) <= Number(values.reorderLevel)
          ? "Low Stock"
          : "In Stock",
      reorderLevel: values.reorderLevel,
      updatedBy: session?.user?.role || "undefined",
      date: values.date.toString(), // Format date as YYYY-MM-DD
    };

    // Call the parent component's onSubmit handler
    onSubmitProp(formattedValues);
  }

  function handleAddSupplier(supplierData: any) {
    // Here you would typically send this data to your backend
    // and get a response with the new supplier's ID
    const newSupplierId = `Supplier${data?.suppliers.length + 1}`;
    const newSupplier = {
      value: newSupplierId,
      label: supplierData.name,
      gstNumbers: supplierData.gstNumber,
    };
    data?.suppliers.push(newSupplier);
    form.setValue("supplier", newSupplierId);
    setIsAddingSupplier(false);
  }

  function handleAddSku(skuData: { sku: string; itemName: string }) {
    const newSkuItem = {
      value: skuData.sku,
      label: skuData.itemName,
    };
    data.sku.push(newSkuItem);
    form.setValue("sku", skuData.sku);
    newSku({
      value: skuData.sku,
      label: skuData.itemName,
    });
    // Add console log for new SKU
    console.log("New SKU created in Inventory Form:", {
      value: skuData.sku,
      label: skuData.itemName,
    });
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
                            ? data?.sku.find(
                                (sku: any) => sku.value === field.value
                              )?.label
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
                            {data?.sku.map((sku: any) => (
                              <CommandItem
                                value={sku.value}
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
                                {`${sku.value}: ${sku.label}`}
                              </CommandItem>
                            ))}
                            <CommandItem
                              value="add-new"
                              onSelect={() => setIsAddingSku(true)}
                            >
                              <span className="text-blue-500">
                                + Add new SKU
                              </span>
                            </CommandItem>
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
                            ? data?.categories.find(
                                (category: any) => category.name === field.value
                              )?.name
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
                            {data?.categories.map((category: any) => (
                              <CommandItem
                                value={category.name}
                                key={category.name}
                                onSelect={() => {
                                  form.setValue("category", category.name);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category.name === field.value
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
                      placeholder="Item quantity"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
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
                      placeholder="Item unit price"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
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
                      placeholder="Item reorder level"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
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
                      {data?.suppliers.map((supplier: any) => (
                        <SelectItem key={supplier.name} value={supplier.name}>
                          {supplier.name}
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
                    <Input placeholder="Item batch number" {...field} />
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
      <SkuAddDialog
        isOpen={isAddingSku}
        onClose={() => setIsAddingSku(false)}
        onSave={handleAddSku}
        lastSku={data?.sku[data.sku.length - 1]?.value || "SKU000"}
      />
    </Card>
  );
}
