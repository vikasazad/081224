"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Filter,
  Plus,
  ClipboardCheck,
  User,
  Clock,
  CheckCircle,
  Calendar,
  Sparkles,
  Home,
  Star,
  Loader,
  Crown,
  Send,
  SlidersHorizontal,
  Pencil,
} from "lucide-react";
import {
  getCategoryData,
  getWeeklyPerformance,
  getStaffNotes,
  getUpcomingStays,
} from "../data/roomcategory";
import {
  RoomCardItem,
  CategoryTab,
  DailyPerformance,
  StaffNote,
  UpcomingStay,
  NoteType,
  StayStatus,
  PaymentStatus,
  PaymentMode,
  BookingSource,
} from "../types/roomcategory";
import {
  getCategoryById,
  getRoomsByCategory as getRoomListByCategory,
} from "../data/allrooms";
import { RoomCategory } from "../types/allrooms";

const categoryTabs = [
  { id: "all", label: "All Rooms" },
  { id: "deluxe-suite", label: "Deluxe Suite" },
  { id: "standard", label: "Standard" },
  { id: "penthouse", label: "Penthouse" },
  { id: "economy", label: "Economy" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "booked":
      return "bg-red-100 text-red-700 border-red-200";
    case "occupied":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "reserved":
      return "bg-red-100 text-red-700 border-red-200";
    case "in_preparation":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "cleaning":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "maintenance":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusIcon = (iconName: string) => {
  switch (iconName) {
    case "clipboard-check":
      return <ClipboardCheck className="h-4 w-4 text-muted-foreground" />;
    case "user":
      return <User className="h-4 w-4 text-muted-foreground" />;
    case "clock":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "check-circle":
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    case "calendar":
      return <Calendar className="h-4 w-4 text-muted-foreground" />;
    case "sparkles":
      return <Sparkles className="h-4 w-4 text-muted-foreground" />;
    case "home":
      return <Home className="h-4 w-4 text-muted-foreground" />;
    case "star":
      return <Star className="h-4 w-4 text-muted-foreground" />;
    case "loader":
      return <Loader className="h-4 w-4 text-muted-foreground animate-spin" />;
    case "crown":
      return <Crown className="h-4 w-4 text-muted-foreground" />;
    default:
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const OccupancyRateCard = ({ category }: { category: RoomCategory }) => {
  const currentOccupancy = category.occupancyPercentage;
  const trend = category.occupancyTrend;
  const previousOccupancy =
    trend.length > 1 ? trend[trend.length - 2] : currentOccupancy;
  const change = currentOccupancy - previousOccupancy;
  const changeText =
    change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;

  return (
    <Card className="bg-slate-50 border-0">
      <CardContent className="p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Occupancy Rate
        </p>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-5xl font-bold">{currentOccupancy}%</span>
          <span
            className={`text-sm font-medium ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {changeText} from last month
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${currentOccupancy}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const DailyRevenueCard = ({ avgRevenue }: { avgRevenue: number }) => {
  return (
    <Card className="bg-slate-50 border-0">
      <CardContent className="p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Daily Revenue
        </p>
        <div className="flex flex-col">
          <span className="text-5xl font-bold">{formatPrice(avgRevenue)}</span>
          <span className="text-sm text-muted-foreground mt-2">
            Average per suite per night
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const SuiteAvailabilityMatrix = ({ category }: { category: RoomCategory }) => {
  const { statusBreakdown } = category;

  return (
    <Card className="bg-slate-50 border-0">
      <CardContent className="p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Suite Availability Matrix
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-600 font-semibold text-sm">
                Vacant
              </span>
              <span className="text-xl font-bold">
                {statusBreakdown.available.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="w-full h-1 bg-emerald-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-red-600 font-semibold text-sm">
                Maintenance
              </span>
              <span className="text-xl font-bold">
                {statusBreakdown.maintenance.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="w-full h-1 bg-amber-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-600 font-semibold text-sm">
                Cleaning
              </span>
              <span className="text-xl font-bold">
                {statusBreakdown.cleaning.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="w-full h-1 bg-blue-400 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceInsightChart = ({ data }: { data: DailyPerformance[] }) => {
  const maxValue = Math.max(
    ...data.map((d) => d.bookings + d.dining + d.services + d.issues),
  );
  const chartHeight = 192;

  const legendItems = [
    { label: "Bookings", color: "bg-gray-600" },
    { label: "Dining", color: "bg-blue-500" },
    { label: "Services", color: "bg-emerald-600" },
    { label: "Issues", color: "bg-red-700" },
  ];

  return (
    <Card className="w-[60%] bg-slate-50 border-0 flex-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            7-Day Performance Insight
          </p>
          <div className="flex items-center gap-4">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${item.color} rounded-sm`} />
                <span className="text-xs text-muted-foreground uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex items-end justify-between gap-4"
          style={{ height: chartHeight }}
        >
          {data.map((day) => {
            const total = day.bookings + day.dining + day.services + day.issues;
            const barHeight = (total / maxValue) * chartHeight;

            const bookingsHeight = (day.bookings / total) * barHeight;
            const diningHeight = (day.dining / total) * barHeight;
            const servicesHeight = (day.services / total) * barHeight;
            const issuesHeight = (day.issues / total) * barHeight;

            return (
              <div
                key={day.day}
                className="flex flex-col items-center flex-1 h-full justify-end"
              >
                <div
                  className="w-full max-w-12 flex flex-col-reverse rounded-sm overflow-hidden"
                  style={{ height: barHeight }}
                >
                  <div
                    className="bg-gray-600 w-full"
                    style={{ height: bookingsHeight }}
                    title={`Bookings: ${day.bookings}`}
                  />
                  <div
                    className="bg-blue-500 w-full"
                    style={{ height: diningHeight }}
                    title={`Dining: ${day.dining}`}
                  />
                  <div
                    className="bg-emerald-600 w-full"
                    style={{ height: servicesHeight }}
                    title={`Services: ${day.services}`}
                  />
                  <div
                    className="bg-red-700 w-full"
                    style={{ height: issuesHeight }}
                    title={`Issues: ${day.issues}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-3 uppercase">
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const getNoteTypeColor = (type: NoteType) => {
  switch (type) {
    case "housekeeping":
      return "border-l-gray-400";
    case "concierge":
      return "border-l-blue-600";
    case "maintenance":
      return "border-l-amber-500";
    case "general":
      return "border-l-emerald-500";
    default:
      return "border-l-gray-400";
  }
};

const formatNoteType = (type: NoteType) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const StaffNotesSection = ({
  notes,
  onAddNote,
}: {
  notes: StaffNote[];
  onAddNote: (content: string) => void;
}) => {
  const [newNote, setNewNote] = useState("");

  const handleSubmit = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-slate-50 border-0 w-[40%] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Staff Notes</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 pt-0">
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-64">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white p-4 rounded-lg border-l-4 ${getNoteTypeColor(note.type)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {formatNoteType(note.type)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {note.timestamp}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-4 border-t">
          <Input
            placeholder="Type an internal note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSubmit}
            disabled={!newNote.trim()}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const getStayStatusColor = (status: StayStatus) => {
  switch (status) {
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

const formatStayStatus = (status: StayStatus) => {
  switch (status) {
    case "arriving_soon":
      return "Arriving Soon";
    case "checked_in":
      return "Checked In";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
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

const formatPaymentStatus = (status: PaymentStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatPaymentMode = (mode: PaymentMode) => {
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

const formatBookingSource = (source: BookingSource) => {
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

const getBookingSourceColor = (source: BookingSource) => {
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

const UpcomingStaysSection = ({
  stays,
  onAddNoteForStay,
}: {
  stays: UpcomingStay[];
  onAddNoteForStay: (stayId: string, guestName: string, note: string) => void;
}) => {
  const [editingStayId, setEditingStayId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const handleSaveNote = (stay: UpcomingStay) => {
    if (noteInput.trim()) {
      onAddNoteForStay(stay.id, stay.guestName, noteInput.trim());
      setNoteInput("");
      setEditingStayId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, stay: UpcomingStay) => {
    if (e.key === "Enter") {
      handleSaveNote(stay);
    } else if (e.key === "Escape") {
      setEditingStayId(null);
      setNoteInput("");
    }
  };

  return (
    <Card className="bg-slate-50 border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Upcoming Stays</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200">
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Reservation ID
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Guest
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Phone
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Email
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap text-center">
                  People
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap text-right">
                  Amount
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Payment ID
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Type
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Check In
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Check Out
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Payment Status
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Payment Mode
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
                  Sp. Req.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stays.map((stay) => (
                <TableRow key={stay.id} className="border-b border-slate-100">
                  <TableCell className="font-mono text-sm whitespace-nowrap">
                    {stay.reservationId}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {stay.guestName}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {stay.phone}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {stay.email}
                  </TableCell>
                  <TableCell className="text-center">{stay.people}</TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">
                    {formatPrice(stay.amount)}
                  </TableCell>
                  <TableCell className="font-mono text-sm whitespace-nowrap">
                    {stay.paymentId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getBookingSourceColor(stay.bookingSource)} text-xs whitespace-nowrap`}
                    >
                      {formatBookingSource(stay.bookingSource)}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{stay.checkIn}</TableCell>
                  <TableCell className="whitespace-nowrap">{stay.checkOut}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStayStatusColor(stay.status)} text-xs whitespace-nowrap`}
                    >
                      {formatStayStatus(stay.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getPaymentStatusColor(stay.paymentStatus)} text-xs whitespace-nowrap`}
                    >
                      {formatPaymentStatus(stay.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatPaymentMode(stay.paymentMode)}
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {editingStayId === stay.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, stay)}
                          placeholder="Add note..."
                          className="h-7 text-sm min-w-[120px]"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleSaveNote(stay)}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm truncate"
                          title={stay.specialRequirements}
                        >
                          {stay.specialRequirements || "—"}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => {
                            setEditingStayId(stay.id);
                            setNoteInput(stay.specialRequirements || "");
                          }}
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const RoomsTable = ({
  rooms,
  onViewDashboard,
}: {
  rooms: RoomCardItem[];
  onViewDashboard: (roomId: string) => void;
}) => {
  return (
    <Card className="bg-slate-50 border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Rooms Inventory</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Room No.
              </TableHead>
              <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Type
              </TableHead>
              <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Status
              </TableHead>
              <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Details
              </TableHead>
              <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Guest
              </TableHead>
              <TableHead className="text-xs text-muted-foreground uppercase tracking-wider font-medium text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow
                key={room.id}
                className="border-b border-slate-100 cursor-pointer hover:bg-slate-100"
                onClick={() => onViewDashboard(room.id)}
              >
                <TableCell className="font-bold text-lg">
                  #{room.roomNumber}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground uppercase tracking-wider">
                  {room.type}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(room.status)} text-xs`}>
                    {formatStatus(room.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {room.statusIcon && getStatusIcon(room.statusIcon)}
                    <span>{room.statusDescription}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {room.guestName || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDashboard(room.id);
                    }}
                  >
                    View Dashboard
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

interface RoomCategoryViewProps {
  categoryId: string;
}

const RoomCategoryView = ({ categoryId }: RoomCategoryViewProps) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(
    categoryId as CategoryTab,
  );

  const currentCategoryId =
    activeCategory === "all" ? "deluxe-suite" : activeCategory;

  const categoryData = getCategoryData(currentCategoryId);
  const categoryStats = getCategoryById(currentCategoryId);
  const weeklyPerformance = getWeeklyPerformance(currentCategoryId);
  const initialStaffNotes = getStaffNotes(currentCategoryId);
  const upcomingStays = getUpcomingStays(currentCategoryId);

  const [staffNotes, setStaffNotes] = useState<StaffNote[]>(initialStaffNotes);

  React.useEffect(() => {
    setStaffNotes(getStaffNotes(currentCategoryId));
  }, [currentCategoryId]);

  if (!categoryData || !categoryStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const { categoryInfo, rooms } = categoryData;

  const roomsInCategory = getRoomListByCategory(currentCategoryId);
  const avgDailyRevenue =
    roomsInCategory.length > 0
      ? roomsInCategory.reduce((sum, room) => sum + room.pricePerNight, 0) /
        roomsInCategory.length
      : 0;

  const handleViewDashboard = (roomId: string) => {
    router.push(`/new/room/${roomId}`);
  };

  const handleCategoryChange = (tabId: string) => {
    setActiveCategory(tabId as CategoryTab);
    if (tabId !== "all") {
      router.push(`/new/category/${tabId}`);
    } else {
      router.push("/new");
    }
  };

  const handleBulkAction = () => {
    console.log(
      "Bulk action triggered for rooms:",
      rooms.map((r) => r.id),
    );
  };

  const handleAddNote = (content: string) => {
    const newNote: StaffNote = {
      id: `note-${Date.now()}`,
      type: "general",
      content,
      timestamp: "Just now",
      author: "You",
    };
    setStaffNotes((prev) => [newNote, ...prev]);
  };

  const handleAddNoteForStay = (_stayId: string, guestName: string, note: string) => {
    const newNote: StaffNote = {
      id: `note-stay-${Date.now()}`,
      type: "concierge",
      content: `[${guestName}] ${note}`,
      timestamp: "Just now",
      author: "You",
    };
    setStaffNotes((prev) => [newNote, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground uppercase tracking-wider">
        {categoryInfo.breadcrumb.parent} &gt; {categoryInfo.breadcrumb.current}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          <span className="font-bold">{categoryInfo.displayName}</span>{" "}
          <span className="font-light text-muted-foreground">Category</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Rooms
          </Button>
          <Button className="gap-2" onClick={handleBulkAction}>
            <Plus className="h-4 w-4" />
            Bulk Action
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
                ? "text-white bg-primary shadow-sm"
                : "hover:bg-slate-200"
            }`}
            onClick={() => handleCategoryChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OccupancyRateCard category={categoryStats} />
        <DailyRevenueCard avgRevenue={avgDailyRevenue} />
        <SuiteAvailabilityMatrix category={categoryStats} />
      </div>

      {/* Performance Chart and Staff Notes */}
      <div className="flex items-center gap-8">
        <PerformanceInsightChart data={weeklyPerformance} />
        <StaffNotesSection notes={staffNotes} onAddNote={handleAddNote} />
      </div>

      {/* Upcoming Stays */}
      <UpcomingStaysSection stays={upcomingStays} onAddNoteForStay={handleAddNoteForStay} />

      {/* Rooms Table */}
      <RoomsTable rooms={rooms} onViewDashboard={handleViewDashboard} />

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => console.log("Add new room to category")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default RoomCategoryView;
