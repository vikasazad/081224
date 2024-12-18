"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Occupied from "./occupied";
import Reserved from "./reserved";
import Available from "./available";
import Cleaning from "./cleaning";

export default function Tables({ data }: { data: any }) {
  const table = data;
  console.log("Table", table);

  return (
    <Card className="mx-4 md:mx-8">
      <CardContent className="p-1">
        <div className="w-full bg-white rounded-lg">
          <div className="">
            <Tabs defaultValue="occupied" className=" pt-2">
              <TabsList className="m-0">
                <TabsTrigger value="occupied">Occupied</TabsTrigger>
                <TabsTrigger value="reserved">Reserved</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
              </TabsList>

              {!data ? (
                <p>Loading........</p>
              ) : (
                <>
                  <TabsContent value="occupied" className="space-y-4 py-4">
                    <Occupied data={table.occupied} status={table.status} />
                  </TabsContent>
                  <TabsContent value="reserved" className="space-y-4 py-4">
                    <Reserved data={table.reserved} status={table.status} />
                  </TabsContent>
                  <TabsContent value="available" className="space-y-4 py-4">
                    <Available data={table.available} status={table.status} />
                  </TabsContent>
                  <TabsContent value="cleaning" className="space-y-4 py-4">
                    <Cleaning data={table.cleaning} status={table.status} />
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
