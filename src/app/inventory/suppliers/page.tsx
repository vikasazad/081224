import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import Suppliers from "@/app/modules/inventory/suppliers/components/suppliers";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <Suppliers data={data?.inventory?.store} />
    </div>
  );
};

export default page;
