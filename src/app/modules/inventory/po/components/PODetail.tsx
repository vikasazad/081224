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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Send,
  PackageCheck,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { POStatusBadge } from "./POStatusBadge";
import { POItemsTable } from "./POItemsTable";
import type { PurchaseOrder, POStatus } from "@/types/inventory";

interface PODetailProps {
  purchaseOrder: PurchaseOrder;
  onStatusChange?: (status: POStatus) => void;
  onReceive?: () => void;
}

export function PODetail({
  purchaseOrder: po,
  onStatusChange,
  onReceive,
}: PODetailProps) {
  console.log("POOOOO", po);
  const router = useRouter();

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canApprove = po.status === "pending-approval";
  const canSend = po.status === "approved";
  const canReceive = po.status === "sent" || po.status === "partially-received";
  const canEdit = po.status === "draft";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory/po")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {po.id}
              <POStatusBadge status={po.status} />
            </h1>
            <p className="text-muted-foreground">{po.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/inventory/po/create?edit=${po.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canApprove && (
            <Button onClick={() => onStatusChange?.("approved")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {canSend && (
            <Button onClick={() => onStatusChange?.("sent")}>
              <Send className="h-4 w-4 mr-2" />
              Mark as Sent
            </Button>
          )}
          {canReceive && (
            <Button onClick={onReceive}>
              <PackageCheck className="h-4 w-4 mr-2" />
              Receive Items
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* PO Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(po.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">{po.createdBy}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">
                  {po.type}
                  {po.type === "recurring" && po.frequency && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({po.frequency})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {po.expectedDeliveryDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Expected Delivery
                  </p>
                  <p className="font-medium">
                    {formatDateTime(po.expectedDeliveryDate)}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {po.approvedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="font-medium">{formatDateTime(po.approvedAt)}</p>
                {po.approvedBy && (
                  <p className="text-sm text-muted-foreground">
                    by {po.approvedBy}
                  </p>
                )}
              </div>
            )}

            {po.sentAt && (
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="font-medium">{formatDateTime(po.sentAt)}</p>
              </div>
            )}

            {po.receivedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="font-medium">{formatDateTime(po.receivedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
            <CardDescription>
              {po.items.length} item{po.items.length !== 1 ? "s" : ""} • Total:
              ₹{po.totalAmount.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <POItemsTable
              items={po.items}
              showReceived={
                po.status === "received" || po.status === "partially-received"
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Tracked Items (for recurring POs) */}
      {/* {po.type === "recurring" && po.trackedItemSkus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tracked Items</CardTitle>
            <CardDescription>
              These items are automatically added when they reach reorder level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {po.trackedItemSkus.map((sku) => (
                <span
                  key={sku}
                  className="px-3 py-1 bg-muted rounded-full text-sm font-mono"
                >
                  {sku}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}

export default PODetail;
