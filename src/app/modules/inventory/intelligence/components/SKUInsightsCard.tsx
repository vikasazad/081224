"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Building2,
  Package,
} from "lucide-react";
import type { SKUIntelligenceData, InventoryItem } from "@/types/inventory";

interface SKUInsightsCardProps {
  item: InventoryItem;
  intelligence: SKUIntelligenceData | null;
}

export function SKUInsightsCard({ item, intelligence }: SKUInsightsCardProps) {
  if (!intelligence) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SKU Insights
          </CardTitle>
          <CardDescription>No intelligence data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Intelligence data will be calculated after transaction activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stockHealthPercent = Math.min(
    (item.quantity / (intelligence.suggestedReorderLevel * 2)) * 100,
    100
  );

  const isLowStock = item.quantity <= item.reorderLevel;
  const needsReorder = item.quantity <= intelligence.suggestedReorderLevel;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          SKU Insights
        </CardTitle>
        <CardDescription>
          Last calculated:{" "}
          {new Date(intelligence.lastCalculated).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stock Health</span>
            <span className="text-sm text-muted-foreground">
              {item.quantity} / {intelligence.suggestedReorderLevel * 2} optimal
            </span>
          </div>
          <Progress
            value={stockHealthPercent}
            className={`h-2 ${
              isLowStock
                ? "[&>div]:bg-red-500"
                : needsReorder
                ? "[&>div]:bg-yellow-500"
                : "[&>div]:bg-green-500"
            }`}
          />
          {needsReorder && (
            <Badge variant="destructive" className="text-xs">
              Reorder Recommended
            </Badge>
          )}
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-xs">Avg Daily Usage</span>
            </div>
            <p className="text-lg font-bold">
              {intelligence.avgDailyUsage.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                units
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Avg Lead Time</span>
            </div>
            <p className="text-lg font-bold">
              {intelligence.avgLeadTimeDays}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                days
              </span>
            </p>
          </div>
        </div>

        {/* Reorder Suggestions */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <h4 className="text-sm font-medium">Reorder Suggestions</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Suggested Reorder Level</p>
              <p className="font-medium">
                {intelligence.suggestedReorderLevel} units
              </p>
              {intelligence.suggestedReorderLevel !== item.reorderLevel && (
                <p className="text-xs text-muted-foreground">
                  Current: {item.reorderLevel}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Suggested Order Qty</p>
              <p className="font-medium">
                {intelligence.suggestedOrderQty} units
              </p>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Pricing</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Purchase Price</span>
            <span className="font-medium">
              ₹{intelligence.lastPurchasePrice.toFixed(2)}
            </span>
          </div>
          {intelligence.priceHistory.length > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price Trend</span>
              {intelligence.priceHistory[intelligence.priceHistory.length - 1]
                .price >
              intelligence.priceHistory[intelligence.priceHistory.length - 2]
                .price ? (
                <span className="flex items-center gap-1 text-red-500">
                  <TrendingUp className="h-3 w-3" />
                  Increasing
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-500">
                  <TrendingDown className="h-3 w-3" />
                  Decreasing
                </span>
              )}
            </div>
          )}
        </div>

        {/* Preferred Supplier */}
        {intelligence.preferredSupplierId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Preferred Supplier</span>
            </div>
            <p className="text-sm">{intelligence.preferredSupplierId}</p>
            {intelligence.supplierScores.length > 0 && (
              <div className="flex gap-2">
                {intelligence.supplierScores.slice(0, 3).map((score) => (
                  <Badge key={score.supplierId} variant="outline" className="text-xs">
                    {score.supplierId}: {score.combinedScore}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SKUInsightsCard;
