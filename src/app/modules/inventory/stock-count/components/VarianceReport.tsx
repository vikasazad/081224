"use client";

import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { StockCount } from "@/types/inventory";

interface VarianceReportProps {
  stockCount: StockCount;
}

const reasonCodeLabels: Record<string, string> = {
  "counting-error": "Counting Error",
  damage: "Damage/Spoilage",
  theft: "Theft/Shrinkage",
  "unrecorded-usage": "Unrecorded Usage",
  "unrecorded-receipt": "Unrecorded Receipt",
  other: "Other",
};

export function VarianceReport({ stockCount }: VarianceReportProps) {
  // Filter items with variances
  const varianceItems = stockCount.items.filter(
    (item) => item.actualQty !== null && item.variance !== 0,
  );

  // Calculate totals
  const totalShortage = varianceItems
    .filter((item) => item.variance < 0)
    .reduce((sum, item) => sum + Math.abs(item.varianceValue), 0);

  const totalOverage = varianceItems
    .filter((item) => item.variance > 0)
    .reduce((sum, item) => sum + item.varianceValue, 0);

  const netVarianceValue = totalOverage - totalShortage;

  const requiresApprovalCount = varianceItems.filter(
    (item) => item.requiresApproval,
  ).length;

  if (varianceItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variance Report - {stockCount.id}</CardTitle>
          <CardDescription>No variances found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 text-lg py-2 px-4"
            >
              All items match system quantities
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Variance Report - {stockCount.id}
        </CardTitle>
        <CardDescription>
          {varianceItems.length} item{varianceItems.length !== 1 ? "s" : ""}{" "}
          with variances
          {requiresApprovalCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {requiresApprovalCount} require approval
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Shortages</span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              -₹{totalShortage.toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Overages</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              +₹{totalOverage.toFixed(2)}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              netVarianceValue >= 0 ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground">
              Net Variance
            </span>
            <p
              className={`text-2xl font-bold ${
                netVarianceValue >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {netVarianceValue >= 0 ? "+" : ""}₹{netVarianceValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Variance Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">System</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {varianceItems.map((item) => (
                <TableRow
                  key={item.sku}
                  className={
                    item.variance < 0 ? "bg-red-50/50" : "bg-yellow-50/50"
                  }
                >
                  <TableCell className="font-mono text-sm">
                    {item.sku}
                  </TableCell>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell className="text-right">{item.systemQty}</TableCell>
                  <TableCell className="text-right">{item.actualQty}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      item.variance < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {item.variance > 0 ? "+" : ""}
                    {item.variance}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      item.variance < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {item.variance < 0 ? "-" : "+"}₹
                    {item.varianceValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {item.reasonCode
                      ? reasonCodeLabels[item.reasonCode] || item.reasonCode
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.requiresApproval ? (
                      <Badge variant="destructive" className="text-xs">
                        Needs Approval
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Auto-approve
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Notes Section */}
        {varianceItems.some((item) => item.notes) && (
          <div className="space-y-2">
            <h4 className="font-medium">Notes</h4>
            {varianceItems
              .filter((item) => item.notes)
              .map((item) => (
                <div key={item.sku} className="p-3 bg-muted rounded-lg text-sm">
                  <span className="font-mono text-xs">{item.sku}</span>:{" "}
                  {item.notes}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VarianceReport;
