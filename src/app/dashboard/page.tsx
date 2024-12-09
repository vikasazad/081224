import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "../modules/dashboard/overview/components/overview";
import Analytics from "../modules/dashboard/analytics/components/analytics";
import Notifications from "../modules/dashboard/notifications/components/notifications";
import Reports from "../modules/dashboard/reports/components/reports";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="space-y-4 p-2 mx-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex flex-col space-y-1 sm:flex-row items-center space-x-0 sm:space-x-2 px-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div>
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
