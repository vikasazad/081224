"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PODetail } from "@/app/modules/inventory/po/components/PODetail";
import { POReceiveForm } from "@/app/modules/inventory/po/components/POReceiveForm";
import {
  updatePOStatus,
  receivePOItems,
} from "@/app/modules/inventory/po/utils/poApi";
import type { POStatus, ReceivedItem, InventoryStore } from "@/types/inventory";

interface PODetailPageProps {
  data: InventoryStore;
  poId: string;
  showReceive?: boolean;
}

export default function PODetailPage({
  data,
  poId,
  showReceive = false,
}: PODetailPageProps) {
  const router = useRouter();
  const [isReceiving, setIsReceiving] = useState(showReceive);

  const purchaseOrders = data?.purchaseOrders || [];
  const po = purchaseOrders.find((p) => p.id === poId);

  if (!po) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Purchase Order Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The purchase order {poId} could not be found.
        </p>
        <button
          onClick={() => router.push("/inventory/po")}
          className="text-primary hover:underline"
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  const handleStatusChange = async (status: POStatus) => {
    const metadata: Record<string, string> = {};

    if (status === "approved") {
      metadata.approvedAt = new Date().toISOString();
      metadata.approvedBy = "admin"; // TODO: Get from session
    } else if (status === "sent") {
      metadata.sentAt = new Date().toISOString();
    }

    const success = await updatePOStatus(poId, status, metadata);
    if (success) {
      router.refresh();
    }
  };

  const handleReceive = () => {
    setIsReceiving(true);
  };

  const handleReceiveSubmit = async (receivedItems: ReceivedItem[]) => {
    const success = await receivePOItems(poId, receivedItems);
    if (success) {
      setIsReceiving(false);
      router.refresh();
    }
  };

  const handleReceiveCancel = () => {
    setIsReceiving(false);
    router.replace(`/inventory/po/${poId}`);
  };

  if (isReceiving) {
    return (
      <POReceiveForm
        purchaseOrder={po}
        onSubmit={handleReceiveSubmit}
        onCancel={handleReceiveCancel}
      />
    );
  }

  return (
    <PODetail
      purchaseOrder={po}
      onStatusChange={handleStatusChange}
      onReceive={handleReceive}
    />
  );
}
