"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import Rooms from "../modules/staff/rooms/components/room";
import Tables from "../modules/staff/tables/components/table";
import { handleRoomStaffInformation } from "../modules/staff/utils/clientside";
import { useTokenManager } from "@/hooks/useTokenManager";

const Page = () => {
  const [staffData, setStaffData] = useState<any>({});

  // Use the token manager hook with custom options
  const { getTokenInfo, isReady } = useTokenManager({
    autoSaveOnMount: true, // Automatically save on mount
    forceAfterMinutes: 60, // Force save after 60 minutes
    skipTimeCheck: false, // Don't skip time check
    onSuccess: (result) => {
      if (!result.skipped) {
        console.log("Token saved successfully from staff dashboard");
      }
    },
    onError: (error) => {
      console.error("Failed to save token from staff dashboard:", error);
    },
  });

  useEffect(() => {
    // Setup the listener when the component mounts
    const unsubscribe = handleRoomStaffInformation((result) => {
      if (result) {
        // Update your component state with the new result
        setStaffData(result);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Debug: Log token info (remove in production)
  useEffect(() => {
    if (isReady) {
      const info = getTokenInfo();
      console.log("Token Info:", info);
    }
  }, [isReady, getTokenInfo]);

  // console.log("staff", staffData);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <div className="space-y-4 p-2 mx-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <h2 className="text-3xl font-bold tracking-tight mt-2">Staff</h2>
          </div>
        </div>
        {!staffData ? (
          <p className="px-auto">Loading........</p>
        ) : (
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
        )}
      </div>
    </>
  );
};

export default Page;
