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
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Reserved = ({ data }: { data: any; status: string }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  return (
    <div className="space-y-4">
      {tableData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(tableData).map((item: any, main) => (
            <Card key={main}>
              <CardContent className="px-4 py-0">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-bold">
                            Reservation {item.diningDetails.reservationId}
                          </span>
                          <div className="flex">
                            <span className="text-sm text-muted-foreground">
                              Guest: {item.diningDetails.customer.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Users size={14} />
                              {item.diningDetails.noOfGuests} Guests
                            </Badge>
                          </div>
                        </div>
                        <StatusChip status={item.diningDetails.status} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            Reservation Time
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(
                                item.diningDetails.reservationTime
                              ).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              10:17 AM
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-2" />
                      {item.diningDetails.specialRequirements && (
                        <>
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">
                              Special Requirement
                            </h3>
                            <Badge variant="outline">
                              {item.diningDetails.specialRequirements}
                            </Badge>
                          </div>

                          <Separator className="my-2" />
                        </>
                      )}
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

export default Reserved;
