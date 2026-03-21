import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import { StockCountList } from "@/app/modules/inventory/stock-count/components/StockCountList";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  const stockCounts = data?.inventory?.store?.stockCounts || [];

  return (
    <div>
      <StockCountList stockCounts={stockCounts} />
    </div>
  );
};

export default page;
