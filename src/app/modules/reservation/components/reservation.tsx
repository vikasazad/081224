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
import { addReservation } from "../../staff/utils/staffData";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const Reservation = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Reservation form state
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [reservationDetails, setReservationDetails] = useState<any>({
    name: "",
    phone: "",
    email: "",
    checkIn: today,
    checkOut: tomorrow,
    numberOfGuests: "2",
    roomCategory: "Deluxe",
    paymentMode: "card",
  });

  const [errors, setErrors] = useState<any>({});

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setReservationDetails((prev: any) => ({
      ...prev,
      [field]: value,
    }));
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
      reservationDetails.paymentMode
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

      const reservationData = {
        ...reservationDetails,
        bookingId: id,
        guests,
        checkIn: reservationDetails.checkIn.toISOString(),
        checkOut: reservationDetails.checkOut.toISOString(),
        nights,
        createdAt: new Date().toISOString(),
      };

      // Simulate API call delay
      const response = await addReservation(reservationData);
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
              Create a new reservation for a guest
            </p>
          </div>

          <form onSubmit={handleReservationSubmit} className="space-y-6">
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
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select room category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                  <SelectItem value="Super Deluxe">Super Deluxe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div>
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
            <div>
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
            <div>
              <Label htmlFor="email" className="font-semibold">
                Email{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
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
                  disabled={(date) => date < new Date()}
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
                  disabled={(date) =>
                    date < new Date(reservationDetails.checkIn)
                  }
                  className="rounded-md border"
                />
                {errors.checkOut && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkOut}</p>
                )}
              </div>
            </div>

            {/* Number of Guests */}
            <div>
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
            <div>
              <Label className="font-semibold mb-2 block">
                Payment Mode <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {["card", "upi"].map((mode) => (
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

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
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
        </div>
      </div>
    </div>
  );
};

export default Reservation;
