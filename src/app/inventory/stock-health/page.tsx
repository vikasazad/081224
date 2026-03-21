import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import { StockHealth } from "@/app/modules/inventory/stock-health/components/StockHealth";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  const items = data?.inventory?.store?.items || [];

  return (
    <div>
      <StockHealth items={items} />
    </div>
  );
};

export default page;
