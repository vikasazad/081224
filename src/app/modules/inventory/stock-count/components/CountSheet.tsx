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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Save, Send, AlertTriangle } from "lucide-react";
import { ReasonCodeSelect } from "./ReasonCodeSelect";
import { getCountCompletionPercent } from "../utils/stockCountApi";
import type { StockCount, StockCountItem, VarianceReasonCode } from "@/types/inventory";

interface CountSheetProps {
  stockCount: StockCount;
  onUpdateItem: (sku: string, actualQty: number) => void;
  onUpdateReason: (sku: string, reasonCode: VarianceReasonCode, notes?: string) => void;
  onSave: () => void;
  onSubmit: () => void;
}

export function CountSheet({
  stockCount,
  onUpdateItem,
  onUpdateReason,
  onSave,
  onSubmit,
}: CountSheetProps) {
  const [localItems, setLocalItems] = useState<Record<string, number | null>>(
    Object.fromEntries(
      stockCount.items.map((item) => [item.sku, item.actualQty])
    )
  );

  const completionPercent = getCountCompletionPercent({
    ...stockCount,
    items: stockCount.items.map((item) => ({
      ...item,
      actualQty: localItems[item.sku] ?? item.actualQty,
    })),
  });

  const handleQuantityChange = (sku: string, value: string) => {
    const numValue = value === "" ? null : parseInt(value);
    setLocalItems((prev) => ({ ...prev, [sku]: numValue }));

    if (numValue !== null && !isNaN(numValue)) {
      onUpdateItem(sku, numValue);
    }
  };

  const getVarianceBadge = (item: StockCountItem, localQty: number | null) => {
    if (localQty === null) return null;

    const variance = localQty - item.systemQty;
    if (variance === 0) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Match</Badge>;
    }

    const variancePercent =
      item.systemQty > 0
        ? Math.abs((variance / item.systemQty) * 100)
        : 100;

    if (variancePercent > 5 || Math.abs(variance) > 10) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {variance > 0 ? "+" : ""}{variance}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        {variance > 0 ? "+" : ""}{variance}
      </Badge>
    );
  };

  const hasVariances = stockCount.items.some(
    (item) =>
      localItems[item.sku] !== null &&
      localItems[item.sku] !== item.systemQty
  );

  const isComplete = completionPercent === 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Count Sheet - {stockCount.id}
            </CardTitle>
            <CardDescription>
              {stockCount.category
                ? `Category: ${stockCount.category}`
                : "All categories"}{" "}
              • {stockCount.items.length} items
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-lg font-bold">{completionPercent}%</p>
            </div>
            <Progress value={completionPercent} className="w-32 h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-center">System Qty</TableHead>
                <TableHead className="text-center">Actual Qty</TableHead>
                <TableHead className="text-center">Variance</TableHead>
                <TableHead>Reason Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockCount.items.map((item) => {
                const localQty = localItems[item.sku];
                const hasVariance =
                  localQty !== null && localQty !== item.systemQty;

                return (
                  <TableRow
                    key={item.sku}
                    className={
                      hasVariance
                        ? localQty! < item.systemQty
                          ? "bg-red-50"
                          : "bg-yellow-50"
                        : ""
                    }
                  >
                    <TableCell className="font-mono text-sm">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell className="text-center">{item.systemQty}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        value={localQty ?? ""}
                        onChange={(e) =>
                          handleQuantityChange(item.sku, e.target.value)
                        }
                        className="w-20 text-center mx-auto"
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {getVarianceBadge(item, localQty)}
                    </TableCell>
                    <TableCell>
                      {hasVariance && (
                        <ReasonCodeSelect
                          value={item.reasonCode}
                          onChange={(code) => onUpdateReason(item.sku, code)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {hasVariances && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Variances Detected</span>
            </div>
            <p className="text-sm text-yellow-700">
              Some items have quantity variances. Please provide reason codes for
              all variances before submitting.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={onSubmit} disabled={!isComplete}>
            <Send className="h-4 w-4 mr-2" />
            Submit Count
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CountSheet;
