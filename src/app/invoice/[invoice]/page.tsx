import Invoice from "@/app/modules/invoice/components/invoice";
import React from "react";

const Page = async ({ params }: { params: Promise<{ invoice: string }> }) => {
  const resolvedParams = await params;
  return <Invoice params={resolvedParams.invoice} />;
};

export default Page;
