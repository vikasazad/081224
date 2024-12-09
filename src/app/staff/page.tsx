"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useRef, useState } from "react";
import { handleRoomStaffInformation } from "../modules/staff/utils/staffData";
import Rooms from "../modules/staff/rooms/components/room";
import Tables from "../modules/staff/tables/components/table";
import { Provider } from "react-redux";
import store, { AppStore } from "@/lib/store";

const Page = () => {
  const [staffData, setStaffData] = useState<any>({});
  useEffect(() => {
    handleRoomStaffInformation().then((data) => {
      setStaffData(data);
    });
  }, []);
  console.log("staff", staffData);
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = store();
  }
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <div className="space-y-4 p-2 mx-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <h2 className="text-3xl font-bold tracking-tight mt-2">Staff</h2>
          </div>
        </div>
        {!staffData ? (
          <p className="px-6">Loading........</p>
        ) : (
          <Provider store={storeRef.current}>
            <Tabs defaultValue="room" className="space-y-4 ">
              <TabsList className="mx-4 md:mx-8">
                <TabsTrigger value="room">Rooms</TabsTrigger>
                <TabsTrigger value="table">Tables</TabsTrigger>
              </TabsList>
              <TabsContent value="room" className="space-y-4">
                <Rooms data={staffData.hotelOverview} />
              </TabsContent>
              <TabsContent value="table" className="space-y-4">
                <Tables data={staffData.restaurantOverview} />
              </TabsContent>
            </Tabs>
          </Provider>
        )}
      </div>
    </>
  );
};

export default Page;
