"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Plus, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCountCompletionPercent } from "../utils/stockCountApi";
import type { StockCount, StockCountStatus } from "@/types/inventory";

interface StockCountListProps {
  stockCounts: StockCount[];
}

const statusConfig: Record<
  StockCountStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  "in-progress": { label: "In Progress", variant: "secondary" },
  "pending-review": { label: "Pending Review", variant: "default" },
  "pending-approval": { label: "Pending Approval", variant: "destructive" },
  completed: { label: "Completed", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function StockCountList({ stockCounts }: StockCountListProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCounts = stockCounts.filter((count) =>
    statusFilter === "all" ? true : count.status === statusFilter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Stock Counts
            </CardTitle>
            <CardDescription>
              Physical inventory counts and reconciliation
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/inventory/stock-count/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Count
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending-review">Pending Review</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {filteredCounts.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No stock counts found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter !== "all"
                ? "Try adjusting your filter"
                : "Start a new physical count to reconcile inventory"}
            </p>
            {statusFilter === "all" && (
              <Button onClick={() => router.push("/inventory/stock-count/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Count
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Counted By</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCounts.map((count) => {
                  const completion = getCountCompletionPercent(count);
                  const config = statusConfig[count.status];

                  return (
                    <TableRow
                      key={count.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/inventory/stock-count/${count.id}`)
                      }
                    >
                      <TableCell className="font-mono font-medium">
                        {count.id}
                      </TableCell>
                      <TableCell>{formatDate(count.date)}</TableCell>
                      <TableCell>{count.category || "All"}</TableCell>
                      <TableCell>{count.countedBy}</TableCell>
                      <TableCell className="text-center">
                        {count.items.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={completion} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {completion}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/inventory/stock-count/${count.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StockCountList;
