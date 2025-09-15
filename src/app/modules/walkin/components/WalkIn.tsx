"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findCoupon, saveRoomData } from "../../staff/utils/staffData";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, IndianRupee, Info, Pencil, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { calculateTax } from "../../staff/utils/clientside";
// import { sendNotification } from "@/lib/sendNotification";

// const calculateTax = (
//   pricePerNight: number,
//   subtotalAmount: number,
//   taxType: string,
//   taxDetails: any
// ) => {
//   const taxTypeData = taxDetails[taxType];
//   if (!taxTypeData) {
//     throw new Error(`Invalid tax type: ${taxType}`);
//   }

//   let gstPercentage = 0;

//   // Check if there's an "all" key for flat rate
//   if (taxTypeData["all"]) {
//     gstPercentage = parseFloat(taxTypeData["all"]);
//   } else {
//     // Look for price-based keys dynamically
//     const priceKeys = Object.keys(taxTypeData).filter(
//       (key) =>
//         key.includes("below") ||
//         key.includes("above") ||
//         key.includes("under") ||
//         key.includes("over")
//     );

//     if (priceKeys.length === 0) {
//       throw new Error(`No valid tax rate found for tax type: ${taxType}`);
//     }

//     // Process each price-based key to find the applicable rate
//     for (const key of priceKeys) {
//       const lowerKey = key.toLowerCase();

//       // Extract price threshold from the key
//       const priceMatch = key.match(/(\d+(?:\.\d+)?)/);
//       if (!priceMatch) continue;

//       const threshold = parseFloat(priceMatch[1]);

//       // Check if price/night falls within this bracket
//       if (lowerKey.includes("below") || lowerKey.includes("under")) {
//         if (pricePerNight <= threshold) {
//           gstPercentage = parseFloat(taxTypeData[key]);
//           break;
//         }
//       } else if (lowerKey.includes("above") || lowerKey.includes("over")) {
//         if (pricePerNight > threshold) {
//           gstPercentage = parseFloat(taxTypeData[key]);
//           break;
//         }
//       }
//     }

//     // If no bracket matched, try to find a default or fallback rate
//     if (gstPercentage === 0) {
//       // Look for the lowest threshold as fallback
//       const sortedKeys = priceKeys.sort((a, b) => {
//         const aPrice = parseFloat(a.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
//         const bPrice = parseFloat(b.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
//         return aPrice - bPrice;
//       });

//       if (sortedKeys.length > 0) {
//         gstPercentage = parseFloat(taxTypeData[sortedKeys[0]]);
//       }
//     }
//   }

//   if (gstPercentage === 0) {
//     throw new Error(
//       `Could not determine tax rate for ${taxType} with price/night: ${pricePerNight}`
//     );
//   }

//   // Calculate amounts
//   const gstAmount = (subtotalAmount * gstPercentage) / 100;
//   const cgstPercentage = gstPercentage / 2;
//   const sgstPercentage = gstPercentage / 2;
//   const cgstAmount = (subtotalAmount * cgstPercentage) / 100;
//   const sgstAmount = (subtotalAmount * sgstPercentage) / 100;

//   return {
//     gstAmount: Math.round(gstAmount * 100) / 100,
//     gstPercentage,
//     cgstAmount: Math.round(cgstAmount * 100) / 100,
//     cgstPercentage,
//     sgstAmount: Math.round(sgstAmount * 100) / 100,
//     sgstPercentage,
//   };
// };

const WalkIn = () => {
  const router = useRouter();
  const room = useSelector((state: any) => state.walkin.room);
  const gstTax = useSelector((state: any) => state.walkin.gstTax);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [guestDetails, setGuestDetails] = useState<any>({
    name: "",
    phone: "",
    email: "",
    checkIn: today,
    checkOut: tomorrow,
    paymentMode: "cash",
    numberOfGuests: "2",
    numberOfRooms: "1",
    roomNo: room?.roomNo || "",
    price: room?.price || "",
    subtotal: 0,
    nights: 0,
    totalPrice: 0,
    gstAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    gstPercentage: 0,
    cgstPercentage: 0,
    sgstPercentage: 0,
  });

  const [errors, setErrors] = useState<any>({});
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(15);
  const [canResend, setCanResend] = useState(false);
  const [fNumber, setFNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [coupon, setCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [discount, setDiscount] = useState(0);

  // Calculate nights and total price
  const calculateNightsAndTotalPrice = (
    checkIn: Date,
    checkOut: Date,
    price: number
  ) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Calculate the difference in milliseconds
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

    // Convert to days
    let nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Ensure minimum 1 night even for same-day bookings
    if (nights <= 0) {
      nights = 1;
    }

    const subtotal = price * nights;

    const taxDetails = calculateTax(price, subtotal, "room", gstTax);
    const totalPrice = subtotal + taxDetails.gstAmount;

    return { nights, subtotal, totalPrice, taxDetails };
  };

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

  const setPrice = () => {
    if (guestDetails.checkIn && guestDetails.checkOut && guestDetails.price) {
      const { nights, subtotal, totalPrice, taxDetails } =
        calculateNightsAndTotalPrice(
          guestDetails.checkIn,
          guestDetails.checkOut,
          Number(guestDetails.price)
        );

      setGuestDetails((prev: any) => ({
        ...prev,
        nights,
        totalPrice,
        subtotal,
        ...taxDetails,
      }));
    }
  };

  // Calculate nights and total price on component load and when dates/price change
  useEffect(() => {
    setPrice();
  }, [guestDetails.checkIn, guestDetails.checkOut, guestDetails.price]);

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
    if (!guestDetails.paymentMode.trim()) {
      formErrors.paymentMode = "Please select a payment mode";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleCouponApply = async () => {
    setIsLoading(true);
    if (couponInput.trim()) {
      const couponCode = couponInput.trim().toUpperCase();
      const couponResult = await findCoupon(couponCode);

      if (couponResult) {
        setCoupon(couponResult);
        const baseTotal = guestDetails.subtotal || 0;
        let calculatedDiscount = 0;

        if (couponResult.type === "percentage") {
          const percentageAmount = parseFloat(
            couponResult.amount.replace("%", "")
          );
          calculatedDiscount = baseTotal * (percentageAmount / 100);
        } else {
          calculatedDiscount = couponResult.discount || 0;
        }

        setDiscount(calculatedDiscount);
        setCouponInput("");
        const taxDetails = calculateTax(
          Number(guestDetails.price),
          baseTotal - calculatedDiscount,
          "room",
          gstTax
        );
        const totalPrice =
          baseTotal - calculatedDiscount + taxDetails.gstAmount;
        setGuestDetails((prev: any) => ({
          ...prev,
          subtotal: baseTotal - calculatedDiscount,
          totalPrice,
          ...taxDetails,
        }));
        toast.success(
          `Coupon applied! You saved ₹${calculatedDiscount.toLocaleString()}`
        );
      } else {
        toast.error("Invalid coupon code");
      }
      setIsLoading(false);
    }
  };

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

      const roomInfo = {
        ...guestDetails,
        roomNo: room.roomNo,
        roomType: room.roomType,
        price: room.price, // Use calculated total price
        inclusions: room.inclusions,
        checkIn: new Date(guestDetails.checkIn).toISOString(),
        checkOut: new Date(guestDetails.checkOut).toISOString(),
        nights: guestDetails.nights, // Use calculated nights
        images: room.images,
        paymentMode: guestDetails.paymentMode,
        discount: {
          type: coupon?.type || "",
          amount: coupon?.amount || "",
          code: coupon?.code || "",
        },
        priceAfterDiscount: coupon?.type ? guestDetails?.subtotal : "",
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
    console.log("mode", mode);
    setGuestDetails((prevDetails: any) => ({
      ...prevDetails,
      paymentMode: mode,
    }));
  };

  console.log("guestDetails:", {
    ...guestDetails,
    roomNo: room.roomNo,
    roomType: room.roomType,
    price: room.price, // Use calculated total price
    inclusions: room.inclusions,
    checkIn: new Date(guestDetails.checkIn).toISOString(),
    checkOut: new Date(guestDetails.checkOut).toISOString(),
    nights: guestDetails.nights, // Use calculated nights
    images: room.images,
    paymentMode: guestDetails.paymentMode,
    discount: {
      type: coupon?.type || "",
      amount: coupon?.amount || "",
      code: coupon?.code || "",
    },
  });

  // console.log("calculateTax", calculateTax(1000, 1000, "restaurant", gstTax));

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
                      {/* <Popover>
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
                        <PopoverContent className="w-auto p-0" align="start"> */}
                      <Calendar
                        mode="single"
                        selected={guestDetails.checkIn}
                        onSelect={(date) => handleFormChange("checkIn", date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                      {/* </PopoverContent>
                      </Popover> */}
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out Date</Label>
                      {/* <Popover>
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
                        <PopoverContent className="w-auto p-0" align="start"> */}
                      <Calendar
                        mode="single"
                        selected={guestDetails.checkOut}
                        onSelect={(date) => handleFormChange("checkOut", date)}
                        initialFocus
                        disabled={(date) =>
                          date < new Date(guestDetails.checkIn)
                        }
                      />
                      {/* </PopoverContent>
                      </Popover> */}
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
            <Card className="mt-4 rounded-xl mb-6">
              <CardContent className="pb-2 px-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="flex flex-col gap-2">
                      <div className="flex items-center justify-between w-full">
                        <h1 className="text-lg font-bold">
                          Payment Details (R-{guestDetails.roomNo}{" "}
                          {room.roomType})
                        </h1>
                        <ChevronRight
                          className="self-right h-4 w-4 cursor-pointer "
                          strokeWidth={3}
                        />
                      </div>
                      <div className="flex items-center justify-between w-full mt-3">
                        <p className="text-sm font-semibold">To Pay</p>
                        <p className="text-sm flex items-center ">
                          <IndianRupee className="h-3 w-3" />
                          {Math.round(guestDetails.totalPrice)}
                        </p>
                        {/* I can minus the discount amount here */}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <p className="text-xs font-semibold">
                          Total savings with discount
                        </p>
                        <p className="text-xs text-green-500 font-medium">
                          -₹{discount || 0}
                        </p>
                      </div>
                      {coupon ? (
                        <div className="h-10 flex items-center justify-between w-full px-2 py-0 rounded-xl bg-green-200/50 ">
                          <div className="text-xs ">
                            Guest saved {""}
                            <span className="text-green-500 text-md font-semibold">
                              ₹{discount}
                            </span>{" "}
                            with{" "}
                            <span className="text-blue-500 text-md font-semibold">
                              {coupon.code}
                            </span>
                          </div>
                          <div
                            className="p-0 text-xs text-blue-500 underline hover:bg-transparent"
                            onClick={() => {
                              setCoupon(null);
                              setDiscount(0);
                              toast.success("Coupon removed");
                              setPrice();
                            }}
                          >
                            remove
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                            }}
                            className="h-8"
                          />
                          <div
                            onClick={handleCouponApply}
                            className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-2"
                          >
                            Apply{" "}
                            {isLoading && (
                              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                          </div>
                        </div>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        <span className="text-sm font-semibold">
                          Payment Details
                        </span>

                        <div className="  pb-4 py-3 space-y-2 bg-white rounded-2xl">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Room-{guestDetails.roomNo}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-semibold">
                              <IndianRupee className="h-3 w-3" />
                              {guestDetails.price}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">Nights</span>
                            <span className="flex items-center gap-1 text-xs font-semibold">
                              x {guestDetails.nights}
                            </span>
                          </div>
                          <div className="flex justify-between items-center font-medium">
                            <span className="text-xs">Sub Total</span>
                            <span className="flex items-center gap-1 text-xs font-semibold">
                              <IndianRupee className="h-3 w-3" />
                              {guestDetails.subtotal}
                            </span>
                          </div>

                          {coupon && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-green-600">
                                Savings with {coupon.code}
                              </span>
                              <span className="text-xs text-green-600">
                                - ₹{discount}
                              </span>
                            </div>
                          )}

                          {coupon && (
                            <div className="flex justify-between items-center bg-pink-50 p-2 rounded-lg">
                              <span className="text-xs">
                                {coupon.code} Applied
                              </span>
                              <Trash2
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  setCoupon(null);
                                  setDiscount(0);
                                  toast.success("Coupon removed");
                                  setPrice();
                                }}
                              />
                            </div>
                          )}

                          <Popover>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-xs">
                                  Taxes and charges
                                </span>
                                <PopoverTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </PopoverTrigger>
                              </div>
                              <span className="flex items-center gap-1 text-xs font-semibold">
                                <IndianRupee className="h-3 w-3" />
                                {guestDetails.gstAmount}
                              </span>
                            </div>

                            <PopoverContent
                              className="w-60 p-0 bg-purple-50 rounded-xl"
                              side="bottom"
                              align="center"
                            >
                              <div className="px-6 py-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs">
                                    CGST({guestDetails.cgstPercentage}%)
                                  </span>
                                  <span className="text-xs flex items-center gap-1">
                                    <IndianRupee
                                      className="h-3 w-3"
                                      strokeWidth={3}
                                    />
                                    {guestDetails.cgstAmount}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs">
                                    SGST({guestDetails.sgstPercentage}%)
                                  </span>
                                  <span className="text-xs flex items-center gap-1">
                                    <IndianRupee
                                      className="h-3 w-3"
                                      strokeWidth={3}
                                    />
                                    {guestDetails.sgstAmount}
                                  </span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>

                          <Separator />

                          <div className="flex justify-between items-center font-semibold text-sm">
                            <span className="text-sm font-medium">To Pay</span>
                            <span className="flex items-center gap-1 text-sm font-semibold">
                              <IndianRupee className="h-3 w-3" />
                              {Math.round(guestDetails.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

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
                  {["cash", "card", "upi", "ota"].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      className={
                        `flex items-center w-full border rounded-lg px-4 py-2 text-base font-medium transition ` +
                        (guestDetails.paymentMode[mode]
                          ? "border-gray-900 bg-gray-100 font-bold"
                          : "border-gray-200 bg-white hover:border-gray-400")
                      }
                      onClick={() => handlePaymentModeChange(mode)}
                    >
                      <span className="mr-2">
                        <input
                          type="checkbox"
                          checked={guestDetails.paymentMode === mode}
                          readOnly
                          className="accent-primary"
                        />
                      </span>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
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
