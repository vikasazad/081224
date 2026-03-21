"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import { VarianceReport } from "./VarianceReport";
import type { StockCount } from "@/types/inventory";

interface AdjustmentApprovalProps {
  stockCount: StockCount;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function AdjustmentApproval({
  stockCount,
  onApprove,
  onReject,
}: AdjustmentApprovalProps) {
  const requiresApprovalItems = stockCount.items.filter(
    (item) => item.requiresApproval
  );

  const handleReject = () => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      onReject(reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Approval Required - {stockCount.id}
              </CardTitle>
              <CardDescription>
                {requiresApprovalItems.length} item
                {requiresApprovalItems.length !== 1 ? "s" : ""} require manager
                approval
              </CardDescription>
            </div>
            <Badge variant="destructive">Pending Approval</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Count Date</p>
                <p className="font-medium">
                  {new Date(stockCount.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Counted By</p>
                <p className="font-medium">{stockCount.countedBy}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{stockCount.category || "All"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="font-medium">{stockCount.items.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variance Report */}
      <VarianceReport stockCount={stockCount} />

      {/* Approval Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Decision</CardTitle>
          <CardDescription>
            Please review the variances above and make a decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Approving this count will adjust the
                system quantities to match the physical count. This action
                cannot be undone.
              </p>
            </div>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Count
              </Button>
              <Button onClick={onApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Apply Adjustments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdjustmentApproval;
