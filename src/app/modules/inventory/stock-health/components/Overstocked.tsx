"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PackageX, TrendingUp } from "lucide-react";
import { getOveragePercent } from "../utils/stockHealthApi";
import type { InventoryItem } from "@/types/inventory";

interface OverstockedProps {
  items: InventoryItem[];
  onItemClick?: (sku: string) => void;
}

export function Overstocked({ items, onItemClick }: OverstockedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No overstocked items</h3>
        <p className="text-muted-foreground">
          All items are within their maximum stock levels.
        </p>
      </div>
    );
  }

  // Calculate total excess value
  const totalExcessValue = items.reduce((sum, item) => {
    if (!item.maxStockLevel) return sum;
    const excess = Math.max(0, item.quantity - item.maxStockLevel);
    return sum + excess * item.unitPrice;
  }, 0);

  const getOverageBadge = (overagePercent: number | null) => {
    if (overagePercent === null) return null;

    if (overagePercent >= 50) {
      return <Badge variant="destructive">+{overagePercent}%</Badge>;
    }
    if (overagePercent >= 25) {
      return (
        <Badge variant="default" className="bg-orange-500">
          +{overagePercent}%
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-yellow-500">
        +{overagePercent}%
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Total excess stock value</p>
          <p className="text-2xl font-bold">₹{totalExcessValue.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overstocked items</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Max Level</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Overage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const overagePercent = getOveragePercent(
                item.quantity,
                item.maxStockLevel
              );
              const fillPercent = item.maxStockLevel
                ? Math.min((item.quantity / item.maxStockLevel) * 100, 150)
                : 0;

              return (
                <TableRow
                  key={item.sku}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onItemClick?.(item.sku)}
                >
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className="text-red-600">{item.quantity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.maxStockLevel}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <div className="space-y-1">
                      <Progress
                        value={fillPercent > 100 ? 100 : fillPercent}
                        className={`h-2 ${
                          fillPercent > 100
                            ? "[&>div]:bg-red-500"
                            : "[&>div]:bg-yellow-500"
                        }`}
                      />
                      {fillPercent > 100 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <TrendingUp className="h-3 w-3" />
                          {Math.round(fillPercent)}% of max
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getOverageBadge(overagePercent)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Overstocked;
