"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import {
  addReservation,
  checkRoomAvailability,
  updateReservationPaymentStatus,
} from "../../staff/utils/staffData";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface RoomDetail {
  category: string;
  price: number;
  rooms: number;
}

interface ReservationProps {
  details: RoomDetail[];
  businessInfo: any;
}

const NewReservation = ({ details, businessInfo }: ReservationProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [availabilityResult, setAvailabilityResult] = useState<{
    available: boolean;
    maxOccupied: number;
    minVacant: number;
  } | null>(null);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // const defaultCategory = details?.[0]?.category || "";

  const [reservationDetails, setReservationDetails] = useState<any>({
    name: "",
    phone: "",
    email: "",
    checkIn: today,
    checkOut: tomorrow,
    numberOfGuests: "2",
    roomCategory: "",
    numberOfRooms: "1",
    paymentMode: "online",
  });

  const [errors, setErrors] = useState<any>({});

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setReservationDetails((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    // Reset availability when search criteria changes
    if (
      ["roomCategory", "checkIn", "checkOut", "numberOfRooms"].includes(field)
    ) {
      setStep(1);
      setAvailabilityResult(null);
    }
  };

  // Get selected room details
  const getSelectedRoomDetails = () => {
    return details?.find(
      (room: RoomDetail) => room.category === reservationDetails.roomCategory
    );
  };

  // Handle check availability
  const handleCheckAvailability = async () => {
    const selectedRoom = getSelectedRoomDetails();
    if (!selectedRoom) {
      toast.error("Please select a room category");
      return;
    }

    if (!reservationDetails.checkIn || !reservationDetails.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    setIsCheckingAvailability(true);

    try {
      const result = await checkRoomAvailability(
        reservationDetails.checkIn.toISOString(),
        reservationDetails.checkOut.toISOString(),
        reservationDetails.roomCategory,
        selectedRoom.rooms,
        parseInt(reservationDetails.numberOfRooms)
      );

      if (result) {
        setAvailabilityResult(result);
        if (result.available) {
          setStep(2);
          toast.success(
            `${result.minVacant} room(s) available in ${reservationDetails.roomCategory} category`
          );
        } else {
          toast.error(
            `Only ${result.minVacant} room(s) available. You requested ${reservationDetails.numberOfRooms}.`
          );
        }
      } else {
        toast.error("Failed to check availability. Please try again.");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("An error occurred while checking availability");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const formErrors: any = {};
    if (!reservationDetails.name.trim()) formErrors.name = "Name is required";
    if (!reservationDetails.phone.trim())
      formErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(reservationDetails.phone))
      formErrors.phone = "Invalid phone number";
    if (
      reservationDetails.email.trim() &&
      !/\S+@\S+\.\S+/.test(reservationDetails.email)
    ) {
      formErrors.email = "Invalid email address";
    }
    if (!reservationDetails.checkIn)
      formErrors.checkIn = "Check-in date is required";
    if (!reservationDetails.checkOut)
      formErrors.checkOut = "Check-out date is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle payment mode change
  const handlePaymentModeChange = (mode: string) => {
    setReservationDetails((prevDetails: any) => ({
      ...prevDetails,
      paymentMode: mode,
    }));
  };

  // Check if all required fields are filled
  const isFormComplete = () => {
    return (
      reservationDetails.name.trim() !== "" &&
      reservationDetails.phone.trim() !== "" &&
      /^\d{10}$/.test(reservationDetails.phone) &&
      reservationDetails.checkIn &&
      reservationDetails.checkOut &&
      reservationDetails.roomCategory &&
      reservationDetails.numberOfRooms &&
      reservationDetails.paymentMode &&
      step === 2 &&
      availabilityResult?.available
    );
  };

  const generateRandomOrderNumber = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Handle form submit
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // const gst = calculateTax(price, price, "dining", businessInfo.gstTax);

      const date = new Date()
        .toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .replaceAll("/", "");

      const id = `RES:${date}:${generateRandomOrderNumber()}`;

      // Calculate nights
      const checkInDate = new Date(reservationDetails.checkIn);
      const checkOutDate = new Date(reservationDetails.checkOut);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      let nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      if (nights <= 0) nights = 1;

      // Create guests array
      const numberOfGuests = parseInt(reservationDetails.numberOfGuests);
      const guests = [];

      for (let i = 1; i <= numberOfGuests; i++) {
        const guestId = `G${i.toString().padStart(2, "0")}`;
        const guestName =
          i === 1
            ? reservationDetails.name
            : `Guest${i.toString().padStart(2, "0")}`;

        guests.push({
          id: guestId,
          name: guestName,
        });
      }

      const selectedRoom = getSelectedRoomDetails();
      const roomPrice = selectedRoom?.price || 0;
      const numberOfRooms = parseInt(reservationDetails.numberOfRooms);
      const totalAmount = roomPrice * nights * numberOfRooms;

      const reservationData = {
        ...reservationDetails,
        bookingId: id,
        guests,
        checkIn: reservationDetails.checkIn.toISOString(),
        checkOut: reservationDetails.checkOut.toISOString(),
        nights,
        numberOfRooms,
        roomPrice,
        totalAmount,
        createdAt: new Date().toISOString(),
        status: "pending",
        businessInfo: businessInfo || {},
      };

      // Simulate API call delay
      const response = await addReservation(reservationData);
      // console.log("RESPONSE", response);
      if (response) {
        console.log("Reservation added successfully", reservationData);
        toast.success("Reservation added successfully");
        router.push("/staff");
      } else {
        toast.error("Failed to add reservation");
      }

      setIsLoading(false);
    }
  };

  // const testfunction = async () => {
  //   console.log("TEST FUNCTION");
  //   const response = await updateReservationPaymentStatus({
  //     paymentLinkId: "plink_S3QFh4HXN2uJAE",
  //     referenceId: "PAY_1768320306836",
  //     amount: 1890,
  //     paymentId: "pay_S3QGB7fTgSUfZx",
  //     email: "void@razorpay.com",
  //     contact: "+918851280284",
  //     businessEmail: "vikumar.azad@gmail.com",
  //   });
  //   console.log("RESPONSE", response);
  // };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              New Guest Reservation
            </h1>
            <p className="text-gray-500 mt-2">
              {step === 1
                ? "Check room availability"
                : "Complete guest details"}
            </p>
          </div>

          {/* Step 1: Check Availability */}
          <div className="space-y-6">
            {/* Room Category */}
            <div>
              <Label className="font-semibold">
                Room Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reservationDetails.roomCategory}
                onValueChange={(value) =>
                  handleFormChange("roomCategory", value)
                }
                disabled={step === 2}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select room category" />
                </SelectTrigger>
                <SelectContent>
                  {details?.map((room: RoomDetail) => (
                    <SelectItem key={room.category} value={room.category}>
                      {room.category} - ₹{room.price}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in and Check-out Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold">
                  Check-in Date <span className="text-red-500">*</span>
                </Label>
                <Calendar
                  mode="single"
                  selected={reservationDetails.checkIn}
                  onSelect={(date) => handleFormChange("checkIn", date)}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || step === 2;
                  }}
                  className="rounded-md border"
                />
                {errors.checkIn && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkIn}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">
                  Check-out Date <span className="text-red-500">*</span>
                </Label>
                <Calendar
                  mode="single"
                  selected={reservationDetails.checkOut}
                  onSelect={(date) => handleFormChange("checkOut", date)}
                  disabled={(date) => {
                    return date <= reservationDetails.checkIn || step === 2;
                  }}
                  className="rounded-md border"
                />
                {errors.checkOut && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkOut}</p>
                )}
              </div>
            </div>

            {/* Number of Rooms */}
            <div>
              <Label className="font-semibold">
                Number of Rooms <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reservationDetails.numberOfRooms}
                onValueChange={(value) =>
                  handleFormChange("numberOfRooms", value)
                }
                disabled={step === 2}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select number of rooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Room" : "Rooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability Result Display */}
            {availabilityResult && (
              <div
                className={`p-4 rounded-lg border ${
                  availabilityResult.available
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {availabilityResult.available ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      availabilityResult.available
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {availabilityResult.available
                      ? `${availabilityResult.minVacant} room(s) available`
                      : `Only ${availabilityResult.minVacant} room(s) available`}
                  </span>
                </div>
                {!availabilityResult.available && (
                  <p className="text-sm text-red-600 mt-1">
                    You requested {reservationDetails.numberOfRooms} room(s).
                    Please reduce the number of rooms or choose different dates.
                  </p>
                )}
              </div>
            )}

            {/* Check Availability Button */}
            {step === 1 && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isCheckingAvailability}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                  onClick={handleCheckAvailability}
                  disabled={
                    !reservationDetails.roomCategory ||
                    !reservationDetails.checkIn ||
                    !reservationDetails.checkOut ||
                    !reservationDetails.numberOfRooms ||
                    isCheckingAvailability
                  }
                >
                  {isCheckingAvailability && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Check Availability
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Guest Details Form */}
          {step === 2 && (
            <form onSubmit={handleReservationSubmit} className="space-y-6 mt-8">
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Guest Details
                </h2>

                {/* Name */}
                <div className="mb-4">
                  <Label htmlFor="name" className="font-semibold">
                    Guest Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={reservationDetails.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="mt-2"
                    placeholder="Enter guest name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <Label htmlFor="phone" className="font-semibold">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={reservationDetails.phone}
                    onChange={(e) => {
                      if (/^\d{0,10}$/.test(e.target.value)) {
                        handleFormChange("phone", e.target.value);
                      }
                    }}
                    className="mt-2"
                    maxLength={10}
                    placeholder="10-digit phone number"
                    type="tel"
                    inputMode="numeric"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <Label htmlFor="email" className="font-semibold">
                    Email{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={reservationDetails.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="mt-2"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Number of Guests */}
                <div className="mb-4">
                  <Label className="font-semibold">Number of Guests</Label>
                  <Select
                    value={reservationDetails.numberOfGuests}
                    onValueChange={(value) =>
                      handleFormChange("numberOfGuests", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Mode */}
                <div className="mb-4">
                  <Label className="font-semibold mb-2 block">
                    Payment Mode <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["online", "card", "upi", "cash"].map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        className={
                          `flex items-center w-full border rounded-lg px-4 py-2 text-base font-medium transition ` +
                          (reservationDetails.paymentMode === mode
                            ? "border-gray-900 bg-gray-100 font-bold"
                            : "border-gray-200 bg-white hover:border-gray-400")
                        }
                        onClick={() => handlePaymentModeChange(mode)}
                      >
                        <span className="mr-2">
                          <input
                            type="checkbox"
                            checked={reservationDetails.paymentMode === mode}
                            readOnly
                            className="accent-primary"
                          />
                        </span>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep(1);
                    setAvailabilityResult(null);
                  }}
                  disabled={isLoading}
                >
                  Back to Search
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                  disabled={!isFormComplete() || isLoading}
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Reservation
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewReservation;
