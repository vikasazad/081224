"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CountSheet } from "@/app/modules/inventory/stock-count/components/CountSheet";
import { VarianceReport } from "@/app/modules/inventory/stock-count/components/VarianceReport";
import { AdjustmentApproval } from "@/app/modules/inventory/stock-count/components/AdjustmentApproval";
import {
  updateStockCountItem,
  updateStockCountItemReason,
  submitForReview,
  submitForApproval,
  approveStockCount,
  rejectStockCount,
  hasVariancesRequiringApproval,
} from "@/app/modules/inventory/stock-count/utils/stockCountApi";
import type { InventoryStore, VarianceReasonCode } from "@/types/inventory";

interface StockCountDetailPageProps {
  data: InventoryStore;
  countId: string;
}

export default function StockCountDetailPage({
  data,
  countId,
}: StockCountDetailPageProps) {
  const router = useRouter();

  const stockCounts = data?.stockCounts || [];
  const stockCount = stockCounts.find((sc) => sc.id === countId);

  if (!stockCount) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Stock Count Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The stock count {countId} could not be found.
        </p>
        <Button onClick={() => router.push("/inventory/stock-count")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stock Counts
        </Button>
      </div>
    );
  }

  const handleUpdateItem = async (sku: string, actualQty: number) => {
    await updateStockCountItem(countId, sku, actualQty);
  };

  const handleUpdateReason = async (
    sku: string,
    reasonCode: VarianceReasonCode,
    notes?: string
  ) => {
    await updateStockCountItemReason(countId, sku, reasonCode, notes);
  };

  const handleSave = () => {
    // Items are saved on each change, so just show a confirmation
    alert("Progress saved!");
  };

  const handleSubmit = async () => {
    // Determine if approval is needed
    if (hasVariancesRequiringApproval(stockCount)) {
      await submitForApproval(countId);
    } else {
      await submitForReview(countId);
    }
    router.refresh();
  };

  const handleApprove = async () => {
    await approveStockCount(countId, "admin"); // TODO: Get from session
    router.refresh();
  };

  const handleReject = async (reason: string) => {
    await rejectStockCount(countId, reason);
    router.refresh();
  };

  // Render based on status
  if (stockCount.status === "pending-approval") {
    return (
      <AdjustmentApproval
        stockCount={stockCount}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  if (
    stockCount.status === "completed" ||
    stockCount.status === "rejected" ||
    stockCount.status === "pending-review"
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory/stock-count")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Stock Count {countId}</h1>
            <p className="text-muted-foreground capitalize">
              Status: {stockCount.status.replace("-", " ")}
            </p>
          </div>
        </div>
        <VarianceReport stockCount={stockCount} />
      </div>
    );
  }

  // In-progress status - show count sheet
  return (
    <CountSheet
      stockCount={stockCount}
      onUpdateItem={handleUpdateItem}
      onUpdateReason={handleUpdateReason}
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  );
}
