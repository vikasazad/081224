"use client";

import React, { useState } from "react";
import Occupied from "./occupied";
import Reserved from "./reserved";
import Available from "./available";
import { Button } from "@/components/ui/button";
// import Cleaning from "./cleaning";

export default function Tables({
  data,
  businessInfo,
}: {
  data: any;
  businessInfo: any;
}) {
  const table = data;
  const [statusFilter, setStatusFilter] = useState("occupied");
  console.log("Table", table);

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4 mx-2">
        <Button
          variant={statusFilter === "occupied" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("occupied")}
          className="text-xs sm:text-sm"
        >
          Occupied
        </Button>
        <Button
          variant={statusFilter === "reserved" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("reserved")}
          className="text-xs sm:text-sm"
        >
          Reserved
        </Button>
        <Button
          variant={statusFilter === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("available")}
          className="text-xs sm:text-sm"
        >
          Available
        </Button>
      </div>

      <div className="px-1">
        {!data ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500 text-sm">Loading..............</span>
          </div>
        ) : (
          <>
            {statusFilter === "occupied" && (
              <Occupied
                data={table.occupied}
                status={table.status}
                businessInfo={businessInfo}
              />
            )}
            {statusFilter === "reserved" && (
              <Reserved data={table.reserved} status={table.status} />
            )}
            {statusFilter === "available" && (
              <Available data={table.available} status={table.status} />
            )}
          </>
        )}
      </div>
    </>
  );
}
