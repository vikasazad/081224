"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { getInvoiceData } from "@/lib/features/invoiceSlice";
import RoomInvoice from "./roomInvoice";
import TableInvoice from "./tableInvoice";

const Invoice = ({ params }: { params?: string }) => {
  console.log("params", params);

  const { data: invoice, from } = useSelector((state: RootState) =>
    params ? getInvoiceData(state, params) : { data: null, from: null }
  );
  console.log("invoice", invoice, from);

  // Update document title with invoice number

  return (
    <div>
      {from === "room" ? (
        <RoomInvoice {...invoice} params={params} />
      ) : (
        <TableInvoice {...invoice} params={params} />
      )}
    </div>
  );
};

export default Invoice;
