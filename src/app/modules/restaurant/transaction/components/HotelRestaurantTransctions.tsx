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
import { format } from "date-fns";
const HotelRestaurantTransctions = ({ data }: any) => {
  console.log("data", data);
  // Sample transactions data

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
                {data.data.length > 0 &&
                  data.data
                    .filter(
                      (table: any) =>
                        table.diningDetails.location === data.table
                    )
                    .map((item: any) => {
                      return item.transctions.map(
                        (transaction: any, idx: number) => (
                          <TableRow key={idx} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {format(
                                new Date(transaction.payment.timeOfTransaction),
                                "HH:mm (d MMM)"
                              )}
                            </TableCell>
                            <TableCell>{transaction.location}</TableCell>
                            <TableCell>{transaction.against}</TableCell>
                            <TableCell>{transaction.attendant}</TableCell>
                            <TableCell>{transaction.orderId}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {transaction.payment.paymentId}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {transaction.payment.mode}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {transaction.payment.timeOfTransaction.toLocaleString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {transaction.payment.discount.code}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {transaction.payment.discount.amount}% off
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{transaction.payment.price}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{transaction.payment.priceAfterDiscount}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.payment.paymentStatus ===
                                  "complete"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {transaction.payment.paymentStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelRestaurantTransctions;
