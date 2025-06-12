"use client";
// import { Button } from "@/components/ui/button";
// import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "../modules/dashboard/overview/components/overview";
import Analytics from "../modules/dashboard/analytics/components/analytics";
import Notifications from "../modules/dashboard/notifications/components/notifications";
import Reports from "../modules/dashboard/reports/components/reports";
import { useTokenManager } from "@/hooks/useTokenManager";
import { useEffect } from "react";
export default function Dashboard() {
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

  // Debug: Log token info (remove in production)
  useEffect(() => {
    if (isReady) {
      const info = getTokenInfo();
      console.log("Token Info:", info);
    }
  }, [isReady, getTokenInfo]);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="space-y-4 p-2 mx-8 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          {/* <div className="flex flex-col space-y-1 sm:flex-row items-center space-x-0 sm:space-x-2 px-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div> */}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 ">
        <TabsList className="mx-4 md:mx-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Analytics />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Reports />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Notifications />
        </TabsContent>
      </Tabs>
    </div>
  );
}
