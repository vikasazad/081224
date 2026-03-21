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
import { CheckCircle, XCircle } from "lucide-react";
import type { POItem } from "@/types/inventory";

interface POItemsTableProps {
  items: POItem[];
  showReceived?: boolean;
}

export function POItemsTable({
  items,
  showReceived = false,
}: POItemsTableProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Ordered</TableHead>
            {showReceived && (
              <>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-center">Quality</TableHead>
              </>
            )}
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.sku}-${item.supplier.name}`}>
              <TableCell className="font-mono text-sm">{item.sku}</TableCell>
              <TableCell className="font-medium">{item.itemName}</TableCell>
              <TableCell>{item.supplier.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              {showReceived && (
                <>
                  <TableCell className="text-right">
                    {item.receivedQty !== undefined ? (
                      <span
                        className={
                          item.receivedQty < item.quantity
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        {item.receivedQty}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.qualityOk !== undefined ? (
                      item.qualityOk ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          OK
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Issue
                        </Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </>
              )}
              <TableCell className="text-right">
                ₹{item.unitPrice}
              </TableCell>
              <TableCell className="text-right font-medium">
                ₹{item.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50">
            <TableCell
              colSpan={showReceived ? 7 : 5}
              className="text-right font-medium"
            >
              Total:
            </TableCell>
            <TableCell className="text-right font-bold">
              ₹{total.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export default POItemsTable;
