"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "./date-range-picker";
import { EngagementChart } from "./engagement-chart";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { PlatformFilter } from "./platform-filter";
import { PostEngagementTable } from "./post-engagement-table";

export function EngagementTracker() {
  const [platform, setPlatform] = useState<string>("all");
  const [postType, setPostType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Tracker</CardTitle>
          <CardDescription>
            Monitor engagement metrics across your social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <PlatformFilter value={platform} onValueChange={setPlatform} />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Post Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="carousel">Carousels</SelectItem>
                  <SelectItem value="story">Stories</SelectItem>
                </SelectContent>
              </Select>

              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <EngagementChart platform={platform} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="posts" className="pt-4">
          <PostEngagementTable
            platform={platform}
            postType={postType}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="comparison" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
              <CardDescription>
                Compare engagement metrics across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {/* Platform comparison chart would go here */}
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Platform comparison visualization
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
