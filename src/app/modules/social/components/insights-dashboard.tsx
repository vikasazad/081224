"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePickerWithRange } from "./date-range-picker";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { PlatformFilter } from "./platform-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Recharts components
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

// Import shadcn/ui chart components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function InsightsDashboard() {
  const [platform, setPlatform] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // This would be fetched from your API based on the platform and date range
  const postData = [
    { date: "2023-06-15", count: 2 },
    { date: "2023-06-16", count: 1 },
    { date: "2023-06-17", count: 3 },
    { date: "2023-06-18", count: 0 },
    { date: "2023-06-19", count: 2 },
    { date: "2023-06-20", count: 1 },
    { date: "2023-06-21", count: 4 },
    { date: "2023-06-22", count: 2 },
    { date: "2023-06-23", count: 1 },
    { date: "2023-06-24", count: 0 },
    { date: "2023-06-25", count: 3 },
    { date: "2023-06-26", count: 2 },
    { date: "2023-06-27", count: 1 },
    { date: "2023-06-28", count: 2 },
    { date: "2023-06-29", count: 3 },
    { date: "2023-06-30", count: 1 },
    { date: "2023-07-01", count: 2 },
    { date: "2023-07-02", count: 0 },
    { date: "2023-07-03", count: 1 },
    { date: "2023-07-04", count: 3 },
    { date: "2023-07-05", count: 2 },
    { date: "2023-07-06", count: 1 },
    { date: "2023-07-07", count: 2 },
    { date: "2023-07-08", count: 3 },
    { date: "2023-07-09", count: 1 },
    { date: "2023-07-10", count: 2 },
    { date: "2023-07-11", count: 4 },
    { date: "2023-07-12", count: 2 },
    { date: "2023-07-13", count: 1 },
    { date: "2023-07-14", count: 3 },
    { date: "2023-07-15", count: 2 },
  ];

  const engagementData = [
    { date: "2023-06-15", engagement: 120 },
    { date: "2023-06-16", engagement: 145 },
    { date: "2023-06-17", engagement: 210 },
    { date: "2023-06-18", engagement: 180 },
    { date: "2023-06-19", engagement: 230 },
    { date: "2023-06-20", engagement: 190 },
    { date: "2023-06-21", engagement: 250 },
    { date: "2023-06-22", engagement: 220 },
    { date: "2023-06-23", engagement: 200 },
    { date: "2023-06-24", engagement: 180 },
    { date: "2023-06-25", engagement: 240 },
    { date: "2023-06-26", engagement: 260 },
    { date: "2023-06-27", engagement: 210 },
    { date: "2023-06-28", engagement: 230 },
    { date: "2023-06-29", engagement: 270 },
    { date: "2023-06-30", engagement: 240 },
    { date: "2023-07-01", engagement: 220 },
    { date: "2023-07-02", engagement: 200 },
    { date: "2023-07-03", engagement: 230 },
    { date: "2023-07-04", engagement: 280 },
    { date: "2023-07-05", engagement: 250 },
    { date: "2023-07-06", engagement: 230 },
    { date: "2023-07-07", engagement: 260 },
    { date: "2023-07-08", engagement: 290 },
    { date: "2023-07-09", engagement: 270 },
    { date: "2023-07-10", engagement: 300 },
    { date: "2023-07-11", engagement: 340 },
    { date: "2023-07-12", engagement: 320 },
    { date: "2023-07-13", engagement: 290 },
    { date: "2023-07-14", engagement: 330 },
    { date: "2023-07-15", engagement: 350 },
  ];

  const followerData = [
    { date: "2023-06-15", followers: 1200 },
    { date: "2023-06-16", followers: 1205 },
    { date: "2023-06-17", followers: 1210 },
    { date: "2023-06-18", followers: 1215 },
    { date: "2023-06-19", followers: 1220 },
    { date: "2023-06-20", followers: 1225 },
    { date: "2023-06-21", followers: 1230 },
    { date: "2023-06-22", followers: 1235 },
    { date: "2023-06-23", followers: 1240 },
    { date: "2023-06-24", followers: 1245 },
    { date: "2023-06-25", followers: 1250 },
    { date: "2023-06-26", followers: 1255 },
    { date: "2023-06-27", followers: 1260 },
    { date: "2023-06-28", followers: 1265 },
    { date: "2023-06-29", followers: 1270 },
    { date: "2023-06-30", followers: 1275 },
    { date: "2023-07-01", followers: 1280 },
    { date: "2023-07-02", followers: 1285 },
    { date: "2023-07-03", followers: 1290 },
    { date: "2023-07-04", followers: 1295 },
    { date: "2023-07-05", followers: 1300 },
    { date: "2023-07-06", followers: 1305 },
    { date: "2023-07-07", followers: 1310 },
    { date: "2023-07-08", followers: 1315 },
    { date: "2023-07-09", followers: 1320 },
    { date: "2023-07-10", followers: 1325 },
    { date: "2023-07-11", followers: 1330 },
    { date: "2023-07-12", followers: 1335 },
    { date: "2023-07-13", followers: 1340 },
    { date: "2023-07-14", followers: 1345 },
    { date: "2023-07-15", followers: 1350 },
  ];

  // Platform comparison data
  const platformEngagementData = [
    { platform: "Instagram", engagement: 4500 },
    { platform: "Twitter", engagement: 2800 },
    { platform: "Facebook", engagement: 3200 },
    { platform: "LinkedIn", engagement: 1900 },
    { platform: "TikTok", engagement: 5100 },
  ];

  const platformFollowersData = [
    { platform: "Instagram", followers: 12500 },
    { platform: "Twitter", followers: 8200 },
    { platform: "Facebook", followers: 9800 },
    { platform: "LinkedIn", followers: 5400 },
    { platform: "TikTok", followers: 15300 },
  ];

  const platformReachData = [
    { platform: "Instagram", reach: 28000 },
    { platform: "Twitter", reach: 19500 },
    { platform: "Facebook", reach: 22000 },
    { platform: "LinkedIn", reach: 12800 },
    { platform: "TikTok", reach: 35000 },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insights Dashboard</CardTitle>
          <CardDescription>
            Overview of your social media performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <PlatformFilter value={platform} onValueChange={setPlatform} />
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Posts per Day</CardTitle>
            <CardDescription>
              Number of posts published across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Posts",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="min-h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={postData}
                margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                width={0}
                height={300}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} posts`]}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Engagement</CardTitle>
            <CardDescription>
              Combined likes, comments, and shares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                engagement: {
                  label: "Engagement",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="min-h-[300px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={engagementData}
                margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                width={0}
                height={300}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}`, "Engagement"]}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="var(--color-engagement)"
                  fill="var(--color-engagement)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Follower Growth Trends</CardTitle>
            <CardDescription>
              Track your follower count over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                followers: {
                  label: "Followers",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="min-h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={followerData}
                margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                width={0}
                height={300}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  domain={["auto", "auto"]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}`, "Followers"]}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="var(--color-followers)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>
            Compare metrics across different social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="reach">Reach</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="pt-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    engagement: {
                      label: "Engagement",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={platformEngagementData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                    layout="vertical"
                    width={0}
                    height={300}
                  >
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="platform"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value}`, "Engagement"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="engagement"
                      fill="var(--color-engagement)"
                      radius={4}
                      barSize={30}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="followers" className="pt-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    followers: {
                      label: "Followers",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={platformFollowersData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                    layout="vertical"
                    width={0}
                    height={300}
                  >
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="platform"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value}`, "Followers"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="followers"
                      fill="var(--color-followers)"
                      radius={4}
                      barSize={30}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="reach" className="pt-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    reach: {
                      label: "Reach",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={platformReachData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                    layout="vertical"
                    width={0}
                    height={300}
                  >
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="platform"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value}`, "Reach"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="reach"
                      fill="var(--color-reach)"
                      radius={4}
                      barSize={30}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
