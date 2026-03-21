"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { POCreateWizard } from "@/app/modules/inventory/po/components/POCreateWizard";
import { createPurchaseOrder, getPurchaseOrderById, updatePurchaseOrder } from "@/app/modules/inventory/po/utils/poApi";
import type { PurchaseOrder, InventoryStore } from "@/types/inventory";

interface POCreatePageProps {
  data: InventoryStore;
}

export default function POCreatePage({ data }: POCreatePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [initialPO, setInitialPO] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const editId = searchParams.get("edit");
  const items = data?.items || [];
  const suppliers = data?.suppliers || [];
  const currentUser = session?.user?.email || "admin";

  // Fetch PO data if in edit mode
  useEffect(() => {
    const fetchPOData = async () => {
      if (editId) {
        setIsLoading(true);
        const po = await getPurchaseOrderById(editId);
        if (po && po.status === "draft") {
          setInitialPO(po);
        } else {
          // If PO not found or not a draft, redirect to PO list
          router.push("/inventory/po");
        }
        setIsLoading(false);
      }
    };
    
    fetchPOData();
  }, [editId, router]);

  const handleSubmit = async (poData: Omit<PurchaseOrder, "createdAt">) => {
    console.log("PODATA:", poData);
    
    if (editId && initialPO) {
      // Update existing PO
      const updatedPO: PurchaseOrder = {
        ...poData,
        createdAt: initialPO.createdAt,
      };
      const success = await updatePurchaseOrder(updatedPO);
      if (success) {
        router.push(`/inventory/po/${updatedPO.id}`);
      }
    } else {
      // Create new PO
      const newPO = await createPurchaseOrder(poData);
      if (newPO) {
        router.push(`/inventory/po/${newPO.id}`);
      }
    }
  };

  const handleCancel = () => {
    router.push("/inventory/po");
  };

  // Show loading state while fetching PO data
  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <POCreateWizard
        items={items}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        currentUser={currentUser}
        initialPO={initialPO}
      />
    </div>
  );
}
