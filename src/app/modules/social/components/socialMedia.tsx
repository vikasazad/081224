import { TabsContent, TabsList } from "@/components/ui/tabs";
import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { StatsSummary } from "./stats-summary";
import { EngagementTracker } from "./engagement-tracker";
import { MessageInbox } from "./message-inbox";
import { InsightsDashboard } from "./insights-dashboard";
import { ReputationAlerts } from "./reputation-alerts";

const SocialMedia = () => {
  // This would fetch summary data from your Firebase backend
  const summaryData = getSummaryData();

  return (
    <div className="flex flex-col gap-6 py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Social Media Management (In Development)
        </h1>
        <p className="text-muted-foreground">
          Monitor your social media performance and manage customer engagement
        </p>
      </div>

      <StatsSummary data={summaryData} />

      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-6">
          <EngagementTracker />
        </TabsContent>

        <TabsContent value="inbox" className="mt-6">
          <MessageInbox />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <InsightsDashboard />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <ReputationAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// This would be implemented to fetch data from Firebase
function getSummaryData() {
  // In a real implementation, this would fetch from Firebase
  return {
    totalEngagement: 1243,
    newMessages: 18,
    followerGrowth: 56,
    activeAlerts: 3,
  };
}

export default SocialMedia;
