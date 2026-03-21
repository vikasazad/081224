import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import NewStockCountPage from "./NewStockCountPage";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();

  return (
    <div>
      <NewStockCountPage data={data?.inventory?.store} />
    </div>
  );
};

export default page;
