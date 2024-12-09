"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HotelRoomTransctions from "./HotelRoomTransctions";

const Transactions = ({ data, room }: { data: any; room: any }) => {
  console.log("first", data, room);
  const [expandedCategory, setExpandedCategory] = useState<any>(null);
  const [historyFlag, setHistoryFlag] = useState<boolean>(false);

  // Sample room data - in real app this would come from props or API
  //   const roomCategories = [
  //     {
  //       category: "Deluxe Room",
  //       price: "₹5,000",
  //       description: "Spacious room with city view",
  //       rooms: [
  //         { number: "101", status: "occupied" },
  //         { number: "102", status: "available" },
  //         { number: "103", status: "maintenance" },
  //         { number: "104", status: "occupied" },
  //       ],
  //     },
  //     {
  //       category: "Super Deluxe",
  //       price: "₹7,500",
  //       description: "Premium room with balcony",
  //       rooms: [
  //         { number: "201", status: "occupied" },
  //         { number: "202", status: "occupied" },
  //         { number: "203", status: "available" },
  //       ],
  //     },
  //     {
  //       category: "Suite",
  //       price: "₹12,000",
  //       description: "Luxury suite with living area",
  //       rooms: [
  //         { number: "301", status: "available" },
  //         { number: "302", status: "occupied" },
  //       ],
  //     },
  //   ];

  const onRoomSelect = (roomNo: string) => {
    console.log(roomNo);
    setHistoryFlag(true);
  };
  return (
    <div className="max-w-4xl  p-6 space-y-4">
      {!historyFlag &&
        data.rooms.map((category: any, index: number) => (
          <Card key={index} className="shadow-sm">
            <div
              className="cursor-pointer"
              onClick={() =>
                setExpandedCategory(expandedCategory === index ? null : index)
              }
            >
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {category.roomType}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">₹{category.price}</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        expandedCategory === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>
            </div>

            {expandedCategory === index && (
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.roomNo.map((room: any, roomIndex: number) => (
                    <button
                      key={roomIndex}
                      onClick={() => onRoomSelect(room)}
                      className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-left space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Room {room}</span>
                        <Badge className={`capitalize ${room}`}>{room}</Badge>
                      </div>
                      <div className="text-sm text-blue-600 hover:text-blue-800">
                        View Transactions →
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      {historyFlag && <HotelRoomTransctions />}
    </div>
  );
};

export default Transactions;
