"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const skuFormSchema = z.object({
  sku: z.string().min(1, { message: "SKU is required" }),
  itemName: z.string().min(1, { message: "Item name is required" }),
});

type SkuAddDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof skuFormSchema>) => void;
  lastSku: string;
};

export function SkuAddDialog({
  isOpen,
  onClose,
  onSave,
  lastSku,
}: SkuAddDialogProps) {
  const nextSku = generateNextSku(lastSku);

  const form = useForm<z.infer<typeof skuFormSchema>>({
    resolver: zodResolver(skuFormSchema),
    defaultValues: {
      sku: nextSku,
      itemName: "",
    },
  });

  function onSubmit(values: z.infer<typeof skuFormSchema>) {
    onSave(values);
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New SKU</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter item name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function generateNextSku(lastSku: string) {
  // Assuming SKU format is "SKU001", "SKU002", etc.
  const numPart = parseInt(lastSku.replace(/[^0-9]/g, ""));
  const nextNum = numPart + 1;
  return `SKU${nextNum.toString().padStart(3, "0")}`;
}
