"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HotelRestaurantHistory from "./HotelRestaurantHistory";

const History = ({ data }: { data: any }) => {
  console.log("first", data);
  const [expandedCategory, setExpandedCategory] = useState<any>(null);
  const [historyFlag, setHistoryFlag] = useState<boolean>(false);

  const ontableSelect = (roomNo: string) => {
    console.log(roomNo);
    setHistoryFlag(true);
  };
  return (
    <div className="max-w-4xl  p-6 space-y-4">
      {!historyFlag &&
        data.map((table: any) =>
          Object.values(table).map((category: any, index: number) => {
            console.log("askdjfh", category);
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
                          {category[0].categoryName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ₹{category[0].reservation_price}
                        </span>
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
                      {category[0].table_number.map(
                        (table: any, tableIndex: number) => (
                          <button
                            key={tableIndex}
                            onClick={() => ontableSelect(table)}
                            className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-left space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{table}</span>
                              <Badge className={`capitalize ${table}`}>
                                {table}
                              </Badge>
                            </div>
                            <div className="text-sm text-blue-600 hover:text-blue-800">
                              View History →
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      {historyFlag && <HotelRestaurantHistory />}
    </div>
  );
};

export default History;
