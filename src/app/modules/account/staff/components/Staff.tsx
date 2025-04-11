"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface StaffMember {
  name: string;
  email: string;
  contact: string;
  role: string;
  status: string;
  shift: string;
  shiftDetails: {
    start: string;
    end: string;
  };
  orders: string[];
}

interface StaffManagementProps {
  data: StaffMember[];
}

export default function StaffManagement({
  data: initialData,
}: StaffManagementProps) {
  const [data, setData] = useState<StaffMember[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [shiftTimes, setShiftTimes] = useState({
    startTime: "",
    startPeriod: "AM",
    endTime: "",
    endPeriod: "AM",
  });
  const [error, setError] = useState("");

  const roles = [
    "All",
    ...Array.from(new Set(data.map((staff) => staff.role))),
  ];

  const filteredStaff = data.filter(
    (staff) =>
      (staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === "All" || staff.role === selectedRole) &&
      (selectedStatus === "All" || staff.status === selectedStatus)
  );

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatShiftTime = (timeString: string) => {
    const date = new Date(JSON.parse(timeString));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleShiftChange = (staff: StaffMember, newShift: string) => {
    setSelectedStaff(staff);
    setShiftTimes({
      startTime: "",
      startPeriod: "AM",
      endTime: "",
      endPeriod: "AM",
    });
    setError("");

    const updatedData = data.map((s) =>
      s.email === staff.email
        ? {
            ...s,
            shift: newShift,
          }
        : s
    );
    setData(updatedData);

    setIsDialogOpen(true);
  };

  const validateTime = (time: string) => {
    if (!time) return false;
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours);
    const minutesNum = parseInt(minutes);
    return (
      hoursNum >= 0 && hoursNum <= 12 && minutesNum >= 0 && minutesNum < 60
    );
  };

  const handleSaveShiftTimes = () => {
    if (
      !validateTime(shiftTimes.startTime) ||
      !validateTime(shiftTimes.endTime)
    ) {
      setError("Please enter valid times in HH:MM format (00:00 - 12:00)");
      return;
    }

    if (!selectedStaff) return;

    const formatTimeForStorage = (time: string, period: string) => {
      const [hours, minutes] = time.split(":");
      let hoursNum = parseInt(hours);
      if (period === "PM" && hoursNum !== 12) hoursNum += 12;
      if (period === "AM" && hoursNum === 12) hoursNum = 0;
      return JSON.stringify(
        new Date(2024, 0, 1, hoursNum, parseInt(minutes)).toISOString()
      );
    };

    const newShiftDetails = {
      start: formatTimeForStorage(shiftTimes.startTime, shiftTimes.startPeriod),
      end: formatTimeForStorage(shiftTimes.endTime, shiftTimes.endPeriod),
    };

    const updatedData = data.map((staff) =>
      staff.email === selectedStaff.email
        ? {
            ...staff,
            shiftDetails: newShiftDetails,
          }
        : staff
    );

    setData(updatedData);

    console.log(
      "Saving shift details for",
      selectedStaff.email,
      newShiftDetails
    );

    setIsDialogOpen(false);
  };

  return (
    <>
      <Card className="max-w-6xl mx-8 my-8">
        <div className="space-y-4 p-4">
          <h2 className="text-2xl font-bold">Staff Management</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Shift Details</TableHead>
                  <TableHead>Current Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.contact}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          staff.status === "online"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={staff.shift}
                        onValueChange={(value) =>
                          handleShiftChange(staff, value)
                        }
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {formatShiftTime(staff.shiftDetails.start)} -{" "}
                      {formatShiftTime(staff.shiftDetails.end)}
                    </TableCell>
                    <TableCell>{staff.orders.join(", ") || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Shift Timings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={shiftTimes.startTime}
                  onChange={(e) =>
                    setShiftTimes({ ...shiftTimes, startTime: e.target.value })
                  }
                  className="w-[150px]"
                />
                <Select
                  value={shiftTimes.startPeriod}
                  onValueChange={(value) =>
                    setShiftTimes({ ...shiftTimes, startPeriod: value })
                  }
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={shiftTimes.endTime}
                  onChange={(e) =>
                    setShiftTimes({ ...shiftTimes, endTime: e.target.value })
                  }
                  className="w-[150px]"
                />
                <Select
                  value={shiftTimes.endPeriod}
                  onValueChange={(value) =>
                    setShiftTimes({ ...shiftTimes, endPeriod: value })
                  }
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveShiftTimes}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
