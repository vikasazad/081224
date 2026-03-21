"use client";
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import {
  CalendarIcon,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Utensils,
  User,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { EventBooking } from "../utils/eventTypes";
import { getEventsInRange } from "../utils/eventsApi";

interface GroupedEvents {
  [date: string]: EventBooking[];
}

const SearchEvents = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  });
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const getMenuItemsCount = (menu: EventBooking["menu"]) => {
    if (!menu || typeof menu !== "object") return 0;
    return Object.values(menu).reduce(
      (total, items) => total + (Array.isArray(items) ? items.length : 0),
      0,
    );
  };

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

    try {
      const result = await getEventsInRange(
        startDate.toISOString(),
        endDate.toISOString(),
      );

      if (result === null) {
        toast.error("Failed to fetch events");
        setEvents([]);
      } else {
        setHasSearched(true);
        setEvents(result);
        console.log("EVENTS", result);
        if (result.length === 0) {
          toast.info("No events found in the selected date range");
        } else {
          toast.success(`Found ${result.length} event(s)`);
        }
      }
    } catch (error) {
      console.error("Error searching events:", error);
      toast.error("An error occurred while searching");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupEventsByDate = (): GroupedEvents => {
    const grouped: GroupedEvents = {};

    events.forEach((event) => {
      const dateKey = new Date(event.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate();

  const getFoodNatureLabel = (nature: string) => {
    switch (nature) {
      case "veg":
        return "Vegetarian";
      case "nonveg":
        return "Non-Vegetarian";
      case "mixed":
        return "Mixed";
      default:
        return nature;
    }
  };

  const getFoodNatureColor = (nature: string) => {
    switch (nature) {
      case "veg":
        return "bg-green-100 text-green-800";
      case "nonveg":
        return "bg-red-100 text-red-800";
      case "mixed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 py-4 px-8">
      <div className="mx-auto">
        <div className="mb-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/events/new")}
            >
              New Event
            </Button>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-6 mt-2">
            <div className="flex items-center justify-between gap-6">
              {/* Start Date */}
              <div className="w-full flex items-center justify-between gap-2">
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
                          !startDate && "text-muted-foreground",
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
                          !endDate && "text-muted-foreground",
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
                          startDate ? date < startDate : false
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
                      Search Events
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
            {Object.keys(groupedEvents).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Events Found
                  </h3>
                  <p className="text-gray-500">
                    There are no events in the selected date range.
                  </p>
                </div>
              </div>
            ) : (
              Object.entries(groupedEvents)
                .sort(
                  ([dateA], [dateB]) =>
                    new Date(dateA).getTime() - new Date(dateB).getTime(),
                )
                .map(([date, dateEvents]) => (
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
                        {dateEvents.length}{" "}
                        {dateEvents.length === 1 ? "event" : "events"}
                      </p>
                    </div>

                    {/* Events List */}
                    <div className="divide-y">
                      {dateEvents.map((event) => (
                        <div
                          key={event.eventId}
                          className="p-6 hover:bg-gray-50 transition"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            {/* Left Section - Event Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {event.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 font-mono">
                                    {event.eventId}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    {event.eventType}
                                  </span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                                      getFoodNatureColor(event.foodNature),
                                    )}
                                  >
                                    {getFoodNatureLabel(event.foodNature)}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  <span>{event.phone}</span>
                                </div>
                                {event.email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">
                                      {event.email}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {event.numberOfPeople}{" "}
                                    {event.numberOfPeople === 1
                                      ? "Guest"
                                      : "Guests"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{event.venue.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Utensils className="h-4 w-4" />
                                  <span>₹{event.pricePerPlate}/plate</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="h-4 w-4" />
                                  <span>
                                    Manager: {event.relationshipManager.name}
                                  </span>
                                </div>
                              </div>

                              {/* Menu Section */}
                              {event.menu &&
                                typeof event.menu === "object" &&
                                getMenuItemsCount(event.menu) > 0 && (
                                  <div className="pt-3 border-t mt-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                      <Utensils className="h-4 w-4" />
                                      <span>Menu</span>
                                    </div>
                                    <div className="space-y-3">
                                      {Object.entries(event.menu)
                                        .filter(
                                          ([, items]) =>
                                            Array.isArray(items) &&
                                            items.length > 0,
                                        )
                                        .map(([category, items]) => (
                                          <div
                                            key={category}
                                            className="flex flex-wrap items-center gap-2"
                                          >
                                            <span className="text-xs font-semibold text-gray-600 min-w-fit">
                                              {category}:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {items.map((item) => (
                                                <span
                                                  key={item.id}
                                                  className={cn(
                                                    "inline-flex items-center text-xs px-2.5 py-1 rounded-full border",
                                                    item.nature?.toLowerCase() ===
                                                      "veg"
                                                      ? "bg-green-50 text-green-700 border-green-200"
                                                      : item.nature?.toLowerCase() ===
                                                          "nonveg"
                                                        ? "bg-red-50 text-red-700 border-red-200"
                                                        : "bg-gray-50 text-gray-700 border-gray-200",
                                                  )}
                                                >
                                                  {item.name}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Right Section - Date & Payment Details */}
                            <div className="lg:text-right space-y-2">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-700">
                                  End Date
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(event.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-700">
                                  Estimated Total
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  ₹
                                  {(
                                    event.numberOfPeople * event.pricePerPlate
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                                    event.payment.paymentStatus === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800",
                                  )}
                                >
                                  {event.payment.paymentStatus === "paid"
                                    ? "Paid"
                                    : "Pending"}
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

export default SearchEvents;
