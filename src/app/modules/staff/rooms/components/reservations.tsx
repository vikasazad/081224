"use client";
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { getReservationsInRange } from "../../utils/staffData";
import {
  CalendarIcon,
  Search,
  Users,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Guest {
  id: string;
  name: string;
}

interface Reservation {
  bookingId: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  email: string;
  name: string;
  nights: number;
  numberOfGuests: string;
  paymentMode: string;
  phone: string;
  roomCategory: string;
  guests: Guest[];
}

interface GroupedReservations {
  [date: string]: Reservation[];
}

const Reservations = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const result = await getReservationsInRange(
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (result === null) {
        toast.error("Failed to fetch reservations");
        setReservations([]);
      } else {
        setReservations(result);
        if (result.length === 0) {
          toast.info("No reservations found in the selected date range");
        } else {
          toast.success(`Found ${result.length} reservation(s)`);
        }
      }
    } catch (error) {
      console.error("Error searching reservations:", error);
      toast.error("An error occurred while searching");
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group reservations by check-in date
  const groupReservationsByDate = (): GroupedReservations => {
    const grouped: GroupedReservations = {};

    reservations.forEach((reservation) => {
      const dateKey = new Date(reservation.checkIn).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(reservation);
    });

    return grouped;
  };

  const groupedReservations = groupReservationsByDate();

  return (
    <div className="space-y-4">
      <div className=" mx-auto">
        <div className=" mb-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/reservation")}
            >
              New Reservation
            </Button>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-6 mt-2">
            <div className="flex items-center justify-between gap-6">
              {/* Start Date */}
              <div className=" w-full flex items-center  justify-between gap-2">
                <div className="space-y-2 w-full">
                  <Label className="font-semibold">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2 w-full">
                  <Label className="font-semibold">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) =>
                          startDate
                            ? date < startDate
                            : date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Search Button */}
              <div className="self-end">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !startDate || !endDate}
                  className="bg-gray-900 hover:bg-gray-800 px-8 py-4"
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Search Reservations
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6">
            {Object.keys(groupedReservations).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Reservations Found
                  </h3>
                  <p className="text-gray-500">
                    There are no reservations in the selected date range.
                  </p>
                </div>
              </div>
            ) : (
              Object.entries(groupedReservations)
                .sort(
                  ([dateA], [dateB]) =>
                    new Date(dateA).getTime() - new Date(dateB).getTime()
                )
                .map(([date, dateReservations]) => (
                  <div
                    key={date}
                    className="bg-white rounded-lg shadow-sm border"
                  >
                    {/* Date Header */}
                    <div className="bg-gray-900 text-white px-6 py-4 rounded-t-lg">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {date}
                      </h2>
                      <p className="text-gray-300 text-sm mt-1">
                        {dateReservations.length}{" "}
                        {dateReservations.length === 1
                          ? "reservation"
                          : "reservations"}
                      </p>
                    </div>

                    {/* Reservations List */}
                    <div className="divide-y">
                      {dateReservations.map((reservation) => (
                        <div
                          key={reservation.bookingId}
                          className="p-6 hover:bg-gray-50 transition"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            {/* Left Section - Guest Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {reservation.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 font-mono">
                                    {reservation.bookingId}
                                  </p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                  {reservation.roomCategory}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  <span>{reservation.phone}</span>
                                </div>
                                {reservation.email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">
                                      {reservation.email}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {reservation.numberOfGuests}{" "}
                                    {parseInt(reservation.numberOfGuests) === 1
                                      ? "Guest"
                                      : "Guests"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="capitalize">
                                    {reservation.paymentMode}
                                  </span>
                                </div>
                              </div>

                              {/* Guest Names */}
                              {reservation.guests &&
                                reservation.guests.length > 0 && (
                                  <div className="pt-2">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">
                                      Guests:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {reservation.guests.map((guest) => (
                                        <span
                                          key={guest.id}
                                          className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                        >
                                          {guest.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Right Section - Stay Details */}
                            <div className="lg:text-right space-y-2">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-700">
                                  Check-out
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    reservation.checkOut
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                  {reservation.nights}{" "}
                                  {reservation.nights === 1
                                    ? "Night"
                                    : "Nights"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
