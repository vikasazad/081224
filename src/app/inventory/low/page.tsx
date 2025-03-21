import BelowSafetyLevel from "@/app/modules/inventory/low/components/belowSafetyLevel";
import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";

import React from "react";

const page = async () => {
  const data: any = await getInventoryData();
  return (
    <div>
      <BelowSafetyLevel data={data?.inventory?.store} />
    </div>
  );
};

export default page;
