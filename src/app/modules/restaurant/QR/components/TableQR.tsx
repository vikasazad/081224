"use client";

import React, { useState } from "react";
import { SignJWT } from "jose";
import { Copy, Eye, EyeOff, Download } from "lucide-react";
import QRCode from "qrcode";
import JSZip from "jszip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TableQR = ({ data, user }: any) => {
  console.log("==============", data);
  const sortedData = data
    .map((item: any) => item.tableNo)
    .sort((a: any, b: any) => a - b);
  const [secretKey, setSecretKey] = useState("");
  const [tokens, setTokens] = useState<{ table: string; token: string }[]>([]);
  const [showSecret, setShowSecret] = useState(false);

  const generateTokens = async () => {
    if (!secretKey) {
      alert("Please enter a secret key");
      return;
    }

    const encodedSecretKey = new TextEncoder().encode(secretKey);
    const newTokens = await Promise.all(
      data.map(async (tableData: any) => {
        const payload = {
          email: user,
          tableNo: tableData.tableNo,
          capacity: tableData.capacity,
          phone: "",
          tag: "restaurant",
        };
        const token = await new SignJWT(payload)
          .setProtectedHeader({ alg: "HS256" })
          .sign(encodedSecretKey);
        return { table: tableData.tableNo, token };
      })
    );
    // Sort tokens by table number in ascending order
    const sortedTokens = newTokens.sort((a, b) => {
      const tableA = typeof a.table === "string" ? parseInt(a.table) : a.table;
      const tableB = typeof b.table === "string" ? parseInt(b.table) : b.table;
      return tableA - tableB;
    });
    setTokens(sortedTokens);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQRCode = async (url: string, tableNumber: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
      });

      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `table-${tableNumber}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code");
    }
  };

  const downloadAllQRCodes = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder("table-qr-codes");

      for (const { table, token } of tokens) {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL_FOR_FOOD}${token}`;
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
        });

        const base64Data = qrCodeDataUrl.split(",")[1];
        folder?.file(`table-${table}-qr.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "table-qr-codes.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR codes:", error);
      alert("Failed to generate QR codes");
    }
  };

  return (
    <Card className="max-w-4xl mx-8 my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Table QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR codes for your restaurant tables to enable customer
          ordering.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data || data.length === 0 ? (
          <Alert variant="destructive">
            <AlertTitle>No Table Information</AlertTitle>
            <AlertDescription>
              Please add table information in the Table section before
              generating QR codes.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-2">Tables:</h3>
              <div className="flex flex-wrap gap-2">
                {sortedData.join(", ")}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="secretKey" className="text-sm font-medium">
                Secret Key:
              </label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecret ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your secret key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={generateTokens} className="w-full">
              Generate QR Codes
            </Button>

            {tokens.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated QR Codes:</h3>
                  <Button
                    variant="outline"
                    onClick={downloadAllQRCodes}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                </div>
                {tokens.map(({ table, token }) => (
                  <div
                    key={table}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="font-medium min-w-[100px]">
                      Table {table}:
                    </span>
                    <code className="bg-muted p-2 rounded flex-1 break-all text-xs">
                      {`${process.env.NEXT_PUBLIC_BASE_URL_FOR_FOOD}${token}`}
                    </code>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            `${process.env.NEXT_PUBLIC_BASE_URL_FOR_FOOD}${token}`
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          downloadQRCode(
                            `${process.env.NEXT_PUBLIC_BASE_URL_FOR_FOOD}${token}`,
                            table
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TableQR;
