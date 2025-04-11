import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from "lucide-react";

interface StatsSummaryProps {
  data: {
    totalEngagement: number;
    newMessages: number;
    followerGrowth: number;
    activeAlerts: number;
  };
}

export function StatsSummary({ data }: StatsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Engagement
          </CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.totalEngagement.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">+12% from last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Messages</CardTitle>
          <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newMessages}</div>
          <p className="text-xs text-muted-foreground">
            {data.newMessages > 0 ? "Requires attention" : "All caught up"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follower Growth</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{data.followerGrowth}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeAlerts}</div>
          <p className="text-xs text-muted-foreground">
            {data.activeAlerts > 0 ? "Needs review" : "No alerts"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
