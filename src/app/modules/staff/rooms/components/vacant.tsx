"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
// import { Clock, User } from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useDispatch } from "react-redux";
import { addGstTax, addRoom } from "@/lib/features/walkinSlice";

const Vacant = ({
  data,
  businessInfo,
}: {
  data: any;
  status: any;
  businessInfo: any;
}) => {
  // console.log("DATA", data);
  const [roomData, setRoomData] = useState([]);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const sortedData = Object.values(data).sort((a: any, b: any) => {
      // Extract numeric part from room numbers and compare
      const roomA = parseInt(a.roomNo.replace(/\D/g, ""));
      const roomB = parseInt(b.roomNo.replace(/\D/g, ""));
      return roomA - roomB;
    });
    setRoomData(sortedData as any);
  }, [data]);

  const handleWalkIn = (room: any) => {
    console.log("room", room);
    dispatch(addRoom(room));
    dispatch(addGstTax(businessInfo?.gstTax));
    router.push("/walkin");
  };

  return (
    <div className="space-y-4">
      {roomData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomData.map((item: any, main: number) => (
            <Card
              key={main}
              className="rounded-xl shadow-md border border-gray-200"
            >
              <CardContent className="px-4 py-0">
                <Accordion type="single" collapsible key={main}>
                  <AccordionItem value={item.roomNo}>
                    <AccordionTrigger className="p-2">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl font-extrabold tracking-wide text-gray-900">
                          {item.roomNo}
                        </span>
                        <StatusChip status={item.status} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1"
                          >
                            {item.roomType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1"
                          >
                            ₹{item.price}
                          </Badge>
                        </div>
                        <button
                          className="mt-2 w-full bg-primary text-white rounded-lg py-2 font-semibold text-base shadow hover:bg-primary/90 transition"
                          onClick={() => handleWalkIn(item)}
                        >
                          Walk-in Guest
                        </button>
                      </div>
                      {/* <div className="flex items-baseline justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            Last Cleaned
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(
                                item.cleaning.lastCleaned
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                item.cleaning.lastCleaned
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User size={16} />
                            Cleaned By
                          </div>
                          <p className="font-medium">
                            {item.cleaning.cleanedBy}
                          </p>
                        </div>
                      </div> */}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vacant;
