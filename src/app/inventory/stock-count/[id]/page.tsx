import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import StockCountDetailPage from "./StockCountDetailPage";
import React from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  const data: any = await getInventoryData();

  return (
    <div>
      <StockCountDetailPage data={data?.inventory?.store} countId={id} />
    </div>
  );
};

export default page;
