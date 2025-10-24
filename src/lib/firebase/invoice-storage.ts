"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/db/firebase";

// if (format === "pdf") {
//   const printWindow = window.open("", "_blank");
//   const htmlContent = `
//           <!DOCTYPE html>
//           <html>
//           <head>
//             <title>Data Export</title>
//             <style>
//               body { font-family: Arial, sans-serif; margin: 20px; }
//               table { border-collapse: collapse; width: 100%; margin-top: 20px; }
//               th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
//               th { background-color: #f2f2f2; font-weight: bold; }
//               tr:nth-child(even) { background-color: #f9f9f9; }
//               h1 { color: #333; margin-bottom: 20px; }
//               .export-info { margin-bottom: 20px; color: #666; }
//             </style>
//           </head>
//           <body>
//             <h1>Data Export</h1>
//             <div class="export-info">
//               <p>Export Date: ${new Date().toLocaleDateString()}</p>
//               <p>Total Records: ${exportData.length}</p>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   ${exportColumns
//                     .map((col) => `<th>${col.title}</th>`)
//                     .join("")}
//                 </tr>
//               </thead>
//               <tbody>
//                 ${exportData
//                   .map(
//                     (row) =>
//                       `<tr>${exportColumns
//                         .map((col) => `<td>${row[col.field] || ""}</td>`)
//                         .join("")}</tr>`
//                   )
//                   .join("")}
//               </tbody>
//             </table>
//           </body>
//           </html>
//         `;

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();

//   setTimeout(() => {
//     printWindow.print();
//     printWindow.close();
//   }, 250);
// }

// export const generateAndUploadInvoice = async (
//   invoiceObject: any,
//   invoiceId: string
// ): Promise<string> => {
//   try {
//     const pdf = new jsPDF("p", "pt", "a4");

//     // Header
//     pdf.setFontSize(18);
//     pdf.text("Invoice", 40, 50);

//     pdf.setFontSize(12);
//     pdf.text(`Invoice ID: ${invoiceId}`, 40, 70);
//     pdf.text(`Date: ${new Date().toLocaleDateString()}`, 40, 90);

//     // Business Info
//     pdf.text(invoiceObject?.businessInfo?.name, 350, 70);
//     // pdf.text(invoiceObject?.businessInfo?.address, 350, 85);
//     pdf.text(invoiceObject?.businessInfo?.phone, 350, 100);

//     // Customer Info
//     pdf.setFontSize(14);
//     pdf.text("Bill To:", 40, 130);
//     pdf.setFontSize(12);
//     pdf.text(invoiceObject?.customer?.name, 40, 150);

//     // Items Table
//     autoTable(pdf, {
//       startY: 210,
//       head: [["Item", "Quantity", "Price", "Total"]],
//       // body: invoiceObject?.items?.map((item: any) => [
//       //   item.name,
//       //   item.quantity,
//       //   item.price.toFixed(2),
//       //   (item.price * item.quantity).toFixed(2),
//       // ]),
//     });

//     // Totals
//     const finalY = (pdf as any).lastAutoTable.finalY || 210;
//     pdf.setFontSize(12);
//     pdf.text(
//       `Subtotal: ${invoiceObject?.totals?.subtotal?.toFixed(2)}`,
//       350,
//       finalY + 30
//     );
//     pdf.text(
//       `GST: ${invoiceObject?.totals?.gst?.toFixed(2)}`,
//       350,
//       finalY + 50
//     );
//     pdf.setFontSize(14);
//     pdf.text(
//       `Total: ${invoiceObject?.totals?.grandTotal?.toFixed(2)}`,
//       350,
//       finalY + 80
//     );

//     // Signature
//     pdf.setFontSize(10);
//     pdf.text("Thank you for your business!", 40, finalY + 120);

//     // Convert to Blob
//     const pdfBlob = pdf.output("blob");

//     // Upload to Firebase
//     const storageRef = ref(storage, `invoices/${invoiceId}.pdf`);
//     const snapshot = await uploadBytes(storageRef, pdfBlob);
//     const downloadURL = await getDownloadURL(snapshot.ref);

//     console.log(
//       "Invoice PDF uploaded successfully. Download URL:",
//       downloadURL
//     );

//     return downloadURL;
//   } catch (error) {
//     console.error("Error generating or uploading invoice PDF:", error);
//     throw new Error("Invoice PDF generation and upload failed");
//   }
// };

/**
 * Generates an HTML invoice from the invoice object and uploads it to Firebase Storage
 * @param invoiceObject - The invoice data object
 * @param invoiceId - Unique identifier for the invoice
 * @returns Promise<string> - The download URL of the uploaded invoice
 */
export const generateAndUploadInvoice = async (
  invoiceObject: any,
  invoiceId: string,
  type: string
): Promise<string> => {
  try {
    // Generate HTML content for the invoice
    const htmlContent =
      type === "table"
        ? generateInvoiceHTMLRestaurant(invoiceObject)
        : generateInvoiceHTML(invoiceObject);

    // Create a temporary element to render the HTML
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const invoiceElement = document.getElementById("invoice");
    if (!invoiceElement) {
      throw new Error("Invoice element not found");
    }

    const canvas = await html2canvas(invoiceElement, {
      scale: window.devicePixelRatio,
      backgroundColor: "#fff",
      useCORS: true,
    });
    document.body.removeChild(container);

    const imgData = canvas.toDataURL("image/jpeg", 0.5);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
      compress: true,
    });

    const imageProperties = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight =
      (imageProperties.height * pdfWidth) / imageProperties.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");

    // Create a reference to Firebase Storage
    const folderName = type === "table" ? "tables" : "rooms";
    const storageRef = ref(storage, `invoices/${folderName}/${invoiceId}.pdf`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, pdfBlob);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(
      "Invoice PDF uploaded successfully. Download URL:",
      downloadURL
    );

    return downloadURL;
  } catch (error) {
    console.error("Error generating or uploading invoice PDF:", error);
    throw new Error("Invoice PDF generation and upload failed");
  }
};

/**
 * Generates HTML content for the invoice
 * @param invoice - The invoice data object
 * @returns string - HTML content
 */
const generateInvoiceHTML = (invoice: any): string => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tax Invoice - ${invoice?.business?.invoiceNo || "N/A"}</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      font-size: 12px;
      line-height: 1.4;
      background-color: #f5f5f5;
    "
  >
    <style>
      @media print {
      @page {
        size: A4;
        margin: 0;
      }
        body {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 12px !important;
        }
        
      }
      
    </style>
    <div
      id="invoice"
      class="invoice-container"
      style="
        width: 210mm;
        box-sizing: border-box;
        margin: 0 auto;
        background: white;
        padding: 20px;
        
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <!-- Header -->
      <div class="invoice-content" style="padding: 1.5rem">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h1
            style="
              font-size: 1.25rem;
              line-height: 1.75rem;
              font-weight: 700;
              margin: 0;
            "
          >
            TAX INVOICE
          </h1>
          <div style="width: 3rem; height: 3.75rem">
            <svg width="100%" height="100%" viewBox="0 0 141 199" fill="none" xmlns="http://www.w3.org/2000/svg" style="object-fit: contain">
              <path d="M72.9215 186.615C75.9823 188.668 78.6241 188.373 81.5406 186.68C96.7335 177.863 111.991 169.136 127.263 160.428C129.385 159.218 130.269 157.694 130.263 155.439C130.171 120.93 130.099 86.4204 130.15 51.9111C130.155 48.6016 127.953 47.009 125.471 45.4189C113.323 37.6369 101.149 29.8871 88.9811 22.1294C85.3201 19.7952 81.6815 17.4311 77.9735 15.1583C75.5694 13.6849 74.2893 14.37 74.2921 16.9715C74.3131 36.4202 74.3516 55.8688 74.3419 75.3174C74.3408 77.4456 75.5982 78.5973 77.5971 79.2969C87.3143 82.6974 96.6428 86.9761 106.62 89.7692C108.544 90.3079 109.139 91.0821 109.139 92.7275C109.134 112.769 109.127 132.811 109.226 152.852C109.24 155.64 107.527 155.839 105.175 155.839C88.1283 155.838 71.0808 155.806 54.0349 155.928C37.1272 156.05 20.2126 155.508 3.3133 156.269C0.101526 156.414 0.381838 154.527 0.36987 152.764C0.297369 142.092 0.246178 131.419 0.220438 120.747C0.161805 96.4366 0.179365 72.1259 0.000319452 47.8162C-0.0215122 44.8525 1.07421 43.075 3.72907 41.4054C25.0324 28.008 46.2943 14.5558 67.4241 0.939704C70.3376 -0.937762 71.9546 0.368219 73.9932 1.64768C94.1275 14.2841 114.146 27.0737 134.485 39.4388C138.885 42.1136 140.282 44.8277 140.284 49.4693C140.306 85.8708 140.612 122.273 140.999 158.673C141.036 162.168 139.904 164.156 136.498 166.044C117.732 176.448 99.1281 187.089 80.5508 197.765C77.6987 199.403 75.5771 199.463 72.7412 197.634C59.8719 189.334 46.8477 181.227 33.86 173.076C32.5946 172.281 31.6784 171.432 31.7118 169.926C31.7686 167.365 31.7274 164.802 31.7274 160.922C46.0184 169.837 59.3481 178.153 72.9215 186.615ZM43.2231 69.3664C41.8671 70.8687 40.9213 72.4568 40.9257 74.512C40.976 97.6308 40.9827 120.75 40.9643 143.868C40.9621 146.569 42.3782 147.777 45.3125 147.752C49.9357 147.712 54.56 147.643 59.1824 147.693C62.7499 147.732 64.2226 146.053 64.2117 143.074C64.1961 138.81 64.0818 134.548 64.0636 130.284C63.9439 102.31 63.836 74.3345 63.7303 46.3595C63.699 38.0609 63.702 29.7622 63.6524 21.4637C63.6441 20.0733 64.0165 18.3743 62.3782 17.5883C60.8843 16.8716 59.7152 18.1972 58.4734 18.7854C57.8916 19.0609 57.3425 19.3983 56.803 19.7389C42.3278 28.8776 27.8753 38.0454 13.3638 47.1375C10.9538 48.6475 10.0156 50.4534 10.0321 53.1052C10.1427 70.8794 10.1743 88.652 10.5785 106.426C10.8615 118.868 10.5935 131.32 10.6035 143.768C10.6069 148.04 11.1038 148.435 15.878 148.245C18.7787 148.13 21.6758 147.908 24.5774 147.853C30.7887 147.735 30.9744 147.636 30.9337 141.948C30.7614 117.886 30.5969 93.8244 30.3181 69.7635C30.2874 67.1165 31.1311 65.3943 33.663 63.8897C39.7153 60.2932 45.4612 56.2809 51.5202 52.6943C54.2937 51.0526 56.5739 48.5667 60.0381 47.8813C61.3518 49.4654 60.5975 51.0605 60.8507 52.5268C61.5408 56.5231 59.8026 59.1263 55.8714 61.1901C51.5638 63.4515 47.6721 66.3508 43.2231 69.3664ZM74.7563 124.967C74.7687 131.352 74.796 137.738 74.7859 144.123C74.782 146.613 75.9894 147.79 78.8789 147.724C84.0235 147.606 89.1726 147.64 94.3199 147.625C97.551 147.615 99.1685 146.268 99.1601 143.28C99.1192 128.829 99.0978 114.379 99.1596 99.929C99.1686 97.8128 98.1756 96.6768 96.0975 95.915C90.3587 93.8111 84.69 91.552 78.9341 89.4878C75.4894 88.2525 74.3243 88.9869 74.3515 92.3789C74.437 103.035 74.0417 113.697 74.7563 124.967Z" fill="black"/>
            </svg>
          </div>
          <div>
            <div
              style="font-size: 0.75rem; line-height: 1rem; font-weight: 700"
            >
              ${(invoice?.business?.name || "BUSINESS NAME").toUpperCase()}
            </div>
            <div
              style="font-size: 0.75rem; line-height: 1rem; margin-top: 0.25rem"
            >
              ${invoice?.business?.address || "Business Address"}
              <br />
              Email: ${invoice?.business?.email || "N/A"}
              <br />
              Phone: ${invoice?.business?.phone || "N/A"}
            </div>
          </div>
        </div>

        <!-- Business and Invoice Details -->
        <div
          style="
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 0.75rem 0;
          "
        >
          <div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >Booking ID</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.bookingId || "N/A"}
              </span>
            </div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >Invoice No.</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.invoiceNo || "N/A"}
              </span>
            </div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >Date</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.date || currentDate}
              </span>
            </div>
          </div>
          <div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >PAN</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.pan || "N/A"}
              </span>
            </div>

            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >GSTIN</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.gst || "N/A"}
              </span>
            </div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >CIN</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.cin || "N/A"}
              </span>
            </div>
          </div>
          <div></div>
        </div>

        <div style="border-top: 1px dotted #000; margin: 0.5rem 0"></div>

        <!-- Customer Information -->
        <div>
          <div style="font-size: 0.75rem; line-height: 1rem; color: #666">
            Customer Name
          </div>
          <div
            style="font-size: 0.875rem; line-height: 1.25rem; font-weight: 700"
          >
            ${invoice?.customer?.name || "N/A"}
          </div>
        </div>

        <div style="border-top: 1px dotted #000; margin: 0.5rem 0"></div>

        <!-- Stay Details -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
          "
        >
          <div>
            <div style="font-size: 0.75rem; line-height: 1rem; color: #666">
              Check-in
            </div>
            <div
              style="
                font-size: 0.875rem;
                line-height: 1.25rem;
                font-weight: 700;
              "
            >
              ${invoice?.stayDetails?.checkIn || "N/A"}
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; line-height: 1rem; color: #666">
              Check-out
            </div>
            <div
              style="
                font-size: 0.875rem;
                line-height: 1.25rem;
                font-weight: 700;
              "
            >
              ${invoice?.stayDetails?.checkOut || "N/A"}
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; line-height: 1rem; color: #666">
              Nights
            </div>
            <div
              style="
                font-size: 0.875rem;
                line-height: 1.25rem;
                font-weight: 700;
              "
            >
              ${invoice?.stayDetails?.nights || "N/A"}
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; line-height: 1rem; color: #666">
              Guests
            </div>
            <div
              style="
                font-size: 0.875rem;
                line-height: 1.25rem;
                font-weight: 700;
              "
            >
              ${invoice?.stayDetails?.noOfGuests || "N/A"}
            </div>
          </div>
        </div>

        <!-- Payment Breakup -->
        <div
          style="
            margin: 1rem 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.25rem;
          "
        >
          <div style="border-top: 2px dotted #000; flex: 1"></div>
          <div
            style="
              font-size: 0.875rem;
              line-height: 1.25rem;
              font-weight: 700;
              white-space: nowrap;
            "
          >
            PAYMENT BREAKUP
          </div>
          <div style="border-top: 2px dotted #000; flex: 1"></div>
        </div>

        <!-- Payment Details Table -->
        <div
          style="
            border: 1px solid #000;
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 0.5rem 0;
          "
        >
          <table style="width: 100%; border-collapse: collapse">
            <tbody>
              ${generatePaymentRows(invoice)}
            </tbody>

            <tfoot style="border-top: 1px solid #000">
              <tr>
                <td
                  colspan="3"
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                    padding: 0.5rem 0 0 0;
                  "
                >
                  Sub Total
                </td>
                <td
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                    text-align: right;
                    padding: 0.5rem 0 0 0;
                  "
                >
                  ₹ ${invoice?.totals?.subtotal?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr>
                <td
                  colspan="3"
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                  "
                >
                  Total GST
                </td>
                <td
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                    text-align: right;
                  "
                >
                  ₹ ${invoice?.totals?.gst?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr style="font-size: 1rem; font-weight: 700;">
                <td colspan="3" style="padding: 0.5rem 0">Grand Total</td>
                <td style="text-align: right; padding: 0.5rem 0">₹ ${
                  invoice?.totals?.grandTotal || "0.00"
                }</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Terms & Conditions -->
        <div style="text-align: center; margin: 30px 0">
          <div
            style="
              display: inline-block;
              padding: 5px 15px;
              border-top: 1px dotted #666;
              border-bottom: 1px dotted #666;
              font-weight: bold;
              font-size: 10px;
            "
          >
            TERMS & CONDITIONS
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

/**
 * Generates payment rows for the invoice table
 * @param invoice - The invoice data object
 * @returns string - HTML table rows
 */
const generatePaymentRows = (invoice: any): string => {
  let rows = "";

  // Accommodation Charges
  if (invoice?.billItems?.booking) {
    rows += `
      <tr>
        <td style="font-size: 1rem; line-height: 1.5rem; font-weight: 700; padding: 0.5rem 0" colspan="2">Accommodation Charges</td>
        <td style="padding: 0.5rem 0"; font-size:0.2rem>${
          invoice.business?.bookingId || ""
        }</td>
        <td style="font-size: 0.875rem; line-height: 1.25rem; text-align: right; font-weight: 700; padding: 0.5rem 0">₹ ${
          invoice.billItems.booking.price?.toFixed(2) || "0.00"
        }</td>
      </tr>`;
    if (
      invoice.billItems.booking.discount.length > 0 &&
      invoice.billItems.booking.discount[0].discount > 0
    ) {
      invoice.billItems.booking.discount.forEach((item: any) => {
        rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; " colspan="2">Discount ${
            item.amount
          }</td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;"> ${
            item.code
          }</td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ -${
            item.discount || "0.00"
          }</td>
        </tr>`;
      });
    }
    if (invoice.billItems.booking.gst?.cgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">CGST (${
            invoice.billItems.booking.gst.cgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.booking.gst.cgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
    if (invoice.billItems.booking.gst?.sgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">SGST (${
            invoice.billItems.booking.gst.sgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.booking.gst.sgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
    if (invoice.billItems.booking.discount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; color: #dc2626;" colspan="2">Discount</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right; color: #dc2626;">₹ -${
            invoice.billItems.booking.discount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
  }

  // Food & Beverages
  if (invoice?.billItems?.diningOrders) {
    rows += `
      <tr>
        <td style="font-size: 1rem; line-height: 1.5rem; font-weight: 700; padding: 0.5rem 0" colspan="2">Food & Beverages</td>
        <td style="padding: 0.5rem 0"></td>
        <td style="font-size: 0.875rem; line-height: 1.25rem; text-align: right; font-weight: 700; padding: 0.5rem 0">₹ ${
          invoice.billItems.diningOrders.subtotal?.toFixed(2) || "0.00"
        }</td>
      </tr>`;
    if (invoice.billItems.diningOrders.gst?.cgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">CGST (${
            invoice.billItems.diningOrders.gst.cgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.diningOrders.gst.cgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
    if (invoice.billItems.diningOrders.gst?.sgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">SGST (${
            invoice.billItems.diningOrders.gst.sgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.diningOrders.gst.sgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
  }

  // Services
  if (invoice?.billItems?.services) {
    rows += `
      <tr>
        <td style="font-size: 1rem; line-height: 1.5rem; font-weight: 700; padding: 0.5rem 0" colspan="2">Services</td>
        <td style="padding: 0.5rem 0"></td>
        <td style="font-size: 0.875rem; line-height: 1.25rem; text-align: right; font-weight: 700; padding: 0.5rem 0">₹ ${
          invoice.billItems.services.subtotal?.toFixed(2) || "0.00"
        }</td>
      </tr>`;
    if (invoice.billItems.services.gst?.cgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">CGST (${
            invoice.billItems.services.gst.cgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.services.gst.cgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
    if (invoice.billItems.services.gst?.sgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">SGST (${
            invoice.billItems.services.gst.sgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.services.gst.sgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
  }

  // Mini Bar/Checklist
  if (invoice?.billItems?.checklist?.totalPrice > 0) {
    rows += `
      <tr>
        <td style="font-size: 1rem; line-height: 1.5rem; font-weight: 700; padding: 0.5rem 0" colspan="2">Mini Bar</td>
        <td style="padding: 0.5rem 0"></td>
        <td style="font-size: 0.875rem; line-height: 1.25rem; text-align: right; font-weight: 700; padding: 0.5rem 0">₹ ${
          invoice.billItems.checklist.subtotal?.toFixed(2) || "0.00"
        }</td>
      </tr>`;
    if (invoice.billItems.checklist.gst?.cgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">CGST (${
            invoice.billItems.checklist.gst.cgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.checklist.gst.cgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
    if (invoice.billItems.checklist.gst?.sgstAmount > 0) {
      rows += `
        <tr>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700;" colspan="2">SGST (${
            invoice.billItems.checklist.gst.sgstPercentage
          }%)</td>
          <td></td>
          <td style="font-size: 0.75rem; line-height: 1rem; font-weight: 700; text-align: right;">₹ ${
            invoice.billItems.checklist.gst.sgstAmount?.toFixed(2) || "0.00"
          }</td>
        </tr>`;
    }
  }

  return rows;
};
/**
 * Generates HTML content for the invoice
 * @param invoice - The invoice data object
 * @returns string - HTML content
 */
const generateInvoiceHTMLRestaurant = (invoice: any): string => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tax Invoice - ${invoice?.business?.invoiceNo || "N/A"}</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      font-size: 12px;
      line-height: 1.4;
      background-color: #f5f5f5;
    "
  >
    <style>
      @media print {
      @page {
        size: A4;
        margin: 0;
      }
        body {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 12px !important;
        }
        
      }
      
    </style>
    <div
      id="invoice"
      class="invoice-container"
      style="
        width: 210mm;
        box-sizing: border-box;
        margin: 0 auto;
        background: white;
        padding: 20px;
        
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <!-- Header -->
      <div class="invoice-content" style="padding: 1.5rem">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h1
            style="
              font-size: 1.25rem;
              line-height: 1.75rem;
              font-weight: 700;
              margin: 0;
            "
          >
            TAX INVOICE
          </h1>
          <div style="width: 3rem; height: 3.75rem">
            <svg width="100%" height="100%" viewBox="0 0 141 199" fill="none" xmlns="http://www.w3.org/2000/svg" style="object-fit: contain">
              <path d="M72.9215 186.615C75.9823 188.668 78.6241 188.373 81.5406 186.68C96.7335 177.863 111.991 169.136 127.263 160.428C129.385 159.218 130.269 157.694 130.263 155.439C130.171 120.93 130.099 86.4204 130.15 51.9111C130.155 48.6016 127.953 47.009 125.471 45.4189C113.323 37.6369 101.149 29.8871 88.9811 22.1294C85.3201 19.7952 81.6815 17.4311 77.9735 15.1583C75.5694 13.6849 74.2893 14.37 74.2921 16.9715C74.3131 36.4202 74.3516 55.8688 74.3419 75.3174C74.3408 77.4456 75.5982 78.5973 77.5971 79.2969C87.3143 82.6974 96.6428 86.9761 106.62 89.7692C108.544 90.3079 109.139 91.0821 109.139 92.7275C109.134 112.769 109.127 132.811 109.226 152.852C109.24 155.64 107.527 155.839 105.175 155.839C88.1283 155.838 71.0808 155.806 54.0349 155.928C37.1272 156.05 20.2126 155.508 3.3133 156.269C0.101526 156.414 0.381838 154.527 0.36987 152.764C0.297369 142.092 0.246178 131.419 0.220438 120.747C0.161805 96.4366 0.179365 72.1259 0.000319452 47.8162C-0.0215122 44.8525 1.07421 43.075 3.72907 41.4054C25.0324 28.008 46.2943 14.5558 67.4241 0.939704C70.3376 -0.937762 71.9546 0.368219 73.9932 1.64768C94.1275 14.2841 114.146 27.0737 134.485 39.4388C138.885 42.1136 140.282 44.8277 140.284 49.4693C140.306 85.8708 140.612 122.273 140.999 158.673C141.036 162.168 139.904 164.156 136.498 166.044C117.732 176.448 99.1281 187.089 80.5508 197.765C77.6987 199.403 75.5771 199.463 72.7412 197.634C59.8719 189.334 46.8477 181.227 33.86 173.076C32.5946 172.281 31.6784 171.432 31.7118 169.926C31.7686 167.365 31.7274 164.802 31.7274 160.922C46.0184 169.837 59.3481 178.153 72.9215 186.615ZM43.2231 69.3664C41.8671 70.8687 40.9213 72.4568 40.9257 74.512C40.976 97.6308 40.9827 120.75 40.9643 143.868C40.9621 146.569 42.3782 147.777 45.3125 147.752C49.9357 147.712 54.56 147.643 59.1824 147.693C62.7499 147.732 64.2226 146.053 64.2117 143.074C64.1961 138.81 64.0818 134.548 64.0636 130.284C63.9439 102.31 63.836 74.3345 63.7303 46.3595C63.699 38.0609 63.702 29.7622 63.6524 21.4637C63.6441 20.0733 64.0165 18.3743 62.3782 17.5883C60.8843 16.8716 59.7152 18.1972 58.4734 18.7854C57.8916 19.0609 57.3425 19.3983 56.803 19.7389C42.3278 28.8776 27.8753 38.0454 13.3638 47.1375C10.9538 48.6475 10.0156 50.4534 10.0321 53.1052C10.1427 70.8794 10.1743 88.652 10.5785 106.426C10.8615 118.868 10.5935 131.32 10.6035 143.768C10.6069 148.04 11.1038 148.435 15.878 148.245C18.7787 148.13 21.6758 147.908 24.5774 147.853C30.7887 147.735 30.9744 147.636 30.9337 141.948C30.7614 117.886 30.5969 93.8244 30.3181 69.7635C30.2874 67.1165 31.1311 65.3943 33.663 63.8897C39.7153 60.2932 45.4612 56.2809 51.5202 52.6943C54.2937 51.0526 56.5739 48.5667 60.0381 47.8813C61.3518 49.4654 60.5975 51.0605 60.8507 52.5268C61.5408 56.5231 59.8026 59.1263 55.8714 61.1901C51.5638 63.4515 47.6721 66.3508 43.2231 69.3664ZM74.7563 124.967C74.7687 131.352 74.796 137.738 74.7859 144.123C74.782 146.613 75.9894 147.79 78.8789 147.724C84.0235 147.606 89.1726 147.64 94.3199 147.625C97.551 147.615 99.1685 146.268 99.1601 143.28C99.1192 128.829 99.0978 114.379 99.1596 99.929C99.1686 97.8128 98.1756 96.6768 96.0975 95.915C90.3587 93.8111 84.69 91.552 78.9341 89.4878C75.4894 88.2525 74.3243 88.9869 74.3515 92.3789C74.437 103.035 74.0417 113.697 74.7563 124.967Z" fill="black"/>
            </svg>
          </div>
          <div>
            <div
              style="font-size: 0.75rem; line-height: 1rem; font-weight: 700"
            >
              ${(invoice?.business?.name || "BUSINESS NAME").toUpperCase()}
            </div>
            <div
              style="font-size: 0.75rem; line-height: 1rem; margin-top: 0.25rem"
            >
              ${invoice?.business?.address || "Business Address"}
              <br />
              Email: ${invoice?.business?.email || "N/A"}
              <br />
              Phone: ${invoice?.business?.phone || "N/A"}
            </div>
          </div>
        </div>

        <!-- Business and Invoice Details -->
        <div
          style="
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 0.75rem 0;
          "
        >
          <div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >Invoice No.</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.invoiceNo || "N/A"}
              </span>
            </div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >Date</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.date || currentDate}
              </span>
            </div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >PAN</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.pan || "N/A"}
              </span>
            </div>
          </div>
          <div>
            

            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >GSTIN</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.gst || "N/A"}
              </span>
            </div>
            <div style="margin-bottom: 0.5rem">
              <span style="font-size: 0.75rem; line-height: 1rem; color: #666"
                >CIN</span
              >
              <br />
              <span
                style="
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                  font-weight: 700;
                "
              >
                ${invoice?.business?.cin || "N/A"}
              </span>
            </div>
          </div>
          <div></div>
        </div>

        <div style="border-top: 1px dotted #000; margin: 0.5rem 0"></div>

        <!-- Customer Information -->
        <div>
          <div style="font-size: 0.75rem; line-height: 1rem; color: #666">
            Customer Name
          </div>
          <div
            style="font-size: 0.875rem; line-height: 1.25rem; font-weight: 700"
          >
            ${invoice?.customer?.name || "N/A"}
          </div>
        </div>


        <!-- Payment Breakup -->
        <div
          style="
            margin: 1rem 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.25rem;
          "
        >
          <div style="border-top: 2px dotted #000; flex: 1"></div>
          <div
            style="
              font-size: 0.875rem;
              line-height: 1.25rem;
              font-weight: 700;
              white-space: nowrap;
            "
          >
            PAYMENT BREAKUP
          </div>
          <div style="border-top: 2px dotted #000; flex: 1"></div>
        </div>

        <!-- Payment Details Table -->
        <div
          style="
            border: 1px solid #000;
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 0.5rem 0;
          "
        >
          <table style="width: 100%; border-collapse: collapse">
            <tbody>
              ${generatePaymentRowsRestaurant(invoice)}
            </tbody>

            <tfoot style="border-top: 1px solid #000">
              <tr>
                <td
                  colspan="4"
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                    padding: 0.5rem 0 0 0;
                  "
                >
                  Sub Total
                </td>
                <td
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                    text-align: right;
                    padding: 0.5rem 0 0 0;
                  "
                >
                  ₹ ${invoice?.totals?.subtotal?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr>
                <td
                  colspan="4"
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                  "
                >
                  Total GST
                </td>
                <td
                  style="
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    font-weight: 700;
                    text-align: right;
                  "
                >
                  ₹ ${invoice?.totals?.gst?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr style="font-size: 1rem; font-weight: 700;">
                <td colspan="4" style="padding: 0.5rem 0">Grand Total</td>
                <td style="text-align: right; padding: 0.5rem 0">₹ ${
                  invoice?.totals?.grandTotal || "0.00"
                }</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Terms & Conditions -->
        <div style="text-align: center; margin: 30px 0">
          <div
            style="
              display: inline-block;
              padding: 5px 15px;
              border-top: 1px dotted #666;
              border-bottom: 1px dotted #666;
              font-weight: bold;
              font-size: 10px;
            "
          >
            TERMS & CONDITIONS
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

/**
 * Generates payment rows for the invoice table
 * @param invoice - The invoice data object
 * @returns string - HTML table rows
 */
const generatePaymentRowsRestaurant = (invoice: any): string => {
  let rows = "";

  // Food & Beverages
  if (invoice?.billItems?.diningOrders?.items?.length > 0) {
    rows += ` <tr>
        <td style="font-size: 1rem; line-height: 1.5rem; font-weight: 700; padding-top: 0.5rem " colspan="2">Item</td>
        <td style="padding-top: 0.5rem; text-align: right">Count</td>
        <td style="padding-top: 0.5rem; text-align: right">Price</td>
        <td style="font-size: 0.875rem; line-height: 1.25rem; text-align: right; font-weight: 700; padding-top: 0.5rem ">Amount</td>
      </tr>
    `;
    invoice?.billItems?.diningOrders?.items?.forEach((item: any) => {
      rows += `
      <tr>
        <td style="font-size: 1rem; line-height: 1.5rem; font-weight: 700; padding-top: 0.5rem " colspan="2">${
          item.name
        }</td>
        <td style="padding-top: 0.5rem; text-align: right">${item.count}</td>
        <td style="padding-top: 0.5rem; text-align: right">${item.price}</td>
        <td style="font-size: 0.875rem; line-height: 1.25rem; text-align: right; font-weight: 700; padding-top: 0.5rem ">₹ ${
          item.count * item.price || "0.00"
        }</td>
      </tr>`;
    });
  }

  return rows;
};

/**
 * Helper function to process finalSubmitData and generate invoice
 * @param finalSubmitData - The final submit data containing invoice object
 * @returns Promise<string> - The download URL of the uploaded invoice
 */
export const processAndUploadInvoice = async (
  invoiceObject: any,
  type: string
): Promise<string> => {
  try {
    if (!invoiceObject) {
      throw new Error("No invoice object found");
    }

    // Generate unique invoice ID
    const invoiceId = invoiceObject?.business?.invoiceNo || `INV-${Date.now()}`;

    // Generate and upload the invoice
    const downloadURL = await generateAndUploadInvoice(
      invoiceObject,
      invoiceId,
      type
    );

    return downloadURL;
  } catch (error) {
    console.error("Error processing and uploading invoice:", error);
    throw error;
  }
};
