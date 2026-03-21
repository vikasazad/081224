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
import { Input } from "@/components/ui/input";
import { Building2, GripVertical } from "lucide-react";
import type { POItem } from "@/types/inventory";

interface SupplierGroupCardProps {
  supplierName: string;
  supplierId: string;
  items: POItem[];
  onItemChange?: (sku: string, field: keyof POItem, value: number) => void;
  editable?: boolean;
  showDragHandles?: boolean;
  isPriorityPartner?: boolean;
}

export function SupplierGroupCard({
  supplierName,
  items,
  onItemChange,
  editable = false,
  showDragHandles = false,
  isPriorityPartner = false,
}: SupplierGroupCardProps) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Supplier Header */}
      <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
        <Building2 className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-900">Supplier: {supplierName}</span>
        {isPriorityPartner && (
          <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-medium rounded">
            PRIORITY PARTNER
          </span>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {items.length} item{items.length !== 1 ? "s" : ""} • Subtotal: ₹{subtotal.toFixed(2)}
        </span>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {showDragHandles && <TableHead className="w-10"></TableHead>}
              <TableHead className="text-xs font-medium text-gray-500 uppercase">
                Item Details
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">
                SKU
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">
                Quantity
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">
                Unit Price
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-gray-500 uppercase">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.sku} className="border-b border-gray-100 last:border-0">
                {showDragHandles && (
                  <TableCell className="py-3 px-2">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </TableCell>
                )}
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">📦</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.itemName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-sm text-gray-500 font-mono">{item.sku}</span>
                </TableCell>
                <TableCell className="py-3">
                  {editable && onItemChange ? (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onItemChange(
                          item.sku,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-20 text-center border-gray-300"
                    />
                  ) : (
                    <span className="text-gray-900">{item.quantity}</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {editable && onItemChange ? (
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">₹</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          onItemChange(
                            item.sku,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 border-gray-300"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-900">₹{item.unitPrice.toFixed(2)}</span>
                  )}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <span className="font-medium text-gray-900">₹{item.amount.toFixed(2)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SupplierGroupCard;
