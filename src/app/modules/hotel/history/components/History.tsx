"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HotelRoomHistory from "./HotelRoomHistory";

const History = ({ data, room }: { data: any; room: any }) => {
  console.log("first", data, room);
  const [expandedCategory, setExpandedCategory] = useState<any>(null);
  const [historyFlag, setHistoryFlag] = useState<boolean>(false);

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
                        View History →
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      {historyFlag && <HotelRoomHistory />}
    </div>
  );
};

export default History;
