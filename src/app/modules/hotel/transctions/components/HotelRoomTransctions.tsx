"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const HotelRoomTransctions = () => {
  // Sample transactions data
  const transactions = [
    {
      date: "9/29/2024",
      room: "104",
      against: "SE:7889",
      attendant: "Mishra",
      orderId: "BO:123",
      mode: "online",
      paymentId: "TXN123456",
      txnTime: "3:30:00 PM",
      discCoupon: "SAVE10",
      discPercentage: 3,
      discount: 30,
      amount: 30,
      finalAmount: 27,
      status: "complete",
    },
    // Add more sample transactions as needed
    {
      date: "9/29/2024",
      room: "105",
      against: "SE:7890",
      attendant: "Singh",
      orderId: "BO:124",
      mode: "cash",
      paymentId: "TXN123457",
      txnTime: "4:15:00 PM",
      discCoupon: "SAVE15",
      discPercentage: 5,
      discount: 45,
      amount: 90,
      finalAmount: 85,
      status: "pending",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="w-full mx-4 p-2">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle className="text-xl font-semibold">
              Transactions
            </CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search transactions..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[80px]">Room</TableHead>
                  <TableHead className="w-[100px]">Against</TableHead>
                  <TableHead className="w-[100px]">Attendant</TableHead>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead className="w-[100px]">Payment</TableHead>
                  <TableHead className="w-[120px]">Time</TableHead>
                  <TableHead className="w-[100px]">Coupon</TableHead>
                  <TableHead className="w-[80px] text-right">Amount</TableHead>
                  <TableHead className="w-[80px] text-right">Final</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {transaction.date}
                    </TableCell>
                    <TableCell>{transaction.room}</TableCell>
                    <TableCell>{transaction.against}</TableCell>
                    <TableCell>{transaction.attendant}</TableCell>
                    <TableCell>{transaction.orderId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{transaction.paymentId}</span>
                        <span className="text-xs text-gray-500">
                          {transaction.mode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.txnTime}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {transaction.discCoupon}
                        </span>
                        <span className="text-xs text-gray-500">
                          {transaction.discPercentage}% off
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{transaction.amount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{transaction.finalAmount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "complete"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelRoomTransctions;
