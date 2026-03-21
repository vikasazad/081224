import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import ReorderListPage from "./ReorderListPage";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <ReorderListPage data={data?.inventory?.store} />
    </div>
  );
};

export default page;
