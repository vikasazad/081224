"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StatusChip from "@/components/ui/StatusChip";
import { Calendar, Clock, Coffee, Users, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DayCheckIn = ({ data }: { data: any; status: string }) => {
  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    setRoomData(data);
  }, [data]);

  return (
    <div className="space-y-4">
      {roomData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(roomData).map((item: any, main) => (
            <Card key={main}>
              <CardContent className="px-4 py-0">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-bold">
                            Booking {item.bookingDetails.bookingId}
                          </span>
                          <div className="flex">
                            <span className="text-sm text-muted-foreground">
                              Guest: {item.bookingDetails.customer.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Users size={14} />
                              {item.bookingDetails.noOfGuests} Guests
                            </Badge>
                          </div>
                        </div>
                        <StatusChip status={item.bookingDetails.status} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            Check In
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(
                                item.bookingDetails.checkIn
                              ).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              10:17 AM
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            Check Out
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(
                                item.bookingDetails.checkOut
                              ).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              10:17 AM
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-2" />
                      {item.bookingDetails.specialRequirements && (
                        <>
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">
                              Special Requirement
                            </h3>
                            <Badge variant="outline">
                              {item.bookingDetails.specialRequirements}
                            </Badge>
                          </div>

                          <Separator className="my-2" />
                        </>
                      )}

                      {/* inclusions has to an array to make it and array and make this section dynamix */}

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Inclusions</h3>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            <span>Taxes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wifi size={16} />
                            <span>WiFi</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Coffee size={16} />
                            <span>Breakfast</span>
                          </div>
                        </div>
                      </div>
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

export default DayCheckIn;
