"use client";

import type { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Recharts components
import {
  Area,
  AreaChart,
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

interface EngagementChartProps {
  platform: string;
  dateRange: DateRange | undefined;
}

export function EngagementChart({ platform, dateRange }: EngagementChartProps) {
  console.log("platform", platform);
  console.log("dateRange", dateRange);
  // This would be fetched from your API based on the platform and date range
  const data = [
    { date: "2023-01-01", likes: 120, comments: 24, shares: 18, reach: 1500 },
    { date: "2023-01-02", likes: 140, comments: 32, shares: 22, reach: 1800 },
    { date: "2023-01-03", likes: 135, comments: 30, shares: 20, reach: 1650 },
    { date: "2023-01-04", likes: 155, comments: 36, shares: 25, reach: 2100 },
    { date: "2023-01-05", likes: 180, comments: 42, shares: 30, reach: 2400 },
    { date: "2023-01-06", likes: 200, comments: 48, shares: 35, reach: 2800 },
    { date: "2023-01-07", likes: 210, comments: 52, shares: 38, reach: 3200 },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
        <CardDescription>
          Track likes, comments, shares, and reach over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="likes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="shares">Shares</TabsTrigger>
            <TabsTrigger value="reach">Reach</TabsTrigger>
          </TabsList>

          <TabsContent value="likes" className="pt-4">
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  likes: {
                    label: "Likes",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-full w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
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
                        formatter={(value) => [`${value}`, "Likes"]}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="var(--color-likes)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="pt-4">
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  comments: {
                    label: "Comments",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-full w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
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
                        formatter={(value) => [`${value}`, "Comments"]}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="var(--color-comments)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="shares" className="pt-4">
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  shares: {
                    label: "Shares",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-full w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
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
                        formatter={(value) => [`${value}`, "Shares"]}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="shares"
                    stroke="var(--color-shares)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="reach" className="pt-4">
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  reach: {
                    label: "Reach",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-full w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
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
                        formatter={(value) => [`${value}`, "Reach"]}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="var(--color-reach)"
                    fill="var(--color-reach)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
