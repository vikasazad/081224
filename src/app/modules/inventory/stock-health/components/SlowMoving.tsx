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
import { TrendingDown, AlertTriangle } from "lucide-react";
import { getDaysSinceLastStockOut } from "../utils/stockHealthApi";
import type { InventoryItem } from "@/types/inventory";

interface SlowMovingProps {
  items: InventoryItem[];
  onItemClick?: (sku: string) => void;
}

export function SlowMoving({ items, onItemClick }: SlowMovingProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No slow-moving items</h3>
        <p className="text-muted-foreground">
          All items have been used or sold recently.
        </p>
      </div>
    );
  }

  const getIdleBadge = (daysSince: number | null) => {
    if (daysSince === null) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Never sold
        </Badge>
      );
    }
    if (daysSince >= 90) {
      return <Badge variant="destructive">{daysSince} days</Badge>;
    }
    if (daysSince >= 60) {
      return (
        <Badge variant="default" className="bg-orange-500">
          {daysSince} days
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-yellow-500">
        {daysSince} days
      </Badge>
    );
  };

  // Calculate the total value of slow-moving inventory
  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Total slow-moving stock value</p>
          <p className="text-2xl font-bold">₹{totalValue.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Items</p>
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
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Last Sold/Used</TableHead>
              <TableHead>Idle Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const daysSince = getDaysSinceLastStockOut(item.lastStockOutDate);
              const itemValue = item.quantity * item.unitPrice;

              return (
                <TableRow
                  key={item.sku}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onItemClick?.(item.sku)}
                >
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.quantityUnit}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{itemValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {item.lastStockOutDate
                      ? new Date(item.lastStockOutDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Never"}
                  </TableCell>
                  <TableCell>{getIdleBadge(daysSince)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SlowMoving;
