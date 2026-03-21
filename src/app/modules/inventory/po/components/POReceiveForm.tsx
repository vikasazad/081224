"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PackageCheck, ArrowLeft } from "lucide-react";
import type { PurchaseOrder, POItem, ReceivedItem } from "@/types/inventory";

interface POReceiveFormProps {
  purchaseOrder: PurchaseOrder;
  onSubmit: (receivedItems: ReceivedItem[]) => void;
  onCancel: () => void;
}

interface ReceiveItemState {
  sku: string;
  itemName: string;
  supplierName: string;
  orderedQty: number;
  receivedQty: number;
  qualityOk: boolean;
  receiveNotes: string;
}

export function POReceiveForm({
  purchaseOrder: po,
  onSubmit,
  onCancel,
}: POReceiveFormProps) {
  const [items, setItems] = useState<ReceiveItemState[]>(
    po.items.map((item: POItem) => ({
      sku: item.sku,
      itemName: item.itemName,
      supplierName: item.supplier?.name ?? "Unknown supplier",
      orderedQty: item.quantity,
      receivedQty: item.receivedQty ?? item.quantity,
      qualityOk: item.qualityOk ?? true,
      receiveNotes: item.receiveNotes ?? "",
    }))
  );

  // Group items by supplier for display
  const itemsBySupplier = items.reduce<Record<string, ReceiveItemState[]>>(
    (acc, item) => {
      const key = item.supplierName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );
  const supplierNames = Object.keys(itemsBySupplier);

  const updateItem = (
    sku: string,
    field: keyof ReceiveItemState,
    value: number | boolean | string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const receivedItems: ReceivedItem[] = items.map((item) => ({
      sku: item.sku,
      receivedQty: item.receivedQty,
      qualityOk: item.qualityOk,
      receiveNotes: item.receiveNotes || "",
    }));
    onSubmit(receivedItems);
  };

  const totalOrdered = items.reduce((sum, item) => sum + item.orderedQty, 0);
  const totalReceiving = items.reduce((sum, item) => sum + item.receivedQty, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" />
              Receive Items - {po.id}
            </CardTitle>
            <CardDescription>
              Enter the quantities received and verify quality
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Ordered</TableHead>
                  <TableHead className="text-center">Received</TableHead>
                  <TableHead className="text-center">Quality OK</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierNames.map((supplierName) => (
                  <React.Fragment key={supplierName}>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableCell
                        colSpan={6}
                        className="font-semibold text-sm py-3 border-b-2"
                      >
                        {supplierName}
                      </TableCell>
                    </TableRow>
                    {itemsBySupplier[supplierName].map((item) => (
                      <TableRow key={item.sku}>
                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.itemName}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.orderedQty}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={item.orderedQty}
                            value={item.receivedQty}
                            onChange={(e) =>
                              updateItem(
                                item.sku,
                                "receivedQty",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.qualityOk}
                            onCheckedChange={(checked) =>
                              updateItem(
                                item.sku,
                                "qualityOk",
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Add notes..."
                            value={item.receiveNotes}
                            onChange={(e) =>
                              updateItem(
                                item.sku,
                                "receiveNotes",
                                e.target.value
                              )
                            }
                            className="min-h-[60px] text-sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Summary</Label>
              <p className="text-lg font-medium">
                Receiving {totalReceiving} of {totalOrdered} items
                {totalReceiving < totalOrdered && (
                  <span className="text-yellow-600 text-sm ml-2">
                    (Partial receipt)
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <PackageCheck className="h-4 w-4 mr-2" />
                Confirm Receipt
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default POReceiveForm;
