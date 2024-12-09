import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const StatsGrid = ({ table }: { table: any }) => {
  return (
    <div className="flex flex-col space-y-2 md:min-w-[20%]">
      {/* First Card */}
      <Card className="w-full">
        <CardContent className="grid ">
          <div className="space-y-6">
            {Object.keys(table).map((key) =>
              ["roomsData", "tablesData"].map((dataKey) => {
                if (
                  (key === "hotel" && dataKey === "roomsData") ||
                  (key === "restaurant" && dataKey === "tablesData")
                ) {
                  const data = table[key][dataKey];
                  if (data.stats) {
                    const label =
                      dataKey.replace("Data", "").charAt(0).toUpperCase() +
                      dataKey.replace("Data", "").slice(1);

                    return (
                      <div key={dataKey} className="space-y-2">
                        {label === "Tables" && <Separator className="my-2" />}
                        <h3 className="font-semibold leading-none tracking-tight mt-5">
                          {label}
                        </h3>
                        <Separator className="my-2" />

                        {Object.keys(data.stats).map((itemKey) => (
                          <div
                            key={itemKey}
                            className="flex items-center justify-between "
                          >
                            <h3 className="text-sm font-normal">
                              {itemKey.charAt(0).toUpperCase() +
                                itemKey.slice(1)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {data["stats"][itemKey]}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Second Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="">
            <h3 className="font-semibold leading-none tracking-tight">Staff</h3>
            <Separator className="my-2" />
            <div className="flex items-center justify-between ">
              <h3 className="text-sm font-normal">Online</h3>
              <p className="text-sm text-muted-foreground">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsGrid;
