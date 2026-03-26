"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  ShieldCheck,
  Search,
  MoreVertical,
  BedDouble,
  Wrench,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { getRoomHistoryData } from "../data/roomHistory";
import { HistoryEntryType, HistoryEntryStatus } from "../types/roomHistory";

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-700";
    case "booked":
      return "bg-red-100 text-red-700";
    case "occupied":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getEntryStatusColor = (status: HistoryEntryStatus) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "internal":
      return "bg-gray-100 text-gray-700";
    case "processed":
      return "bg-amber-100 text-amber-700";
    case "pending":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getEntryTypeIcon = (type: HistoryEntryType) => {
  switch (type) {
    case "stay":
      return <BedDouble className="h-4 w-4" />;
    case "maintenance":
      return <Wrench className="h-4 w-4" />;
    case "refund":
      return <RotateCcw className="h-4 w-4" />;
    case "cleaning":
      return <Sparkles className="h-4 w-4" />;
    default:
      return <BedDouble className="h-4 w-4" />;
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

interface RoomHistoryProps {
  roomId: string;
}

const RoomHistory = ({ roomId }: RoomHistoryProps) => {
  const router = useRouter();
  // const [_activeCategory, setActiveCategory] = useState("deluxe-suite");
  const [activeTab, setActiveTab] = useState<"timeline" | "history">("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const historyData = getRoomHistoryData(roomId);
  const {
    roomInfo,
    metrics,
    historyEntries,
    insights,
    revenueIntelligence,
    dateRange,
    pagination,
  } = historyData;

  const filteredEntries = historyEntries.filter(
    (entry) =>
      entry.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.provider.subtitle
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleExportCSV = () => {
    console.log("Exporting history:", filteredEntries);
  };

  const handlePrintFolios = () => {
    console.log("Printing folios for room:", roomId);
  };

  const handleTabChange = (tab: "timeline" | "history") => {
    setActiveTab(tab);
    if (tab === "timeline") {
      router.push(`/new/room/${roomId}`);
    }
  };

  // const handleCategoryChange = (categoryId: string) => {
  //   setActiveCategory(categoryId);
  //   if (categoryId === "all") {
  //     router.push("/new");
  //   }
  // };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Room Management
          </p>
          <h1 className="text-3xl font-bold">
            {roomInfo.name}{" "}
            <span className="font-light text-muted-foreground">
              #{roomInfo.roomNumber}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">
              Current Status
            </p>
            <Badge
              className={`${getStatusColor(roomInfo.status)} text-sm mt-1`}
            >
              {formatStatus(roomInfo.status)}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">
              Daily Rate
            </p>
            <p className="text-xl font-bold">
              {formatPrice(roomInfo.dailyRate)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline/History Toggle & Date Range */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "timeline" ? "default" : "ghost"}
            className={
              activeTab === "timeline"
                ? "bg-white shadow-sm"
                : "hover:bg-slate-200"
            }
            onClick={() => handleTabChange("timeline")}
          >
            30 Day Timeline
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            className={
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-slate-200"
            }
            onClick={() => handleTabChange("history")}
          >
            Historical Logs
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {dateRange.start} — {dateRange.end}
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lifetime Revenue */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Lifetime Revenue
            </p>
            <p className="text-3xl font-bold mb-2">
              {formatUSD(metrics.lifetimeRevenue.amount)}
            </p>
            <div className="flex items-center gap-1 text-emerald-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>
                +{metrics.lifetimeRevenue.changePercentage}% vs last year
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Occupancy */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Average Occupancy
            </p>
            <p className="text-3xl font-bold mb-2">
              {metrics.averageOccupancy.percentage}%
            </p>
            <div className="flex items-center gap-1 text-emerald-600 text-sm">
              <BedDouble className="h-4 w-4" />
              <span>Exceeding {metrics.averageOccupancy.comparison}</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Maintenance */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Active Maintenance
            </p>
            <p className="text-3xl font-bold mb-2">
              {metrics.activeMaintenance.status === "none"
                ? "None"
                : metrics.activeMaintenance.count}
            </p>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Last check: {metrics.activeMaintenance.lastCheck}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="link" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="link"
              className="gap-2"
              onClick={handlePrintFolios}
            >
              <Printer className="h-4 w-4" />
              Print Folios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Guest / Service Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {entry.dateRange || entry.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.year}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          entry.provider.type === "guest"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {entry.provider.type === "service" ? (
                          <Wrench className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">
                            {entry.provider.initials}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.provider.name}</p>
                        {entry.provider.subtitle && (
                          <p className="text-sm text-muted-foreground">
                            {entry.provider.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEntryTypeIcon(entry.entryType)}
                      <span className="capitalize">{entry.entryType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={entry.isNegative ? "text-red-600" : ""}>
                      {entry.isNegative ? "-" : ""}
                      {formatUSD(entry.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEntryStatusColor(entry.status)}>
                      {formatStatus(entry.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Showing {pagination.showing} of {pagination.total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from(
                { length: Math.min(3, pagination.totalPages) },
                (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ),
              )}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section - Revenue Intelligence & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Intelligence Card */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="relative h-64 bg-gradient-to-t from-black/80 to-transparent">
            <div className="absolute inset-0 bg-slate-400" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="font-semibold text-xl mb-2">
                {revenueIntelligence.title}
              </h3>
              <p className="text-sm text-white/90">
                {revenueIntelligence.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Insight Cards */}
        <div className="flex flex-col gap-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    insight.type === "predictive"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {insight.type === "predictive" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => console.log("Quick action for room history:", roomId)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default RoomHistory;
