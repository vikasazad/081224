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

const ConciergeQR = ({ data, user }: any) => {
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
      data.map(async (tableNo: any) => {
        const payload = {
          email: user,
          tableNo,
          tag: "hotel",
          tax: { gstPercentage: "" },
        };
        const token = await new SignJWT(payload)
          .setProtectedHeader({ alg: "HS256" })
          .sign(encodedSecretKey);
        return { table: tableNo, token };
      })
    );
    setTokens(newTokens);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQRCode = async (url: string, roomNumber: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `room-${roomNumber}-qr.png`;
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

      await Promise.all(
        tokens.map(async ({ table, token }) => {
          const url = `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CONCIERGE}${token}`;
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });

          // Convert base64 to blob
          const base64Data = qrDataUrl.split(",")[1];
          const blob = await fetch(`data:image/png;base64,${base64Data}`).then(
            (res) => res.blob()
          );

          zip.file(`room-${table}-qr.png`, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "room-qr-codes.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating zip file:", error);
      alert("Failed to generate zip file");
    }
  };

  return (
    <Card className="max-w-4xl mx-8 my-8">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">QR Token Generator</CardTitle>
        <CardDescription>
          Generate tokens for your tables to create QR codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <Alert variant="destructive">
            <AlertTitle>No Table Information</AlertTitle>
            <AlertDescription>
              Please fill in table information before generating QR tokens.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-2">Room Numbers:</h3>
              <p>{data.join(", ")}</p>
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
            <Button onClick={generateTokens}>Generate Tokens</Button>
            {tokens.length > 0 && (
              <>
                <Button
                  onClick={downloadAllQRCodes}
                  className="ml-2"
                  variant="secondary"
                >
                  Download All QR Codes
                </Button>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generated Tokens:</h3>
                  {tokens.map(({ table, token }) => (
                    <div
                      key={table}
                      className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium min-w-[80px]">
                        Room {table}:
                      </span>
                      <code className="bg-muted p-2 rounded w-full break-all text-sm">
                        {`${process.env.NEXT_PUBLIC_BASE_URL_FOR_CONCIERGE}${token}`}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CONCIERGE}${token}`
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          downloadQRCode(
                            `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CONCIERGE}${token}`,
                            table
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConciergeQR;
