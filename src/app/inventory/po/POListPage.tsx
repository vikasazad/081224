"use client";

import React from "react";
import { POList } from "@/app/modules/inventory/po/components/POList";
import {
  deletePurchaseOrder,
  updatePOStatus,
} from "@/app/modules/inventory/po/utils/poApi";
import type { POStatus,  PurchaseOrder } from "@/types/inventory";
import { useRouter } from "next/navigation";

interface POListPageProps {
  purchaseOrders: PurchaseOrder[];
}

export default function POListPage({ purchaseOrders }: POListPageProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      const success = await deletePurchaseOrder(id);
      if (success) {
        router.refresh();
      }
    }
  };

  const handleStatusChange = async (id: string, status: POStatus) => {
    console.log("STATUS CHANGE:", id, status);
    const metadata: Record<string, string> = {};
    console.log("METADATA:", metadata);

    if (status === "approved") {
      metadata.approvedAt = new Date().toISOString();
      metadata.approvedBy = "admin"; // TODO: Get from session
    } else if (status === "sent") {
      metadata.sentAt = new Date().toISOString();
    }

    const success = await updatePOStatus(id, status, metadata);
    if (success) {
      router.refresh();
    }
  };

  return (
    <div className="w-full p-6">
      <POList
        purchaseOrders={purchaseOrders}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
