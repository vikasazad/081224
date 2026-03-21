"use client";

import React, { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Clock, TrendingDown, PackageX } from "lucide-react";
import { ExpiringSoon } from "./ExpiringSoon";
import { SlowMoving } from "./SlowMoving";
import { Overstocked } from "./Overstocked";
import {
  getExpiringSoonItems,
  getExpiredItems,
  getSlowMovingItems,
  getOverstockedItems,
} from "../utils/stockHealthApi";
import type { InventoryItem } from "@/types/inventory";

interface StockHealthProps {
  items: InventoryItem[];
}

export function StockHealth({ items }: StockHealthProps) {
  const [expiryDays, setExpiryDays] = useState("7");
  const [idleDays, setIdleDays] = useState("30");

  // Calculate items for each tab
  const expiredItems = useMemo(() => getExpiredItems(items), [items]);
  const expiringSoonItems = useMemo(
    () => getExpiringSoonItems(items, parseInt(expiryDays)),
    [items, expiryDays]
  );
  const allExpiringItems = useMemo(
    () => [...expiredItems, ...expiringSoonItems],
    [expiredItems, expiringSoonItems]
  );

  const slowMovingItems = useMemo(
    () => getSlowMovingItems(items, parseInt(idleDays)),
    [items, idleDays]
  );

  const overstockedItems = useMemo(
    () => getOverstockedItems(items),
    [items]
  );

  // Count total issues
  const totalIssues =
    allExpiringItems.length + slowMovingItems.length + overstockedItems.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5" />
              Stock Health
            </CardTitle>
            <CardDescription>
              Monitor inventory health issues and take action
            </CardDescription>
          </div>
          {totalIssues > 0 && (
            <Badge variant="destructive" className="text-sm">
              {totalIssues} issue{totalIssues !== 1 ? "s" : ""} found
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expiring" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expiring" className="gap-2">
              <Clock className="h-4 w-4" />
              Expiring
              {allExpiringItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {allExpiringItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="slow-moving" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Slow Moving
              {slowMovingItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {slowMovingItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overstocked" className="gap-2">
              <PackageX className="h-4 w-4" />
              Overstocked
              {overstockedItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {overstockedItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expiring" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Items expiring within the selected timeframe
                {expiredItems.length > 0 && (
                  <span className="text-red-600 ml-2">
                    ({expiredItems.length} already expired)
                  </span>
                )}
              </p>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Next 3 days</SelectItem>
                  <SelectItem value="7">Next 7 days</SelectItem>
                  <SelectItem value="15">Next 15 days</SelectItem>
                  <SelectItem value="30">Next 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ExpiringSoon items={allExpiringItems} />
          </TabsContent>

          <TabsContent value="slow-moving" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Items not sold or used within the selected period
              </p>
              <Select value={idleDays} onValueChange={setIdleDays}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30+ days idle</SelectItem>
                  <SelectItem value="60">60+ days idle</SelectItem>
                  <SelectItem value="90">90+ days idle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SlowMoving items={slowMovingItems} />
          </TabsContent>

          <TabsContent value="overstocked" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Items exceeding their maximum stock level
            </p>
            <Overstocked items={overstockedItems} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default StockHealth;
