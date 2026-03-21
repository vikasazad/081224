import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import POCreatePage from "./POCreatePage";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <POCreatePage data={data?.inventory?.store} />
    </div>
  );
};

export default page;
