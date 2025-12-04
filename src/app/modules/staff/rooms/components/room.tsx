"use client";

import React, { useState } from "react";
import Ongoing from "./ongoing";
import DayCheckOut from "./dayCheckOut";
import DayCheckIn from "./dayCheckIn";
import Vacant from "./vacant";
import { Button } from "@/components/ui/button";
// import Maintenance from "./maintenance";

export default function Rooms({
  data,
  webhook,
  businessInfo,
}: {
  data: any;
  webhook: any;
  businessInfo: any;
}) {
  const [statusFilter, setStatusFilter] = useState("ongoing");
  const room = data;
  // console.log("ROOM", room);
  return (
    <>
      <div className=" flex flex-wrap gap-2 mt-4 ">
        <Button
          variant={statusFilter === "ongoing" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ongoing")}
          className="text-xs sm:text-sm"
        >
          Ongoing
        </Button>
        <Button
          variant={statusFilter === "checkout" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("checkout")}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Today </span>CheckOut
        </Button>
        <Button
          variant={statusFilter === "checkin" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("checkin")}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Today </span>CheckIn
        </Button>
        <Button
          variant={statusFilter === "vacant" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("vacant")}
          className="text-xs sm:text-sm"
        >
          Vacant
        </Button>
      </div>

      <div className="w-full bg-white rounded-lg ">
        {!data ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500 text-sm">Loading..............</span>
          </div>
        ) : (
          <>
            {statusFilter === "ongoing" && (
              <Ongoing
                data={room.ongoing}
                webhook={webhook}
                status={room.status}
                businessInfo={businessInfo}
              />
            )}
            {statusFilter === "checkout" && (
              <DayCheckOut
                data={room.todayCheckOut}
                status={room.status}
                businessInfo={businessInfo}
              />
            )}
            {statusFilter === "checkin" && (
              <DayCheckIn data={room.todayCheckIn} status={room.status} />
            )}
            {statusFilter === "vacant" && (
              <Vacant
                data={room.vacant}
                status={room.status}
                businessInfo={businessInfo}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
