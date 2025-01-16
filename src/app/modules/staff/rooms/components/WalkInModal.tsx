"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { Icons } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveRoomData } from "../../utils/staffData";

const WalkInModal = ({ isOpen, onClose, room }: any) => {
  const [guestDetails, setGuestDetails] = useState<any>({
    name: "",
    phone: "",
    email: "",
    checkIn: null,
    checkOut: null,
    paymentMode: {
      cash: false,
      card: false,
      upi: false,
    },
    numberOfGuests: "1",
    numberOfRooms: "1",
  });
  const [errors, setErrors] = useState<any>({});
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(15);
  const [canResend, setCanResend] = useState(false);
  const [fNumber, setFNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const validateForm = () => {
    const formErrors: any = {};
    if (!guestDetails.name.trim()) formErrors.name = "Name is required";
    if (!guestDetails.phone.trim()) formErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(guestDetails.phone))
      formErrors.phone = "Invalid phone number";
    if (!guestDetails.email.trim()) formErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(guestDetails.email))
      formErrors.email = "Invalid email address";
    if (!guestDetails.checkIn) formErrors.checkIn = "Check-in date is required";
    if (!guestDetails.checkOut)
      formErrors.checkOut = "Check-out date is required";
    if (
      guestDetails.checkIn &&
      guestDetails.checkOut &&
      guestDetails.checkIn >= guestDetails.checkOut
    ) {
      formErrors.checkOut = "Check-out date must be after check-in date";
    }
    if (
      !guestDetails.paymentMode.cash &&
      !guestDetails.paymentMode.card &&
      !guestDetails.paymentMode.upi
    ) {
      formErrors.paymentMode = "Please select a payment mode";
    }
    if (!guestDetails.numberOfGuests)
      formErrors.numberOfGuests = "Number of guests is required";
    if (!guestDetails.numberOfRooms)
      formErrors.numberOfRooms = "Number of rooms is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async () => {
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

  const handleOtpSubmit = async () => {
    setIsLoading(true); // Add loading state
    console.log("handleOtpSubmit called with values:", otp);

    try {
      console.log("Verifying phone OTP...");
      const phoneVerified = await verifyOtp(verificationId, otp);
      console.log("phoneVerified:", phoneVerified);

      if (!phoneVerified) {
        toast.error("Invalid phone OTP");
        console.log("Invalid phone OTP");
        return;
      }

      // Set state and show toast before navigation
      toast.success("Verification successful!");
      console.log("User verification successful!");

      setIsLoading(false);
      console.log("Guest Details:", {
        ...guestDetails,
        roomNo: room.roomNo,
        roomType: room.roomType,
        price: room.price,
        inclusions: room.inclusions,
        checkIn: guestDetails.checkIn.toISOString(),
        checkOut: guestDetails.checkOut.toISOString(),
        paymentMode: Object.keys(guestDetails.paymentMode)
          .filter((mode) => guestDetails.paymentMode[mode])
          .join(", "),
        noOfGuests: guestDetails.numberOfGuests,
        noOfRooms: guestDetails.numberOfRooms,
      });
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
        checkIn: guestDetails.checkIn.toISOString(),
        checkOut: guestDetails.checkOut.toISOString(),
        nights,
        paymentMode: Object.keys(guestDetails.paymentMode)
          .filter((mode) => guestDetails.paymentMode[mode])
          .join(", "),
        noOfGuests: guestDetails.numberOfGuests,
        noOfRooms: guestDetails.numberOfRooms,
      };
      const _room = await saveRoomData(roomInfo);
      console.log("ROOM", _room);
      onClose();
    } catch (error) {
      toast.error("Verification failed");
      console.error("Error in handleOtpSubmit:", error);
      setErrors({ ...errors, otp: "Invalid OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      console.log("Resending OTPs...");
      const phoneOtpRes: any = await resendOtp(fNumber);
      console.log("phoneOtpRes:", phoneOtpRes);

      if (phoneOtpRes) {
        setVerificationId(phoneOtpRes.verificationId);
        setTimer(15);
        setCanResend(false); // Restart countdown
        toast.success("OTPs resent successfully");
        console.log(
          "OTPs resent successfully. Verification ID:",
          phoneOtpRes.verificationId
        );
      }
    } catch (error) {
      toast.error("Failed to resend OTPs");
      console.error("Error in handleResendOtp:", error);
    }
  };

  const handlePaymentModeChange = (mode: any) => {
    setGuestDetails((prevDetails: any) => ({
      ...prevDetails,
      paymentMode: {
        ...prevDetails.paymentMode,
        [mode]: !prevDetails.paymentMode[mode],
      },
    }));
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[80%] md:max-w-[550px] w-full h-[90vh] md:h-auto p-0">
          <div id="recaptcha-container" />
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Walk-in Guest Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full max-h-[calc(90vh-4rem)] md:max-h-[600px] px-5 pb-6">
            <div className="space-y-4 mx-1">
              <div>
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  value={guestDetails.name}
                  onChange={(e) =>
                    setGuestDetails({ ...guestDetails, name: e.target.value })
                  }
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone*</Label>
                <Input
                  id="phone"
                  value={guestDetails.phone}
                  onChange={(e) =>
                    setGuestDetails({ ...guestDetails, phone: e.target.value })
                  }
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestDetails.email}
                  onChange={(e) =>
                    setGuestDetails({ ...guestDetails, email: e.target.value })
                  }
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="checkIn">Check-in*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
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
                        setGuestDetails({ ...guestDetails, checkIn: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.checkIn && (
                <p className="text-sm text-red-500 col-start-2 col-span-3">
                  {errors.checkIn}
                </p>
              )}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="checkOut">Check-out*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
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
                        setGuestDetails({ ...guestDetails, checkOut: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.checkOut && (
                  <p className="text-sm text-red-500 col-start-2 col-span-3">
                    {errors.checkOut}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="numberOfGuests">Guests*</Label>
                <Select
                  value={guestDetails.numberOfGuests}
                  onValueChange={(value) =>
                    setGuestDetails({ ...guestDetails, numberOfGuests: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of guests" />
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
              {errors.numberOfGuests && (
                <p className="text-sm text-red-500 col-start-2 col-span-3">
                  {errors.numberOfGuests}
                </p>
              )}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="numberOfRooms">Rooms*</Label>
                <Select
                  value={guestDetails.numberOfRooms}
                  onValueChange={(value) =>
                    setGuestDetails({ ...guestDetails, numberOfRooms: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of rooms" />
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
              {errors.numberOfRooms && (
                <p className="text-sm text-red-500 col-start-2 col-span-3">
                  {errors.numberOfRooms}
                </p>
              )}
              <div className="flex flex-col space-y-3">
                <Label htmlFor="paymentType">Payment Mode*</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cash"
                      checked={guestDetails.paymentMode.cash}
                      onCheckedChange={() => handlePaymentModeChange("cash")}
                    />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="card"
                      checked={guestDetails.paymentMode.card}
                      onCheckedChange={() => handlePaymentModeChange("card")}
                    />
                    <Label htmlFor="card">Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="upi"
                      checked={guestDetails.paymentMode.upi}
                      onCheckedChange={() => handlePaymentModeChange("upi")}
                    />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                </div>
              </div>
              {errors.paymentMode && (
                <p className="text-sm text-red-500 col-start-2 col-span-3">
                  {errors.paymentMode}
                </p>
              )}

              {!isOtpSent ? (
                <Button onClick={handleSubmit}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-sm text-red-500">{errors.otp}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Button onClick={handleOtpSubmit}>Verify OTP</Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={handleResendOtp}
                        disabled={!canResend}
                      >
                        Resend OTP
                      </Button>
                      {timer > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({timer}s)
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
        <DialogDescription></DialogDescription>
      </Dialog>
    </>
  );
};

export default WalkInModal;
