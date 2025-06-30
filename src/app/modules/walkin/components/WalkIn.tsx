"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveRoomData } from "../../staff/utils/staffData";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import { Pencil } from "lucide-react";
// import { sendNotification } from "@/lib/sendNotification";

const WalkIn = () => {
  const router = useRouter();
  const room = useSelector((state: any) => state.walkin.room);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [guestDetails, setGuestDetails] = useState<any>({
    name: "",
    phone: "",
    email: "",
    checkIn: today,
    checkOut: tomorrow,
    paymentMode: {
      cash: false,
      card: false,
      upi: false,
      ota: false,
    },
    numberOfGuests: "2",
    numberOfRooms: "1",
    roomNo: room?.roomNo || "",
    price: room?.price || "",
  });

  const [errors, setErrors] = useState<any>({});
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(15);
  const [canResend, setCanResend] = useState(false);
  const [fNumber, setFNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Prefill roomNo and price from Redux room if present and not already set
  useEffect(() => {
    if (room?.roomNo || room?.price) {
      setGuestDetails((prev: any) => {
        let changed = false;
        const updated: any = { ...prev };
        if (room.roomNo && !prev.roomNo) {
          updated.roomNo = room.roomNo;
          changed = true;
        }
        if (room.price && !prev.price) {
          updated.price = room.price;
          changed = true;
        }
        return changed ? updated : prev;
      });
    }
  }, [room]);

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setGuestDetails((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer: any) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  // Form validation
  const validateForm = () => {
    const formErrors: any = {};
    if (!guestDetails.name.trim()) formErrors.name = "Name is required";
    if (!guestDetails.phone.trim()) formErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(guestDetails.phone))
      formErrors.phone = "Invalid phone number";
    if (guestDetails.email.trim() && !/\S+@\S+\.\S+/.test(guestDetails.email)) {
      formErrors.email = "Invalid email address";
    }
    if (
      !guestDetails.paymentMode.cash &&
      !guestDetails.paymentMode.card &&
      !guestDetails.paymentMode.upi &&
      !guestDetails.paymentMode.ota
    ) {
      formErrors.paymentMode = "Please select a payment mode";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  console.log("room:", room);
  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      try {
        const formattedNumber = `+${91}${guestDetails.phone}`;
        console.log("Formatted phone number:", formattedNumber);
        console.log("Sending OTPs to email and phone...");
        setFNumber(formattedNumber);
        const phoneOtpRes: any = await authPhoneOtp(formattedNumber);
        console.log("phoneOtpRes:", phoneOtpRes);
        setVerificationId(phoneOtpRes.verificationId);
        setIsOtpSent(true);
        setTimer(15);
        setCanResend(false);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error("Something went wrong");
        console.error("Error in handleRegisterSubmit:", error);
      }
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async () => {
    setIsLoading(true);
    try {
      const phoneVerified = await verifyOtp(verificationId, otp);
      if (!phoneVerified) {
        toast.error("Invalid OTP");
        return;
      }

      toast.success("Verification successful!");
      const checkIn = new Date(guestDetails.checkIn);
      const checkOut = new Date(guestDetails.checkOut);
      const nights =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

      const roomInfo = {
        ...guestDetails,
        roomNo: room.roomNo,
        roomType: room.roomType,
        price: room.price,
        inclusions: room.inclusions,
        checkIn: new Date(guestDetails.checkIn).toISOString(),
        checkOut: new Date(guestDetails.checkOut).toISOString(),
        nights: nights,
        paymentMode: Object.keys(guestDetails.paymentMode)
          .filter((mode) => guestDetails.paymentMode[mode])
          .join(", "),
      };

      console.log("roomInfo:", roomInfo);

      const res: any = await saveRoomData(roomInfo);
      if (res?.success) {
        router.push("/staff");
      } else {
        toast.error("Failed to save room data");
      }
    } catch (error) {
      toast.error("Verification failed");
      console.error("Error in handleOtpSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      const phoneOtpRes: any = await resendOtp(fNumber);
      setVerificationId(phoneOtpRes.verificationId);
      setTimer(15);
      setCanResend(false);
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
      console.error("Error in handleResendOtp:", error);
    }
  };

  // Handle payment mode change
  const handlePaymentModeChange = (mode: string) => {
    setGuestDetails((prevDetails: any) => ({
      ...prevDetails,
      paymentMode: {
        ...prevDetails.paymentMode,
        [mode]: !prevDetails.paymentMode[mode],
      },
    }));
  };

  // Handle navigation warning
  //   useEffect(() => {
  //     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //       if (guestDetails.name || guestDetails.phone) {
  //         e.preventDefault();
  //         e.returnValue = "";
  //       }
  //     };

  //     window.addEventListener("beforeunload", handleBeforeUnload);
  //     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  //   }, [guestDetails]);

  return (
    <>
      <div id="recaptcha-container" />
      <div className="container mx-auto px-2 py-8 max-w-xl">
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-bold">
              Walk-in Guest Registration
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full border border-gray-200 hover:border-gray-400 transition"
                >
                  <Pencil size={16} />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Additional Details</DialogTitle>
                  <DialogDescription>
                    Configure additional booking details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !guestDetails.checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {guestDetails.checkIn ? (
                              format(guestDetails.checkIn, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={guestDetails.checkIn}
                            onSelect={(date) =>
                              handleFormChange("checkIn", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !guestDetails.checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {guestDetails.checkOut ? (
                              format(guestDetails.checkOut, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={guestDetails.checkOut}
                            onSelect={(date) =>
                              handleFormChange("checkOut", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Guests</Label>
                      <Select
                        value={guestDetails.numberOfGuests}
                        onValueChange={(value) =>
                          handleFormChange("numberOfGuests", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select guests" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Rooms</Label>
                      <Select
                        value={guestDetails.numberOfRooms}
                        onValueChange={(value) =>
                          handleFormChange("numberOfRooms", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rooms" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Room Info Card */}
            <div className="bg-gray-50 rounded-xl px-4 py-2  mb-2 flex  justify-between sm:items-center sm:justify-between gap-4 border">
              <div>
                <div className="text-gray-500 text-sm font-medium">Room</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {guestDetails.roomNo || "-"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-sm font-medium">Price</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {guestDetails.price
                    ? `₹${Number(guestDetails.price).toLocaleString()}`
                    : "-"}
                </div>
              </div>
            </div>
            {/* <hr className="my-2" /> */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <Label htmlFor="name" className="font-semibold">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={guestDetails.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="mt-2"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="font-semibold">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={guestDetails.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  className="mt-2"
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
                  value={guestDetails.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="mt-2"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              {/* Payment Mode */}
              <div>
                <Label className="font-semibold mb-2 block">
                  Payment Mode <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "cash", label: "Cash" },
                    { id: "card", label: "Card" },
                    { id: "upi", label: "UPI" },
                    { id: "ota", label: "OTA" },
                  ].map((mode) => (
                    <button
                      type="button"
                      key={mode.id}
                      className={
                        `flex items-center w-full border rounded-lg px-4 py-2 text-base font-medium transition ` +
                        (guestDetails.paymentMode[mode.id]
                          ? "border-gray-900 bg-gray-100 font-bold"
                          : "border-gray-200 bg-white hover:border-gray-400")
                      }
                      onClick={() => handlePaymentModeChange(mode.id)}
                    >
                      <span className="mr-2">
                        <input
                          type="checkbox"
                          checked={guestDetails.paymentMode[mode.id]}
                          readOnly
                          className="accent-primary"
                        />
                      </span>
                      {mode.label}
                    </button>
                  ))}
                </div>
                {errors.paymentMode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.paymentMode}
                  </p>
                )}
              </div>
              {/* OTP Section or Send OTP Button */}
              {!isOtpSent ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold rounded-lg py-3 mt-2"
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={handleOtpSubmit}
                      disabled={isLoading}
                      className="flex-1 mr-2"
                    >
                      {isLoading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Verify OTP
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResendOtp}
                      disabled={!canResend || isLoading}
                      className="flex-1"
                    >
                      Resend OTP {timer > 0 && `(${timer}s)`}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WalkIn;
