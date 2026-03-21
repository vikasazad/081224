"use client";

import React from "react";
import { DailyReorderList } from "@/app/modules/inventory/po/components/DailyReorderList";
import type { InventoryStore } from "@/types/inventory";

interface ReorderListPageProps {
  data: InventoryStore;
}

export default function ReorderListPage({ data }: ReorderListPageProps) {
  const items = data?.items || [];
  const purchaseOrders = data?.purchaseOrders || [];

  return (
    <DailyReorderList allItems={items} purchaseOrders={purchaseOrders} />
  );
}
