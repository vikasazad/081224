"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  // TableHead,
  // TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { getInvoiceData } from "@/lib/features/invoiceSlice";

const Invoice = ({ params }: { params?: string }) => {
  const printRef = useRef(null);
  console.log("params", params);
  const [invoiceMode, setInvoiceMode] = useState<"preview" | "final">("final");

  const invoice = useSelector((state: RootState) =>
    params ? getInvoiceData(state, params) : null
  );
  console.log("invoice", invoice);

  // Update document title with invoice number
  useEffect(() => {
    if (params) {
      document.title = params + (invoiceMode === "preview" ? " Preview" : "");
    }

    // Cleanup function to restore original title when component unmounts
    return () => {
      document.title = "Invoice"; // or your app's default title
    };
  }, [params, invoiceMode]);

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          .no-print {
            display: none !important;
          }
          .print-compact {
            padding: 0.5rem !important;
            margin: 0.25rem 0 !important;
          }
        }
      `}</style>
      <div className="space-y-4 p-2 mx-8 print:p-0 print:mx-0">
        <div className="no-print bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Invoice
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Generate and print your invoice
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Mode Toggle Section */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border">
                <span className="text-sm font-medium text-gray-700">Mode:</span>
                <div className="flex bg-white rounded-md border border-gray-200 p-1">
                  <button
                    onClick={() => setInvoiceMode("final")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
                      invoiceMode === "final"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Final
                  </button>
                  <button
                    onClick={() => setInvoiceMode("preview")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
                      invoiceMode === "preview"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Print Button */}
              <Button
                onClick={() => window.print()}
                variant="default"
                className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium shadow-sm"
              >
                Print {invoiceMode === "preview" ? "Preview" : "Final"} Invoice
              </Button>
            </div>
          </div>
        </div>

        <div
          className="w-[210mm] max-h-[297mm] mx-auto bg-white p-6 border border-black text-sm print:shadow-none print:border-0 print:p-4 overflow-hidden"
          ref={printRef}
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center">
            <h1 className="text-xl font-bold ">
              {invoiceMode === "preview" ? "PREVIEW INVOICE" : "TAX INVOICE"}
            </h1>
            <div>
              <Image
                src="/Blogo.svg"
                alt="Business Logo"
                className="h-15 w-12"
                width={48}
                height={55}
              />
            </div>
            <div className="">
              <div className="text-xs font-bold">
                {invoice?.business?.name?.toUpperCase() || "BUSINESS NAME"}
              </div>
              <div className="text-xs mt-1">
                {invoice?.business?.address || "Business Address"}
                <br />
                Email: {invoice?.business?.email || "N/A"}
                <br />
                Phone: {invoice?.business?.phone || "N/A"}
              </div>
            </div>
          </div>
          {invoiceMode === "preview" && (
            <div className="w-full flex justify-center py-2">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded px-4 py-2">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs font-semibold text-amber-800">
                  PREVIEW MODE - This invoice is for preview only and is not a
                  valid tax invoice.
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start justify-between py-3">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-slate">Booking ID</span>
                <br />
                <span className=" font-bold">
                  {invoice?.business?.bookingId || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate">Invoice No.</span>
                <br />
                <span className="font-bold">
                  {invoice?.business?.invoiceNo || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate">Date</span>
                <br />
                <span className="font-bold">
                  {invoice?.business?.date || "N/A"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-slate">PAN</span>
                <br />
                <span className="font-bold">
                  {invoice?.business?.pan || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate">GSTIN</span>
                <br />
                <span className="font-bold">
                  {invoice?.business?.gst || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate">CIN</span>
                <br />
                <span className="font-bold">
                  {invoice?.business?.cin || "N/A"}
                </span>
              </div>
            </div>
            <div></div>
          </div>

          {/* Dotted Line */}
          <div className="border-t border-dotted border-black my-2"></div>

          {/* Customer Name */}
          <div className="">
            <span className="text-xs text-slate">Customer Name</span>
            <br />
            <span className="font-bold">
              {invoice?.customer?.name || "N/A"}
            </span>
          </div>

          {/* Dotted Line */}
          <div className="border-t border-dotted border-gray-400 my-2"></div>

          {/* Hotel Information */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-xs text-slate">Check-in</span>
              <br />
              <span className="font-bold">
                {invoice?.stayDetails?.checkIn || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate">Check-out</span>
              <br />
              <span className="font-bold">
                {invoice?.stayDetails?.checkOut || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate">Nights</span>
              <br />
              <span className="font-bold">
                {invoice?.stayDetails?.nights || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate">Guests</span>
              <br />
              <span className="font-bold">
                {invoice?.stayDetails?.noOfGuests || "N/A"}
              </span>
            </div>
          </div>

          {/* Dotted Line Separator */}
          <div className="flex items-center justify-center mt-4 gap-5">
            {/* <div className="inline-block px-4 py-1 border-t border-b border-dotted border-gray-400">
              <span className="font-bold">PAYMENT BREAKUP</span>
            </div> */}
            <div className="border-t-2 border-dotted border-black   w-full"></div>
            <div>
              <span className="font-bold mr-2">PAYMENT</span>
              <span className="font-bold">BREAKUP</span>
            </div>
            <div className="border-t-2 border-dotted border-black  w-full"></div>
          </div>

          {/* Payment Details */}
          <div className="border border-black my-2 rounded-xl">
            <div className="p-4">
              <Table>
                {/* <TableHeader>
                  <TableRow className="border-none">
                    <TableHead colSpan={2}></TableHead>
                    <TableHead></TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader> */}
                <TableBody>
                  {/* Accommodation Charges */}
                  {invoice?.billItems?.booking && (
                    <>
                      <TableRow className="border-none bg-none">
                        <TableCell className="text-base font-bold" colSpan={2}>
                          Accommodation Charges
                        </TableCell>
                        <TableCell className="">
                          {invoice.business?.bookingId || ""}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₹ {invoice.billItems.booking.price || "0.00"}
                        </TableCell>
                      </TableRow>
                      {invoice.billItems.booking.discount.code.trim() !==
                        "" && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            Discount (
                            {invoice.billItems.booking.discount.amount}
                            %)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs">
                            {invoice.billItems.booking.discount.code}
                          </TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            - ₹{" "}
                            {invoice.billItems.booking.price -
                              invoice.billItems.booking.subtotal || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                      {invoice.billItems.booking.gst?.cgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            CGST ({invoice.billItems.booking.gst.cgstPercentage}
                            %)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.booking.gst.cgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                      {invoice.billItems.booking.gst?.sgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            SGST ({invoice.billItems.booking.gst.sgstPercentage}
                            %)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.booking.gst.sgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                      {invoice.billItems.booking.discount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            Discount
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs text-red-500 font-bold">
                            ₹ -
                            {invoice.billItems.booking.discount?.toFixed(2) ||
                              "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}

                  {/* Food & Beverages */}
                  {invoice?.billItems?.diningOrders && (
                    <>
                      <TableRow className="border-none">
                        <TableCell className="text-base font-bold" colSpan={2}>
                          Food & Beverages
                        </TableCell>
                        <TableCell className=""></TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{" "}
                          {invoice.billItems.diningOrders.subtotal?.toFixed(
                            2
                          ) || "0.00"}
                        </TableCell>
                      </TableRow>
                      {invoice.billItems.diningOrders.gst?.cgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            CGST (
                            {invoice.billItems.diningOrders.gst.cgstPercentage}
                            %)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.diningOrders.gst.cgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                      {invoice.billItems.diningOrders.gst?.sgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            SGST (
                            {invoice.billItems.diningOrders.gst.sgstPercentage}
                            %)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.diningOrders.gst.sgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}

                  {/* Services */}
                  {invoice?.billItems?.services && (
                    <>
                      <TableRow className="border-none">
                        <TableCell className="text-base font-bold" colSpan={2}>
                          Services
                        </TableCell>
                        <TableCell className=""></TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{" "}
                          {invoice.billItems.services.subtotal?.toFixed(2) ||
                            "0.00"}
                        </TableCell>
                      </TableRow>
                      {invoice.billItems.services.gst?.cgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            CGST (
                            {invoice.billItems.services.gst.cgstPercentage}%)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.services.gst.cgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                      {invoice.billItems.services.gst?.sgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            SGST (
                            {invoice.billItems.services.gst.sgstPercentage}%)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.services.gst.sgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}

                  {/* Checklist/Mini Bar */}
                  {invoice?.billItems?.checklist?.totalPrice > 0 && (
                    <>
                      <TableRow className="border-none">
                        <TableCell className="text-base font-bold" colSpan={2}>
                          Mini Bar
                        </TableCell>
                        <TableCell className=""></TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{" "}
                          {invoice.billItems.checklist.subtotal?.toFixed(2) ||
                            "0.00"}
                        </TableCell>
                      </TableRow>
                      {invoice.billItems.checklist.gst?.cgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            CGST (
                            {invoice.billItems.checklist.gst.cgstPercentage}%)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.checklist.gst.cgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                      {invoice.billItems.checklist.gst?.sgstAmount > 0 && (
                        <TableRow className="border-none">
                          <TableCell
                            className="text-xs font-bold px-2 py-0"
                            colSpan={2}
                          >
                            SGST (
                            {invoice.billItems.checklist.gst.sgstPercentage}%)
                          </TableCell>
                          <TableCell className="px-2 py-0 text-xs"></TableCell>
                          <TableCell className="text-right px-2 py-0 text-xs font-bold">
                            ₹{" "}
                            {invoice.billItems.checklist.gst.sgstAmount?.toFixed(
                              2
                            ) || "0.00"}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="px-2 pb-0">
                      Sub Total
                    </TableCell>
                    <TableCell className="text-right px-2 pb-0">
                      ₹ {invoice?.totals?.subtotal?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="px-2 py-0">
                      Total GST
                    </TableCell>
                    <TableCell className="text-right px-2 py-0">
                      ₹ {invoice?.totals?.gst?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-base font-bold">
                      Grand Total
                    </TableCell>
                    <TableCell className="text-right text-base font-bold ">
                      ₹ {invoice?.totals?.grandTotal || "0.00"}
                    </TableCell>
                  </TableRow>
                  {invoice?.totals?.pendingAmount > 0 && (
                    <TableRow className="text-red-500">
                      <TableCell
                        colSpan={3}
                        className="text-base font-bold py-0"
                      >
                        Pending Amount
                      </TableCell>
                      <TableCell className="text-right text-base font-bold py-0 ">
                        ₹ {invoice?.totals?.pendingAmount || "0.00"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableFooter>
              </Table>
            </div>
            {/* <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-bold">
                  Accommodation Charges
                  <br />
                </span>
                <span className="font-bold">₹1397.29</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fees</span>
                <span className="font-bold">₹112.28</span>
              </div>
              <div className="flex justify-between">
                <span>Reversal of MakeMyTrip Service Fee</span>
                <span className="font-bold text-red-600">₹-112.28</span>
              </div>
              <div className="flex justify-between">
                <span>Effective discount</span>
                <span className="font-bold text-red-600">₹-83.39</span>
              </div>
              <div className="border-t border-black pt-2">
                <div className="flex justify-between">
                  <span className="font-bold">Grand Total</span>
                  <span className="font-bold">₹ ₹1313.9</span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Footer Note */}

          {/* Terms & Conditions */}
          <div className="text-center my-6">
            <div className="inline-block px-4 py-1 border-t border-b border-dotted border-gray-400">
              <span className="font-bold text-xs">TERMS & CONDITIONS</span>
            </div>
          </div>

          {/* <div className="text-xs space-y-2">
            <div className="flex">
              <span className="mr-2">1.</span>
              <span>
                Any dispute with respect to the invoice is to be reported back
                to MMT/GOIBIBO within 48 hours of receipt of invoice.
              </span>
            </div>
            <div className="flex">
              <span className="mr-2">2.</span>
              <span>
                QR code for B2B and SEZ category invoices can only be scanned
                using app downloaded from the link{" "}
                <a
                  href="https://einvoice1.gst.gov.in/Others/QRCodeVerifyApp"
                  className="text-blue-600 underline"
                >
                  https://einvoice1.gst.gov.in/Others/QRCodeVerifyApp
                </a>
              </span>
            </div>
            <div className="flex">
              <span className="mr-2">3.</span>
              <span>
                This is system generated invoice and does not require
                signatures.
              </span>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Invoice;
