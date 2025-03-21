import RecentTransactions from "@/app/modules/inventory/transactions/components/transactions";
import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <RecentTransactions data={data?.inventory?.store} />
    </div>
  );
};

export default page;
