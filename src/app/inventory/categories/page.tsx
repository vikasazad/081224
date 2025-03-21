import Categories from "@/app/modules/inventory/categories/components/categories";
import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <Categories data={data?.inventory?.store} />
    </div>
  );
};

export default page;
