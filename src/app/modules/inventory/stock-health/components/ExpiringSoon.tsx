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
import { AlertCircle, Clock } from "lucide-react";
import { getDaysUntilExpiry } from "../utils/stockHealthApi";
import type { InventoryItem } from "@/types/inventory";

interface ExpiringSoonProps {
  items: InventoryItem[];
  onItemClick?: (sku: string) => void;
}

export function ExpiringSoon({ items, onItemClick }: ExpiringSoonProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No expiring items</h3>
        <p className="text-muted-foreground">
          All items with expiry dates are well within their shelf life.
        </p>
      </div>
    );
  }

  const getExpiryBadge = (daysUntil: number) => {
    if (daysUntil < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    if (daysUntil <= 3) {
      return (
        <Badge variant="destructive">
          {daysUntil} day{daysUntil !== 1 ? "s" : ""}
        </Badge>
      );
    }
    if (daysUntil <= 7) {
      return (
        <Badge variant="default" className="bg-yellow-500">
          {daysUntil} days
        </Badge>
      );
    }
    return <Badge variant="secondary">{daysUntil} days</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Time Left</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const daysUntil = getDaysUntilExpiry(item.expiryDate!);
            return (
              <TableRow
                key={item.sku}
                className={`cursor-pointer hover:bg-muted/50 ${
                  daysUntil < 0 ? "bg-red-50" : daysUntil <= 3 ? "bg-yellow-50" : ""
                }`}
                onClick={() => onItemClick?.(item.sku)}
              >
                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">
                  {item.quantity} {item.quantityUnit}
                </TableCell>
                <TableCell>
                  {new Date(item.expiryDate!).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>{getExpiryBadge(daysUntil)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ExpiringSoon;
