import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import InventoryItems from "@/app/modules/inventory/total/components/inventoryItems";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <InventoryItems data={data?.inventory?.store} />
    </div>
  );
};

export default page;
