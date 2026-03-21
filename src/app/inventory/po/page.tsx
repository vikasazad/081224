import { getPurchaseOrdersData } from "@/app/modules/inventory/store/utils/InventoryApi";
import POListPage from "./POListPage";
import React from "react";

const page = async () => {
  const data: any = await getPurchaseOrdersData();
  return (
    <div>
      <POListPage purchaseOrders={data?.purchaseOrders} />
    </div>
  );
};

export default page;
