"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Ongoing from "./ongoing";
import DayCheckOut from "./dayCheckOut";
import DayCheckIn from "./dayCheckIn";
import Vacant from "./vacant";
import Maintenance from "./maintenance";

export default function Rooms({ data }: { data: any }) {
  const room = data;
  // console.log("ROOM", room);
  return (
    <Card className="mx-4 md:mx-8">
      <CardContent className="p-4">
        <div className="w-full bg-white rounded-lg">
          <div className="">
            <Tabs defaultValue="ongoing" className=" pt-2">
              <TabsList className="m-0">
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="todayCheckOut">Today CheckOut</TabsTrigger>
                <TabsTrigger value="todayCheckIn">Today CheckIn</TabsTrigger>
                <TabsTrigger value="vacant">Vacant</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              {!data ? (
                <p>Loading........</p>
              ) : (
                <>
                  <TabsContent value="ongoing" className="space-y-4 py-4">
                    <Ongoing data={room.ongoing} status={room.status} />
                  </TabsContent>
                  <TabsContent value="todayCheckOut" className="space-y-4 py-4">
                    <DayCheckOut
                      data={room.todayCheckOut}
                      status={room.status}
                    />
                  </TabsContent>
                  <TabsContent value="todayCheckIn" className="space-y-4 py-4">
                    <DayCheckIn data={room.todayCheckIn} status={room.status} />
                  </TabsContent>
                  <TabsContent value="vacant" className="space-y-4 py-4">
                    <Vacant data={room.vacant} status={room.status} />
                  </TabsContent>
                  <TabsContent value="maintenance" className="space-y-4 py-4">
                    <Maintenance data={room.maintenance} status={room.status} />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
