import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { Clock, User } from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import { Badge } from "@/components/ui/badge";

const Available = ({ data }: { data: any; status: any }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  console.log("tableData", tableData);

  return (
    <div className="space-y-4">
      {tableData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(tableData)
            .sort((a: any, b: any) => a.location.localeCompare(b.location))
            .map((item: any, main) => (
              <Card key={main}>
                <CardContent className="px-4 py-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">
                              {`T-${item.location}`}
                            </span>
                            <Badge variant="outline">{item.capacity}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusChip status={item.status} />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
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

export default Available;
