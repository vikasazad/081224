"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Printer,
  Filter,
  Search,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { getRoomTransactionsData } from "../data/roomTransctions";
import { TransactionStatus, PaymentMethod } from "../types/roomTransctions";

const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case "posted":
      return "bg-emerald-100 text-emerald-700";
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatPaymentMethod = (method: PaymentMethod) => {
  switch (method) {
    case "account":
      return "Account";
    case "room_charge":
      return "Room Charge";
    case "cash":
      return "Cash";
    case "card":
      return "Card";
    case "online":
      return "Online";
    default:
      return method;
  }
};

const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getFolioStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-emerald-600";
    case "settled":
      return "text-blue-600";
    case "pending":
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
};

interface RoomTransactionsProps {
  roomId: string;
}

const RoomTransactions = ({ roomId }: RoomTransactionsProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const transactionsData = getRoomTransactionsData(roomId);
  const { roomInfo, guest, transactions, folioSummary, systemInfo } = transactionsData;

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.against.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.attendant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackToInventory = () => {
    router.push("/new");
  };

  const handleEmailLog = () => {
    console.log("Emailing transaction log for room:", roomId);
    console.log("Transactions:", transactions);
  };

  const handlePrintLedger = () => {
    console.log("Printing ledger for room:", roomId);
    console.log("Folio Summary:", folioSummary);
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      {/* Back Link */}
      <Button
        variant="ghost"
        className="w-fit gap-2 -ml-2"
        onClick={handleBackToInventory}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Room Transaction Log
          </p>
          <h1 className="text-3xl font-bold">
            {roomInfo.name}{" "}
            <span className="font-light text-muted-foreground">
              #{roomInfo.roomNumber}
            </span>
          </h1>
          <p className="text-sm mt-1">
            {guest.name} — Current Folio Status:{" "}
            <span className={`font-medium ${getFolioStatusColor(guest.folioStatus)}`}>
              {formatStatus(guest.folioStatus)}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleEmailLog}>
            <Mail className="h-4 w-4" />
            Email Log
          </Button>
          <Button className="gap-2" onClick={handlePrintLedger}>
            <Printer className="h-4 w-4" />
            Print Ledger
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg uppercase tracking-wider">
            Transactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Against</TableHead>
                <TableHead>Attendant</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <p className="font-medium">{txn.date}</p>
                  </TableCell>
                  <TableCell>{txn.roomNumber}</TableCell>
                  <TableCell>{txn.against}</TableCell>
                  <TableCell>{txn.attendant}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {txn.orderId}
                  </TableCell>
                  <TableCell>{formatPaymentMethod(txn.payment)}</TableCell>
                  <TableCell>{txn.time}</TableCell>
                  <TableCell>
                    {txn.couponCode ? (
                      <span className="text-blue-600 font-medium">
                        {txn.couponCode}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatUSD(txn.amount)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatUSD(txn.finalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(txn.status)}>
                      {formatStatus(txn.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Folio Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider">
                    Running Total
                  </span>
                  <span>{formatUSD(folioSummary.runningTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider">
                    Applied Coupons
                  </span>
                  <span className="text-blue-600">
                    ({formatUSD(folioSummary.appliedCoupons)})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider">
                    Taxes ({folioSummary.taxRate}%)
                  </span>
                  <span>{formatUSD(folioSummary.taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t mt-4">
                  <span className="font-semibold uppercase tracking-wider">
                    Folio Balance
                  </span>
                  <span className="text-2xl font-bold">
                    {formatUSD(folioSummary.folioBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Footer */}
      <div className="mt-auto pt-6 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>The Monolith Editorial Hotel Management — {systemInfo.version}</span>
            <span>Fiscal ID: {systemInfo.fiscalId}</span>
          </div>
          <div className="flex items-center gap-4">
            {systemInfo.isEncrypted && systemInfo.isVerified && (
              <div className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                <span>System Encrypted & Verified</span>
              </div>
            )}
            {systemInfo.folioTransmissionActive && (
              <div className="flex items-center gap-1 text-blue-600">
                <Radio className="h-4 w-4" />
                <span>Direct Folio Transmission Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTransactions;
