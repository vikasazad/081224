"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HotelRoomHistory from "./HotelRoomHistory";

const History = ({ data, room }: { data: any; room: any }) => {
  // console.log("first", data, room);
  const [expandedCategory, setExpandedCategory] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>({ room: "", data: [] });
  const [historyFlag, setHistoryFlag] = useState<boolean>(false);
  const formatKey = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Handle camelCase if needed
      .replace(/(\d+)/g, " $1 ") // Insert spaces before/after numbers
      .replace(/_/g, " ") // Replace underscores with spaces
      .toLowerCase() // Convert to lowercase
      .replace(/^\w/, (c: any) => c.toUpperCase()); // Capitalize the first letter
  };

  const onRoomSelect = (roomNo: string, type: string) => {
    const _data = room?.history;
    const info = _data[type].find(
      (el: any) => el.bookingDetails.location === roomNo
    );
    console.log(info);
    setHistoryData({
      room: roomNo,
      data: info,
    });
    setHistoryFlag(true);
  };

  return (
    <div className="max-w-4xl  p-6 space-y-4">
      {!historyFlag &&
        Object.values(data.rooms)
          .sort((a: any, b: any) => a.roomType.localeCompare(b.roomType))
          .map((el: any, index) => {
            // console.log("h1", el);

            return (
              <Card key={index} className="shadow-sm">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === index ? null : index
                    )
                  }
                >
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {formatKey(el.roomType)}
                        </CardTitle>
                        {/* <p className="text-sm text-gray-500">
                        {category.description}
                      </p> */}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">₹{el.price}</span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            expandedCategory === index
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </div>

                {expandedCategory === index && (
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {el.roomNo.map((room: any, roomIndex: number) => (
                        <button
                          key={roomIndex}
                          onClick={() => onRoomSelect(room, el.roomType)}
                          className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-left space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Room {room}</span>
                            <Badge className={`capitalize ${room}`}>
                              {room}
                            </Badge>
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
            );
          })}
      {historyFlag && <HotelRoomHistory data={historyData} />}
    </div>
  );
};

export default History;
