import ReorderLevel from "@/app/modules/inventory/reorder/components/reorderLevel";
import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <ReorderLevel data={data?.inventory?.store} />
    </div>
  );
};

export default page;
