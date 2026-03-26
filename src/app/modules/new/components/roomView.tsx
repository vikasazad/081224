"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Download,
  Printer,
  Plus,
  Check,
  Lock,
  Home,
  User,
  AlertTriangle,
  ArrowLeft,
  Pencil,
  Trash2,
  Wrench,
  MessageSquare,
} from "lucide-react";
import {
  getRoomDashboardData,
  filterActivityLogByDateRange,
  exportToCSV,
  printActivityLog,
} from "../data/roomData";
import {
  ActivityLogEntry,
  BookingSource,
  PaymentStatus,
  PaymentMode,
} from "../types/roomData";
import {
  format,
  addDays,
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { DateRange } from "react-day-picker";

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-700";
    case "booked":
      return "bg-red-100 text-red-700";
    case "occupied":
      return "bg-amber-100 text-amber-700";
    case "reserved":
      return "bg-red-100 text-red-700";
    case "in_preparation":
      return "bg-blue-100 text-blue-700";
    case "cleaning":
      return "bg-purple-100 text-purple-700";
    case "maintenance":
      return "bg-gray-100 text-gray-700";
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "arriving_soon":
      return "bg-cyan-100 text-cyan-700";
    case "checked_in":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getTimelineBlockColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-emerald-400 hover:bg-emerald-500";
    case "booked":
      return "bg-red-300 hover:bg-red-400";
    case "occupied":
      return "bg-red-400 hover:bg-red-500";
    case "in_preparation":
      return "bg-blue-300 hover:bg-blue-400";
    case "maintenance":
      return "bg-amber-300 hover:bg-amber-400";
    default:
      return "bg-gray-300 hover:bg-gray-400";
  }
};

const getTimelineIcon = (status: string) => {
  switch (status) {
    case "available":
      return <Check className="h-4 w-4 text-white" />;
    case "booked":
      return <Lock className="h-4 w-4 text-white" />;
    case "occupied":
      return <Home className="h-4 w-4 text-white" />;
    case "in_preparation":
      return <Home className="h-4 w-4 text-white" />;
    case "maintenance":
      return <Wrench className="h-4 w-4 text-white" />;
    default:
      return <Check className="h-4 w-4 text-white" />;
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

const getPaymentStatusColor = (status?: PaymentStatus) => {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "partial":
      return "bg-blue-100 text-blue-700";
    case "refunded":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatPaymentStatus = (status?: PaymentStatus) => {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatPaymentMode = (mode?: PaymentMode) => {
  if (!mode) return "-";
  switch (mode) {
    case "credit_card":
      return "Credit Card";
    case "debit_card":
      return "Debit Card";
    case "upi":
      return "UPI";
    case "net_banking":
      return "Net Banking";
    case "cash":
      return "Cash";
    default:
      return mode;
  }
};

const formatBookingSource = (source?: BookingSource) => {
  if (!source) return "-";
  switch (source) {
    case "booking.com":
      return "Booking.com";
    case "agoda":
      return "Agoda";
    case "mmt":
      return "MMT";
    case "goibibo":
      return "Goibibo";
    case "website":
      return "Website";
    case "phone":
      return "Phone";
    case "agent":
      return "Agent";
    case "walk_in":
      return "Walk-in";
    case "expedia":
      return "Expedia";
    case "airbnb":
      return "Airbnb";
    default:
      return source;
  }
};

const getBookingSourceColor = (source?: BookingSource) => {
  if (!source) return "bg-gray-100 text-gray-600";
  switch (source) {
    case "booking.com":
      return "bg-blue-100 text-blue-700";
    case "agoda":
      return "bg-red-100 text-red-700";
    case "mmt":
      return "bg-orange-100 text-orange-700";
    case "goibibo":
      return "bg-orange-100 text-orange-700";
    case "website":
      return "bg-emerald-100 text-emerald-700";
    case "phone":
      return "bg-purple-100 text-purple-700";
    case "agent":
      return "bg-indigo-100 text-indigo-700";
    case "walk_in":
      return "bg-teal-100 text-teal-700";
    case "expedia":
      return "bg-yellow-100 text-yellow-700";
    case "airbnb":
      return "bg-pink-100 text-pink-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getInventoryStatusColor = (status: string) => {
  switch (status) {
    case "ok":
      return "text-emerald-600";
    case "restocked":
      return "text-emerald-600";
    case "maintenance_due":
      return "text-red-600";
    case "low":
      return "text-amber-600";
    case "empty":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
};

const formatInventoryStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

interface RoomViewProps {
  roomId: string;
}

const RoomView = ({ roomId }: RoomViewProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"timeline" | "history">(
    "timeline",
  );

  const dashboardData = getRoomDashboardData(roomId);

  const today = new Date();
  const defaultStartDate = subDays(today, 15);
  const defaultEndDate = addDays(today, 15);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultStartDate,
    to: defaultEndDate,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityLogEntry | null>(null);

  const [editFormData, setEditFormData] = useState({
    guestName: "",
    phone: "",
    email: "",
    people: 1,
    amount: 0,
    specialRequirements: "",
  });

  useEffect(() => {
    if (selectedActivity?.guest) {
      setEditFormData({
        guestName: selectedActivity.guest.name || "",
        phone: selectedActivity.guest.phone || "",
        email: selectedActivity.guest.email || "",
        people: selectedActivity.people || 1,
        amount: selectedActivity.amount || 0,
        specialRequirements: selectedActivity.specialRequirements || "",
      });
    }
  }, [selectedActivity]);

  const filteredActivityLog = useMemo(() => {
    if (!dashboardData?.activityLog) return [];

    if (!dateRange?.from || !dateRange?.to) {
      return dashboardData.activityLog;
    }

    return filterActivityLogByDateRange(
      dashboardData.activityLog,
      dateRange.from,
      dateRange.to,
    );
  }, [dashboardData?.activityLog, dateRange]);

  const filteredTimeline = useMemo(() => {
    if (!dashboardData?.timeline) return [];

    if (!dateRange?.from || !dateRange?.to) {
      return dashboardData.timeline;
    }

    return dashboardData.timeline.filter((day) => {
      const dayDate = new Date(day.fullDate);
      return isWithinInterval(dayDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      });
    });
  }, [dashboardData?.timeline, dateRange]);

  const { pastTimeline, todayTimeline, futureTimeline } = useMemo(() => {
    const past = filteredTimeline.filter((day) => day.isPast);
    const todayEntry = filteredTimeline.find((day) => day.isToday);
    const future = filteredTimeline.filter((day) => day.isFuture);
    return {
      pastTimeline: past,
      todayTimeline: todayEntry,
      futureTimeline: future,
    };
  }, [filteredTimeline]);

  const { pastActivities, todayActivities, futureActivities } = useMemo(() => {
    const past = filteredActivityLog
      .filter((a) => a.isPast)
      .sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime());
    const todayEntries = filteredActivityLog.filter((a) => a.isToday);
    const future = filteredActivityLog
      .filter((a) => a.isFuture)
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    return {
      pastActivities: past,
      todayActivities: todayEntries,
      futureActivities: future,
    };
  }, [filteredActivityLog]);

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Room not found</p>
      </div>
    );
  }

  const { roomInfo, inventory, alerts } = dashboardData;

  const handleExportCSV = () => {
    exportToCSV(
      filteredActivityLog,
      `room-${roomInfo.roomNumber}-activity-log.csv`,
    );
  };

  const handlePrintFolios = () => {
    printActivityLog(filteredActivityLog, roomInfo);
  };

  const handleBookNow = (date: string) => {
    console.log("Booking room for date:", date);
  };

  const handleTabChange = (tab: "timeline" | "history") => {
    setActiveTab(tab);
    if (tab === "history") {
      router.push(`/new/room/${roomId}/history`);
    }
  };

  const handleEditActivity = (activity: ActivityLogEntry) => {
    setSelectedActivity(activity);
    setEditModalOpen(true);
  };

  const handleDeleteActivity = (activity: ActivityLogEntry) => {
    setSelectedActivity(activity);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    console.log(
      "Saving edit:",
      editFormData,
      "for activity:",
      selectedActivity?.id,
    );

    if (
      editFormData.specialRequirements &&
      editFormData.specialRequirements !== selectedActivity?.specialRequirements
    ) {
      console.log(
        "Staff note synced:",
        `[${editFormData.guestName}] ${editFormData.specialRequirements}`,
      );
    }

    setEditModalOpen(false);
    setSelectedActivity(null);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting activity:", selectedActivity?.id);
    setDeleteModalOpen(false);
    setSelectedActivity(null);
  };

  const handleUpdateInventory = () => {
    console.log("Updating inventory for room:", roomId);
  };

  const formatDateRangeDisplay = () => {
    if (!dateRange?.from) return "Select date range";
    if (!dateRange?.to) return format(dateRange.from, "MMM dd, yyyy");
    return `${format(dateRange.from, "MMM dd, yyyy")} — ${format(dateRange.to, "MMM dd, yyyy")}`;
  };

  const handleResetDateRange = () => {
    setDateRange({
      from: defaultStartDate,
      to: defaultEndDate,
    });
  };

  const renderActivityRow = (
    activity: ActivityLogEntry,
    showBookNow: boolean,
  ) => (
    <TableRow
      key={activity.id}
      className={activity.isToday ? "bg-primary/5" : ""}
    >
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{activity.date}</span>
          <span className="text-xs text-muted-foreground">
            {activity.dayOfWeek}
          </span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm whitespace-nowrap">
        {activity.reservationId || (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {activity.guest ? (
          <span className="font-medium">{activity.guest.name}</span>
        ) : (
          <span className="text-muted-foreground italic">No Booking</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">
        {activity.guest?.phone || (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        {activity.guest?.email || (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {activity.people || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-right font-semibold whitespace-nowrap">
        {activity.amount ? (
          formatPrice(activity.amount)
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="font-mono text-sm whitespace-nowrap">
        {activity.paymentId || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        {activity.bookingSource ? (
          <Badge
            className={`${getBookingSourceColor(activity.bookingSource)} text-xs whitespace-nowrap`}
          >
            {formatBookingSource(activity.bookingSource)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {activity.checkIn || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {activity.checkOut || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        <Badge
          className={`${getStatusColor(activity.status)} text-xs whitespace-nowrap`}
        >
          {formatStatus(activity.status)}
        </Badge>
      </TableCell>
      <TableCell>
        {activity.paymentStatus ? (
          <Badge
            className={`${getPaymentStatusColor(activity.paymentStatus)} text-xs whitespace-nowrap`}
          >
            {formatPaymentStatus(activity.paymentStatus)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">
        {formatPaymentMode(activity.paymentMode)}
      </TableCell>
      <TableCell className="max-w-[150px]">
        {activity.specialRequirements ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <MessageSquare className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <span className="text-sm truncate">
                  {activity.specialRequirements.length > 20
                    ? `${activity.specialRequirements.substring(0, 20)}...`
                    : activity.specialRequirements}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium mb-1">Special Requirements:</p>
              <p>{activity.specialRequirements}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {activity.guest ? (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditActivity(activity)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteActivity(activity)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : showBookNow ? (
          <Button size="sm" onClick={() => handleBookNow(activity.date)}>
            Book Now
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
    </TableRow>
  );

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="whitespace-nowrap">Date</TableHead>
        <TableHead className="whitespace-nowrap">Reservation ID</TableHead>
        <TableHead className="whitespace-nowrap">Guest</TableHead>
        <TableHead className="whitespace-nowrap">Phone</TableHead>
        <TableHead className="whitespace-nowrap">Email</TableHead>
        <TableHead className="whitespace-nowrap text-center">People</TableHead>
        <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
        <TableHead className="whitespace-nowrap">Payment ID</TableHead>
        <TableHead className="whitespace-nowrap">Type</TableHead>
        <TableHead className="whitespace-nowrap">Check In</TableHead>
        <TableHead className="whitespace-nowrap">Check Out</TableHead>
        <TableHead className="whitespace-nowrap">Status</TableHead>
        <TableHead className="whitespace-nowrap">Payment Status</TableHead>
        <TableHead className="whitespace-nowrap">Payment Mode</TableHead>
        <TableHead className="whitespace-nowrap">Sp. Req.</TableHead>
        <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
                  ? "text-white bg-primary shadow-sm"
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
                  ? "bg-white shadow-sm"
                  : "hover:bg-slate-200"
              }
              onClick={() => handleTabChange("history")}
            >
              Historical Logs
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 min-w-[280px] justify-start"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateRangeDisplay()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Select Date Range
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetDateRange}
                      className="text-xs"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  defaultMonth={subDays(today, 15)}
                />
                <div className="p-3 border-t flex justify-end">
                  <Button size="sm" onClick={() => setIsDatePickerOpen(false)}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 30-Day Timeline Visualization - 3 Row Layout */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Room Availability Timeline
            </CardTitle>
            <div className="flex items-center gap-6 text-xs mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-400 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-300 flex items-center justify-center">
                  <Lock className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-400 flex items-center justify-center">
                  <Home className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-300 flex items-center justify-center">
                  <Home className="h-2.5 w-2.5 text-white" />
                </div>
                <span>In Preparation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-300 flex items-center justify-center">
                  <Wrench className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Maintenance</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {filteredTimeline.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No data available for selected date range
              </div>
            ) : (
              <div className="space-y-4">
                {/* Past Row - Full Width */}
                {pastTimeline.length > 0 && (
                  <div className="w-full">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Past</p>
                    <div className="flex gap-1.5 w-full">
                      {pastTimeline.map((day, index) => (
                        <Tooltip key={`past-${index}`}>
                          <TooltipTrigger asChild>
                            <div className={`flex-1 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all opacity-60 hover:opacity-100 ${getTimelineBlockColor(day.status)}`}>
                              {getTimelineIcon(day.status)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">{day.dayOfWeek}, {day.date}</p>
                              <p>{formatStatus(day.status)}</p>
                              {day.bookingId && <p className="text-xs">Booking: {day.bookingId}</p>}
                              {day.maintenanceNote && <p className="text-xs">{day.maintenanceNote}</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Today Row - Compact Centered */}
                {todayTimeline && (
                  <div className="flex justify-center py-2">
                    <div className="bg-primary/5 border border-primary/30 rounded-lg px-4 py-2 flex items-center gap-3">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Today
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all ring-2 ring-primary ring-offset-2 ${getTimelineBlockColor(todayTimeline.status)}`}
                          >
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">
                              Today - {todayTimeline.dayOfWeek},{" "}
                              {todayTimeline.date}
                            </p>
                            <p>{formatStatus(todayTimeline.status)}</p>
                            {todayTimeline.bookingId && (
                              <p className="text-xs">
                                Booking: {todayTimeline.bookingId}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm font-medium">
                        {todayTimeline.dayOfWeek}, {todayTimeline.date}
                      </span>
                      <Badge
                        className={`${getStatusColor(todayTimeline.status)} text-xs`}
                      >
                        {formatStatus(todayTimeline.status)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Future Row - Full Width */}
                {futureTimeline.length > 0 && (
                  <div className="w-full">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Future</p>
                    <div className="flex gap-1.5 w-full">
                      {futureTimeline.map((day, index) => (
                        <Tooltip key={`future-${index}`}>
                          <TooltipTrigger asChild>
                            <div className={`flex-1 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${getTimelineBlockColor(day.status)}`}>
                              {getTimelineIcon(day.status)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">{day.dayOfWeek}, {day.date}</p>
                              <p>{formatStatus(day.status)}</p>
                              {day.bookingId && <p className="text-xs">Booking: {day.bookingId}</p>}
                              {day.maintenanceNote && <p className="text-xs">{day.maintenanceNote}</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Log - Grouped by Past/Today/Future */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg uppercase tracking-wider">
              Activity Log ({filteredActivityLog.length} entries)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="link"
                className="gap-2"
                onClick={handleExportCSV}
              >
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
            {filteredActivityLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">
                  No activity found for the selected date range
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Future Section */}
                {futureActivities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                        Future ({futureActivities.length})
                      </Badge>
                      <div className="h-px flex-1 bg-blue-200" />
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        {renderTableHeader()}
                        <TableBody>
                          {futureActivities.map((activity) =>
                            renderActivityRow(activity, true),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Today Section */}
                {todayActivities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-primary text-white px-3 py-1">
                        Today ({todayActivities.length})
                      </Badge>
                      <div className="h-px flex-1 bg-primary/30" />
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        {renderTableHeader()}
                        <TableBody>
                          {todayActivities.map((activity) =>
                            renderActivityRow(activity, true),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Past Section */}
                {pastActivities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-gray-100 text-gray-700 px-3 py-1">
                        Past ({pastActivities.length})
                      </Badge>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        {renderTableHeader()}
                        <TableBody>
                          {pastActivities.map((activity) =>
                            renderActivityRow(activity, false),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Section - Alert Card & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Card */}
          {alerts.length > 0 && (
            <Card className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute inset-0 bg-slate-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">{alerts[0].title}</h3>
                  </div>
                  <p className="text-sm text-white/90">
                    {alerts[0].description}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Inventory Quick View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">
                Inventory Quick View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span>{item.name}</span>
                    <span
                      className={`font-medium ${getInventoryStatusColor(item.status)}`}
                    >
                      {formatInventoryStatus(item.status)}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={handleUpdateInventory}
              >
                Update Inventory
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          onClick={() => console.log("Quick action for room:", roomId)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Reservation</DialogTitle>
              <DialogDescription>
                Update reservation details for {selectedActivity?.reservationId}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guestName" className="text-right">
                  Guest Name
                </Label>
                <Input
                  id="guestName"
                  value={editFormData.guestName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      guestName: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="people" className="text-right">
                  People
                </Label>
                <Input
                  id="people"
                  type="number"
                  min={1}
                  value={editFormData.people}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      people: parseInt(e.target.value) || 1,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="specialReq" className="text-right pt-2">
                  Special Req.
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="specialReq"
                    value={editFormData.specialRequirements}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        specialRequirements: e.target.value,
                      })
                    }
                    placeholder="Any special requirements..."
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    This will sync to Staff Notes for visibility
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Delete Reservation
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this reservation? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">
                  Reservation: {selectedActivity?.reservationId}
                </p>
                <p className="text-sm text-red-700">
                  Guest: {selectedActivity?.guest?.name}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RoomView;
