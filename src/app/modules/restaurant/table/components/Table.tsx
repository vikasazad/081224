"use client";
import React from "react";
import { Card } from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import TwoSeat from "./TwoSeat";
import FourSeat from "./FourSeat";
import SixSeat from "./SixSeat";

const Table = ({ data }: { data: any }) => {
  console.log("TABLETABLE", data);
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:px-8 py-4">
      <Card className="w-full max-w-2xl">
        <Tabs defaultValue="2" className="space-y-4 ">
          <div className=" flex items-center justify-between p-4">
            <div className="text-xl font-semibold ">Table Information</div>
            <TabsList className="mx-4 md:mx-8">
              <TabsTrigger value="2">2 Seater</TabsTrigger>
              <TabsTrigger value="4">4 Seater</TabsTrigger>
              <TabsTrigger value="6">6 Seater</TabsTrigger>
            </TabsList>
          </div>

          <>
            <TabsContent value="2" className="space-y-4">
              <TwoSeat data={data[0].twoseater} />
            </TabsContent>
            <TabsContent value="4" className="space-y-4">
              <FourSeat data={data[0].four_seater} />
            </TabsContent>
            <TabsContent value="6" className="space-y-4">
              <SixSeat data={data[0].six_seater} />
            </TabsContent>
          </>
        </Tabs>
      </Card>
    </div>
  );
};

export default Table;
