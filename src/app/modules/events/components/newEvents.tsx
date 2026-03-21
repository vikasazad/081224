"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import {
  createEventBooking,
  getAllStaffForDropdown,
  getEventsInRange,
} from "../utils/eventsApi";
import {
  CalendarIcon,
  Search,
  X,
  Check,
  Plus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface StaffOption {
  name: string;
  contact: string;
  role: string;
}

interface MenuItemType {
  id: string;
  name: string;
  price: Record<string, string>;
  nature: string;
  categoryName: string;
  portion: string;
  description?: string;
  images?: string[];
  tags?: string[];
  cuisineName?: string;
  discountType?: string;
  discountAmount?: string;
}

interface MenuCategory {
  categoryId: string;
  categoryName: string;
  items: MenuItemType[];
}

const NewEvents = ({
  menu,
  menuPackages,
  settings,
  businessInfo,
}: {
  menu: any;
  menuPackages: any;
  settings: any;
  businessInfo: any;
}) => {
  // console.log('MENU PACKAGES', menu);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form state - Step 1
  const [eventType, setEventType] = useState<string>("");
  const [venue, setVenue] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [relationshipManager, setRelationshipManager] = useState("");

  // Field error states
  const [errors, setErrors] = useState<{
    eventType?: string;
    venue?: string;
    name?: string;
    phone?: string;
    numberOfPeople?: string;
    startDate?: string;
    endDate?: string;
    relationshipManager?: string;
  }>({});

  // Form state - Step 2
  const [foodNature, setFoodNature] = useState<"veg" | "nonveg" | "mixed">(
    settings.enabledFoodOptions?.[0] || "veg",
  );
  const [pricePerPlate, setPricePerPlate] = useState<number>(
    Object.keys(menuPackages || {})[0]
      ? parseInt(Object.keys(menuPackages)[0])
      : 1000,
  );
  const [paymentType, setPaymentType] = useState<"cash" | "online">("online");

  // Advance payment state
  const [advancePercentage, setAdvancePercentage] = useState<number>(20);
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [customAdvanceAmount, setCustomAdvanceAmount] = useState<string>("");

  // Menu state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [menuSearchTerm, setMenuSearchTerm] = useState("");

  // Load staff list on mount
  useEffect(() => {
    const loadStaff = async () => {
      const staff = await getAllStaffForDropdown();
      console.log("STAFF", staff);
      setStaffList(staff);
    };
    loadStaff();
  }, []);

  // Get available price options from menuPackages
  const priceOptions = useMemo(() => {
    return Object.keys(menuPackages || {})
      .map((p) => parseInt(p))
      .sort((a, b) => a - b);
  }, [menuPackages]);

  // Get package menu items based on price and food nature (for pre-selection)
  const packageMenuItems = useMemo(() => {
    const priceKey = pricePerPlate.toString();
    const packageMenu = menuPackages?.[priceKey]?.[foodNature]?.menu || [];
    const itemIds = new Set<string>();
    packageMenu.forEach((cat: MenuCategory) => {
      cat.items.forEach((item) => {
        itemIds.add(item.id);
      });
    });
    return itemIds;
  }, [menuPackages, pricePerPlate, foodNature]);

  // Get all categories from menu prop
  const categories = useMemo(() => {
    return (menu?.categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
    }));
  }, [menu]);

  // Flatten all items from menu.categories for display
  const allMenuItems = useMemo(() => {
    const items: (MenuItemType & { categoryId: string })[] = [];
    (menu?.categories || []).forEach((cat: any) => {
      (cat.menuItems || []).forEach((item: any) => {
        items.push({
          ...item,
          categoryId: cat.id,
          categoryName: item.categoryName || cat.name,
        });
      });
    });
    return items;
  }, [menu]);

  // Filter items based on category and search
  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch =
        !menuSearchTerm ||
        item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
        item.categoryName?.toLowerCase().includes(menuSearchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allMenuItems, activeCategory, menuSearchTerm]);

  // Get selected items as array
  const selectedMenuItems = useMemo(() => {
    return allMenuItems.filter((item) => selectedItems.has(item.id));
  }, [allMenuItems, selectedItems]);

  // Group selected items by category
  const groupedSelectedItems = useMemo(() => {
    const grouped: Record<string, (MenuItemType & { categoryId: string })[]> =
      {};
    selectedMenuItems.forEach((item) => {
      const catName = item.categoryName || "Other";
      if (!grouped[catName]) {
        grouped[catName] = [];
      }
      grouped[catName].push(item);
    });
    return grouped;
  }, [selectedMenuItems]);

  // Auto-select items from package when food nature or price changes
  useEffect(() => {
    setSelectedItems(new Set(packageMenuItems));
    setActiveCategory("all");
    setMenuSearchTerm("");
  }, [foodNature, pricePerPlate, packageMenuItems]);

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const removeSelectedItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
  };

  const getItemDisplayPrice = (item: MenuItemType): string => {
    const prices = Object.values(item.price || {});
    if (prices.length === 0) return "0";
    // Return the first price value
    return prices[0].replace(/[^\d.]/g, "");
  };

  const getSelectedVenue = () => {
    return settings.venues?.find((v: any) => v.id === venue);
  };

  const getSelectedManager = () => {
    return staffList.find((s) => s.contact === relationshipManager);
  };

  const calculateEstimate = () => {
    const people = parseInt(numberOfPeople) || 0;
    return people * pricePerPlate;
  };

  const calculateAdvanceAmount = () => {
    return Math.round(calculateEstimate() * (advancePercentage / 100));
  };

  const handleAdvancePopupOpen = () => {
    setCustomAdvanceAmount(calculateAdvanceAmount().toString());
    setShowAdvancePopup(true);
  };

  const handleSaveCustomAdvance = () => {
    const amount = parseInt(customAdvanceAmount) || 0;
    const total = calculateEstimate();
    if (total > 0 && amount > 0) {
      const percentage = Math.round((amount / total) * 100);
      setAdvancePercentage(Math.min(percentage, 100)); // Cap at 100%
    }
    setShowAdvancePopup(false);
  };

  // Step 1 validation - validates all fields and returns true if valid
  const isStep1Valid = (): boolean => {
    return !!(
      eventType &&
      venue &&
      name.trim() &&
      phone.trim() &&
      numberOfPeople &&
      parseInt(numberOfPeople) > 0 &&
      startDate &&
      endDate &&
      relationshipManager
    );
  };

  // Validate all fields and set error messages
  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};

    if (!eventType) {
      newErrors.eventType = "Please select an event type";
    }
    if (!venue) {
      newErrors.venue = "Please select a venue";
    }
    if (!name.trim()) {
      newErrors.name = "Please enter the name";
    }
    if (!phone.trim()) {
      newErrors.phone = "Please enter phone number";
    }
    if (!numberOfPeople || parseInt(numberOfPeople) <= 0) {
      newErrors.numberOfPeople = "Please enter number of people";
    }
    if (!startDate) {
      newErrors.startDate = "Please select start date";
    }
    if (!endDate) {
      newErrors.endDate = "Please select end date";
    }
    if (!relationshipManager) {
      newErrors.relationshipManager = "Please select a relationship manager";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear individual field error when user starts typing/selecting
  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNextStep = async () => {
    if (!validateStep1() || !isStep1Valid()) {
      return;
    }

    // Check venue availability
    setIsCheckingAvailability(true);

    try {
      const existingEvents = await getEventsInRange(
        startDate!.toISOString(),
        endDate!.toISOString(),
      );

      if (existingEvents && existingEvents.length > 0) {
        // Check if any existing event has the same venue
        const selectedVenue = getSelectedVenue();
        const conflictingEvent = existingEvents.find(
          (event: any) => event.venue?.name === selectedVenue?.name,
        );

        if (conflictingEvent) {
          toast.error(
            `Venue "${selectedVenue?.name}" is not available for the selected dates. Already booked for another event.`,
          );
          setIsCheckingAvailability(false);
          return;
        }
      }

      // No conflicts, proceed to next step
      setCurrentStep(2);
    } catch (error) {
      console.error("Error checking venue availability:", error);
      toast.error("Failed to check venue availability. Please try again.");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one menu item");
      return;
    }

    setIsLoading(true);

    try {
      const selectedVenue = getSelectedVenue();
      const selectedManager = getSelectedManager();
      const advanceAmount = calculateAdvanceAmount();
      const totalAmount = calculateEstimate();

      const eventData: any = {
        eventType,
        venue: {
          name: selectedVenue?.name || "",
          price: selectedVenue?.price || 0,
        },
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || "",
        numberOfPeople: parseInt(numberOfPeople),
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        relationshipManager: {
          name: selectedManager!.name,
          contact: selectedManager!.contact,
        },
        foodNature,
        pricePerPlate,
        paymentMode: paymentType,
        menu: groupedSelectedItems,
        advanceAmount,
        totalAmount,
        balanceAmount: totalAmount - advanceAmount,
        businessInfo,
      };

      console.log("=== EVENT BOOKING DATA ===");
      console.log(eventData);

      const result: any = await createEventBooking(eventData);
      // console.log("=== EVENT BOOKING RESULT ===");
      // console.log(result);

      if (result.success) {
        toast.success("Event created successfully!");
        // if (result.event?.payment?.paymentLinkUrl) {
        //   toast.info(
        //     "Payment link generated: " + result.event.payment.paymentLinkUrl
        //   );
        // }
        router.push("/events");
      } else {
        toast.error(result.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("An error occurred while creating the event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    toast.info("Draft saving functionality coming soon");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              currentStep === 1 ? router.push("/events") : handleBackStep()
            }
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            New Event Booking
          </h1>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                currentStep >= 1
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-500",
              )}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span
              className={cn(
                "font-medium",
                currentStep >= 1 ? "text-gray-900" : "text-gray-500",
              )}
            >
              Event Details
            </span>
          </div>

          {/* Connector */}
          <div
            className={cn(
              "w-24 h-0.5 transition-colors",
              currentStep > 1 ? "bg-gray-900" : "bg-gray-200",
            )}
          />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                currentStep >= 2
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-500",
              )}
            >
              2
            </div>
            <span
              className={cn(
                "font-medium",
                currentStep >= 2 ? "text-gray-900" : "text-gray-500",
              )}
            >
              Menu Selection
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Event Details */}
      {currentStep === 1 && (
        <div className="px-6 pb-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-6">Event Details</h2>

            <div className="grid grid-cols-3 gap-6">
              {/* Event Type */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={eventType}
                  onValueChange={(value) => {
                    setEventType(value);
                    clearError("eventType");
                  }}
                >
                  <SelectTrigger
                    className={errors.eventType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.enabledEventTypes?.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventType && (
                  <p className="text-red-500 text-sm">{errors.eventType}</p>
                )}
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Venue <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={venue}
                  onValueChange={(value) => {
                    setVenue(value);
                    clearError("venue");
                  }}
                >
                  <SelectTrigger
                    className={errors.venue ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.venues?.map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.venue && (
                  <p className="text-red-500 text-sm">{errors.venue}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Name / Organization <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter name or organization"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError("phone");
                  }}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="font-semibold">Email (Optional)</Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Number of People */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Number of People <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Enter number of guests"
                  value={numberOfPeople}
                  onChange={(e) => {
                    setNumberOfPeople(e.target.value);
                    clearError("numberOfPeople");
                  }}
                  min="1"
                  className={errors.numberOfPeople ? "border-red-500" : ""}
                />
                {errors.numberOfPeople && (
                  <p className="text-red-500 text-sm">
                    {errors.numberOfPeople}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
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
                        errors.startDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        clearError("startDate");
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-red-500 text-sm">{errors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
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
                        errors.endDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        clearError("endDate");
                      }}
                      disabled={(date) =>
                        startDate
                          ? date < startDate
                          : date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-red-500 text-sm">{errors.endDate}</p>
                )}
              </div>

              {/* Relationship Manager */}
              <div className="space-y-2">
                <Label className="font-semibold">
                  Relationship Manager <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={relationshipManager}
                  onValueChange={(value) => {
                    setRelationshipManager(value);
                    clearError("relationshipManager");
                  }}
                >
                  <SelectTrigger
                    className={
                      errors.relationshipManager ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.contact} value={staff.contact}>
                        {staff.name} ({staff.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.relationshipManager && (
                  <p className="text-red-500 text-sm">
                    {errors.relationshipManager}
                  </p>
                )}
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleNextStep}
                disabled={!isStep1Valid() || isCheckingAvailability}
                className="bg-gray-900 hover:bg-gray-800 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingAvailability ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Checking Availability...
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Menu Selection */}
      {currentStep === 2 && (
        <div className="flex gap-6 px-6 pb-6">
          {/* Left Panel - Menu Items Grid (70%) */}
          <div className="w-[70%] bg-white rounded-lg shadow-sm border p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Select Menu Items</h2>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                {selectedItems.size} Selected
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  activeCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                All
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.categoryName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="font-semibold text-gray-900">
                          ₹{getItemDisplayPrice(item)}
                        </span>
                        <div className="mt-2">
                          {isSelected ? (
                            <Check className="h-5 w-5 text-gray-900" />
                          ) : (
                            <Plus className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No menu items found
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Booking Summary (30%) */}
          <div className="w-[30%] bg-gray-900 text-white rounded-lg shadow-sm p-6 h-fit sticky top-6">
            <h2 className="text-lg font-semibold mb-1">Booking Summary</h2>
            <p className="text-gray-400 text-sm mb-6">Review your selections</p>

            {/* Control Selects */}
            <div className="space-y-4 mb-6">
              {/* Price Per Plate */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Price Per Plate</Label>
                <Select
                  value={pricePerPlate.toString()}
                  onValueChange={(value) => setPricePerPlate(parseInt(value))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceOptions.map((price) => (
                      <SelectItem key={price} value={price.toString()}>
                        ₹{price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Food Nature */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Food Type</Label>
                <Select
                  value={foodNature}
                  onValueChange={(value: "veg" | "nonveg" | "mixed") =>
                    setFoodNature(value)
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select food type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Veg</SelectItem>
                    <SelectItem value="nonveg">Non-Veg</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Payment Type */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Payment Type</Label>
                <Select
                  value={paymentType}
                  onValueChange={(value: "cash" | "online") =>
                    setPaymentType(value)
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Items */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Selected Items
              </h3>
              <div className="space-y-3">
                {Object.entries(groupedSelectedItems).map(
                  ([category, items]) => (
                    <div key={category}>
                      <p className="text-xs text-gray-500 mb-1.5">{category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-800 rounded-full text-xs"
                          >
                            <span className="text-white truncate max-w-[100px]">
                              {item.name}
                            </span>
                            <button
                              onClick={() => removeSelectedItem(item.id)}
                              className="text-gray-400 hover:text-white flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}

                {selectedItems.size === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 w-full">
                    No items selected
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Per Plate</span>
                <span className="font-semibold">
                  ₹{pricePerPlate.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {numberOfPeople || 0} Guests
                </span>
                <span className="font-semibold">
                  ₹{calculateEstimate().toLocaleString()}
                </span>
              </div>
              <div
                className="flex justify-between text-sm cursor-pointer hover:bg-gray-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                onClick={handleAdvancePopupOpen}
              >
                <span className="text-gray-400 flex items-center gap-1">
                  Advance ({advancePercentage}%)
                  <span className="text-xs text-gray-500">✎</span>
                </span>
                <span className="font-semibold">
                  ₹{calculateAdvanceAmount().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-white text-primary px-4 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="w-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-4 py-3 rounded-lg font-semibold "
              >
                Save as Draft
              </Button>
            </div>

            {/* Notes */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• All prices are per person</li>
                <li>• Minimum 50 guests required</li>
                <li>• Advance payment is {advancePercentage}%</li>
              </ul>
            </div>
          </div>

          {/* Custom Advance Amount Dialog */}
          <Dialog open={showAdvancePopup} onOpenChange={setShowAdvancePopup}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Custom Advance Amount</DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <div className="text-2xl font-bold">
                    ₹{calculateEstimate().toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customAdvance">Enter Advance Amount</Label>
                  <Input
                    id="customAdvance"
                    type="number"
                    placeholder="Enter amount"
                    value={customAdvanceAmount}
                    onChange={(e) => setCustomAdvanceAmount(e.target.value)}
                    min="0"
                    max={calculateEstimate()}
                  />
                  {customAdvanceAmount && calculateEstimate() > 0 && (
                    <p className="text-sm text-gray-500">
                      This is{" "}
                      {Math.round(
                        (parseInt(customAdvanceAmount) / calculateEstimate()) *
                          100,
                      )}
                      % of total amount
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancePopup(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveCustomAdvance}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default NewEvents;
