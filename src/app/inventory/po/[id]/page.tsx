import { getInventoryData } from "@/app/modules/inventory/store/utils/InventoryApi";
import PODetailPage from "./PODetailPage";
import React from "react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ receive?: string }>;
}

const page = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { receive } = await searchParams;
  const data: any = await getInventoryData();

  return (
    <div className="w-full p-6">
      <PODetailPage
        data={data?.inventory?.store}
        poId={id}
        showReceive={receive === "true"}
      />
    </div>
  );
};

export default page;
