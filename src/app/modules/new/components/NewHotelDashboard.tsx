"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  BedDouble,
  Building,
  Home,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  History,
  Receipt,
  Calendar,
} from "lucide-react";
import {
  allRoomsData,
  getRoomsByCategory,
  recentActivities,
} from "../data/allrooms";
import {
  RoomCategory,
  RoomActivity,
  ActivityStatus,
  PaymentStatus,
  BookingSource,
} from "../types/allrooms";

const categoryTabs = [
  { id: "all", label: "All Rooms" },
  { id: "deluxe-suite", label: "Deluxe Suite" },
  { id: "standard", label: "Standard" },
  { id: "penthouse", label: "Penthouse" },
  { id: "economy", label: "Economy" },
];

// const filterTabs = [
//   { id: "all", label: "All Rooms" },
//   { id: "occupied", label: "Occupied" },
//   { id: "cleaning", label: "Cleaning" },
// ];

const tierLabels: Record<string, string> = {
  premium: "Premium Tier",
  essential: "Essential",
  luxury: "Luxury",
  value: "Value",
};

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "bed-double":
      return <BedDouble className="h-6 w-6" />;
    case "bed-single":
      return <BedDouble className="h-6 w-6" />;
    case "building":
      return <Building className="h-6 w-6" />;
    case "home":
      return <Home className="h-6 w-6" />;
    default:
      return <BedDouble className="h-6 w-6" />;
  }
};

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "available":
//       return "bg-emerald-100 text-emerald-700";
//     case "booked":
//       return "bg-red-100 text-red-700";
//     case "occupied":
//       return "bg-amber-100 text-amber-700";
//     case "reserved":
//       return "bg-red-100 text-red-700";
//     case "in_preparation":
//       return "bg-blue-100 text-blue-700";
//     case "cleaning":
//       return "bg-purple-100 text-purple-700";
//     case "maintenance":
//       return "bg-gray-100 text-gray-700";
//     default:
//       return "bg-gray-100 text-gray-700";
//   }
// };

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

const OccupancyTrendChart = ({ category }: { category: RoomCategory }) => {
  const trend = category.occupancyTrend;

  const getBarColor = (value: number) => {
    if (value >= 70) return "bg-teal-500";
    if (value >= 50) return "bg-teal-400";
    if (value >= 30) return "bg-amber-400";
    return "bg-amber-300";
  };

  return (
    <div className="flex items-end gap-1.5 h-14">
      {trend.map((value, index) => {
        const isToday = index === trend.length - 1;
        return (
          <div
            key={index}
            className={`flex-1 max-w-14 ${getBarColor(value)} rounded-sm transition-all ${
              isToday ? "ring-1 ring-teal-600 ring-offset-1" : ""
            }`}
            style={{
              height: `${Math.max(value, 5)}%`,
            }}
            title={`${isToday ? "Today" : `Day -${trend.length - 1 - index}`}: ${value}% occupancy`}
          />
        );
      })}
    </div>
  );
};

const CategoryCard = ({
  category,
  onClick,
}: {
  category: RoomCategory;
  onClick: () => void;
}) => {
  const { statusBreakdown } = category;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="p-4 bg-blue-50 rounded-xl">
            {getCategoryIcon(category.icon)}
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {tierLabels[category.tier]}
          </span>
        </div>

        <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
        <p className="text-4xl font-bold mb-6">
          {category.totalRooms.toString().padStart(2, "0")}
          <span className="text-base font-normal text-muted-foreground ml-2">
            Total
          </span>
        </p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Vacant
              </span>
              <div className="mt-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                  {statusBreakdown.available.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Cleaning
              </span>
              <div className="mt-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                  {statusBreakdown.cleaning.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Maint.
              </span>
              <div className="mt-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                  {statusBreakdown.maintenance.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Occupancy
            </span>
            <p className="text-2xl font-bold mt-1">
              {category.occupancyPercentage}%
            </p>
          </div>
        </div>

        <OccupancyTrendChart category={category} />
      </CardContent>
    </Card>
  );
};

const getActivityStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-slate-100 text-slate-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
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

const formatBookingSource = (source?: BookingSource): string => {
  if (!source) return "—";
  const sourceLabels: Record<BookingSource, string> = {
    "booking.com": "Booking.com",
    agoda: "Agoda",
    mmt: "MMT",
    goibibo: "Goibibo",
    website: "Website",
    phone: "Phone",
    agent: "Agent",
    walk_in: "Walk-in",
    expedia: "Expedia",
    airbnb: "Airbnb",
  };
  return sourceLabels[source] || source;
};

const getBookingSourceColor = (source?: BookingSource): string => {
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

const ActivityRow = ({
  activity,
  onClick,
  onViewHistory,
  onViewTransactions,
}: {
  activity: RoomActivity;
  onClick: () => void;
  onViewHistory: () => void;
  onViewTransactions: () => void;
}) => {
  return (
    <TableRow className="cursor-pointer hover:bg-slate-50" onClick={onClick}>
      <TableCell>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm">{activity.id}</span>
        </div>
      </TableCell>
      <TableCell>{activity.guestName}</TableCell>
      <TableCell>{activity.roomNumber}</TableCell>
      <TableCell className="text-center">{activity.people}</TableCell>
      <TableCell>{formatPrice(activity.price)}</TableCell>
      <TableCell>
        <Badge className={getActivityStatusColor(activity.status)}>
          {formatStatus(activity.status)}
        </Badge>
      </TableCell>
      <TableCell>
        {activity.bookingSource ? (
          <Badge className={getBookingSourceColor(activity.bookingSource)}>
            {formatBookingSource(activity.bookingSource)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>{activity.attendant}</TableCell>
      <TableCell className="font-mono text-sm">{activity.paymentId}</TableCell>
      <TableCell className="text-sm">{activity.startTime}</TableCell>
      <TableCell className="text-sm">{activity.endTime}</TableCell>
      <TableCell>
        <Badge className={getPaymentStatusColor(activity.paymentStatus)}>
          {formatStatus(activity.paymentStatus)}
        </Badge>
      </TableCell>
      <TableCell
        className="max-w-[120px] truncate"
        title={activity.specialRequirements}
      >
        {activity.specialRequirements || "—"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewHistory();
              }}
              className="cursor-pointer"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewTransactions();
              }}
              className="cursor-pointer"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Transactions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const NewHotelDashboard = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const { categories } = allRoomsData;

  const filteredRooms = React.useMemo(() => {
    const rooms = getRoomsByCategory(activeCategory);
    return rooms;
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId !== "all") {
      router.push(`/new/category/${categoryId}`);
    }
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/new/room/${roomId}`);
  };

  const handleViewHistory = (roomId: string) => {
    router.push(`/new/room/${roomId}/history`);
  };

  const handleViewTransactions = (roomId: string) => {
    router.push(`/new/room/${roomId}/transactions`);
  };

  const handleApplyFilter = () => {
    console.log("Applying date filter:", dateFilter);
    setIsFilterDialogOpen(false);
  };

  const handleClearFilter = () => {
    setDateFilter({ startDate: "", endDate: "" });
  };

  const handleExportData = () => {
    const csvHeaders = [
      "Id",
      "Name",
      "Location",
      "People",
      "Price",
      "Status",
      "Type",
      "Attendant",
      "Payment ID",
      "Start Time",
      "End Time",
      "Payment Status",
      "Special Requirements",
    ];

    const csvRows = recentActivities.map((activity) => [
      activity.id,
      activity.guestName,
      activity.roomNumber,
      activity.people,
      activity.price,
      activity.status,
      formatBookingSource(activity.bookingSource),
      activity.attendant,
      activity.paymentId,
      activity.startTime,
      activity.endTime,
      activity.paymentStatus,
      activity.specialRequirements || "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `activities_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Exported data:", recentActivities);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Overview Dashboard
          </p>
          <h1 className="text-3xl font-bold">All Rooms Overview</h1>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Rooms</DialogTitle>
                <DialogDescription>
                  Apply date range filter to view room data for a specific
                  period.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="startDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-0">
                <Button variant="outline" onClick={handleClearFilter}>
                  Clear
                </Button>
                <DialogClose asChild>
                  <Button onClick={handleApplyFilter}>Apply Filter</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="gap-2" onClick={handleExportData}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        {categoryTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeCategory === tab.id ? "default" : "ghost"}
            className={`${
              activeCategory === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-slate-200"
            }`}
            onClick={() => {
              setActiveCategory(tab.id);
              setCurrentPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg uppercase tracking-wider">
            Recent Activity & Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">People</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Attendant</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Sp. Req.</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onClick={() => handleRoomClick(activity.roomId)}
                    onViewHistory={() => handleViewHistory(activity.roomId)}
                    onViewTransactions={() =>
                      handleViewTransactions(activity.roomId)
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {recentActivities.length} of {recentActivities.length}{" "}
              activities
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
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => console.log("Add new room")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default NewHotelDashboard;
