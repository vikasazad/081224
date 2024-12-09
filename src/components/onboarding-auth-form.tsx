"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { countriesList } from "@/lib/data/countriesData";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { SignOut } from "@/lib/auth/socialLogin";
import { registerSocialUser } from "@/lib/auth/handleAuth";
import { OTPInput } from "./ui/otp-input";
import { Icons } from "./icons";

export default function AuthOnboarding({ user }: any) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState("phone");
  const [verificationId, setVerificationId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Accommodation");
  const [timeLeft, setTimeLeft] = useState(0);
  const [errors, setErrors] = useState({
    phoneNumber: "",
    countryCode: "",
    phoneOtp: "",
    businessName: "",
    businessType: "",
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const validateInput = () => {
    const newErrors = {
      phoneNumber: "",
      countryCode: "",
      phoneOtp: "",
      businessName: "",
      businessType: "",
    };
    if (onboardingStep === "phone") {
      if (!phoneNumber) newErrors.phoneNumber = "Phone number is required";
      else if (!/^\d{10}$/.test(phoneNumber))
        newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (onboardingStep === "otp") {
      if (!phoneOtp) newErrors.phoneOtp = "OTP is required";
      else if (!/^\d{6}$/.test(phoneOtp))
        newErrors.phoneOtp = "OTP must be exactly 6 digits";
    } else if (onboardingStep === "business") {
      if (!businessName) newErrors.businessName = "Business name is required";
      else if (businessName.length < 6)
        newErrors.businessName = "Business name must be at least 6 characters";
      if (!businessType) newErrors.businessType = "Business type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneVerification = async () => {
    console.log("here", validateInput());
    if (!validateInput()) {
      setIsLoading(true);
      console.log("validated");
      try {
        console.log("first", phoneNumber);
        const formattedNumber = `+${countryCode}${phoneNumber}`;
        console.log("Phone number for OTP:", formattedNumber); // Debugging
        const phoneOtp = await authPhoneOtp(formattedNumber);
        console.log("OTP response:", phoneOtp); // Debugging
        if (phoneOtp) {
          setVerificationId(phoneOtp.verificationId);
          setOnboardingStep("otp");
          setTimeLeft(30);
          toast.success("OTP sent successfully");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error sending OTP:", error); // Debugging
        toast.error("Failed to send OTP");
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const formattedNumber = `+${countryCode}${phoneNumber}`;
      console.log("Phone number for resending OTP:", formattedNumber); // Debugging
      const phoneOtp = await resendOtp(formattedNumber);
      console.log("Resend OTP response:", phoneOtp); // Debugging
      if (phoneOtp) {
        setVerificationId(phoneOtp.verificationId);
        setTimeLeft(90);
        toast.success("OTP resent successfully");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error resending OTP:", error); // Debugging
      toast.error("Failed to resend OTP");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateInput()) {
      setIsLoading(true);
      try {
        console.log("Verifying OTP with ID:", verificationId); // Debugging
        console.log("Entered OTP:", phoneOtp); // Debugging
        await verifyOtp(verificationId, phoneOtp);
        setOnboardingStep("business");
        toast.success("OTP verified successfully");
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying OTP:", error); // Debugging
        toast.error("Invalid OTP");
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    console.log(validateInput());
    if (!validateInput()) {
      setIsLoading(true);
      try {
        const formattedNumber = `+${countryCode}${phoneNumber}`;
        console.log("Formatted phone number:", formattedNumber); // Debugging
        const newUser = {
          ...user,
          countryCode,
          phone: phoneNumber,
          businessName,
          businessType,
          role: "admin",
          isverified: JSON.stringify(new Date()),
          canForgotPassword: true,
          formattedNumber,
        };
        console.log("New user object:", newUser); // Debugging
        const registerUser = await registerSocialUser(newUser);
        console.log("Register user response:", registerUser); // Debugging

        // Check if registerUser is false before accessing properties
        if (registerUser === false) {
          toast.error("User registration failed");
        } else if (registerUser.error) {
          toast.error(registerUser.message);
        } else {
          console.log("Updating session:", session); // Debugging
          await update({
            ...session,
            user: {
              ...newUser,
              newUser: false,
            },
          });
          toast.success("Welcome to the world of Buildbility");
          router.push("/dashboard");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during registration:", error); // Debugging
        toast.error("Something went wrong!");
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div id="recaptcha-container" />
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            {onboardingStep === "phone"
              ? "Verify Phone Number"
              : onboardingStep === "otp"
              ? "Enter OTP"
              : "Business Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onboardingStep === "phone" && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="w-1/3">
                  <Label htmlFor="countryCode">Code</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger id="countryCode">
                      <SelectValue placeholder="Select country code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesList.map((country) => (
                        <SelectItem key={country.code} value={country.phone}>
                          +{country.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-2/3">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="10 Digits"
                  />
                </div>
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>
          )}
          {onboardingStep === "otp" && (
            <div className="space-y-4">
              <div>
                <OTPInput
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e)}
                  length={6}
                  disabled={isLoading}
                />
              </div>
              {errors.phoneOtp && (
                <p className="text-sm text-red-500">{errors.phoneOtp}</p>
              )}
              <div className="flex justify-between items-center">
                {timeLeft > 0 ? (
                  <p className="text-sm">Resend OTP in {timeLeft}s</p>
                ) : (
                  <Button variant="link" onClick={handleResendOtp}>
                    Resend OTP
                  </Button>
                )}
              </div>
            </div>
          )}
          {onboardingStep === "business" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                />
                {errors.businessName && (
                  <p className="text-sm text-red-500">{errors.businessName}</p>
                )}
              </div>
              <div>
                <Label>Business Type</Label>
                <RadioGroup
                  value={businessType}
                  onValueChange={setBusinessType}
                >
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Accommodation"
                        id="accommodation"
                      />
                      <Label htmlFor="accommodation">Accommodation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Dining" id="dining" />
                      <Label htmlFor="dining">Dining</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Both" id="both" />
                      <Label htmlFor="both">Both</Label>
                    </div>
                  </div>
                </RadioGroup>
                {errors.businessType && (
                  <p className="text-sm text-red-500">{errors.businessType}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              console.log("Button clicked"); // Debugging
              if (onboardingStep === "phone") {
                console.log("Triggering handlePhoneVerification"); // Debugging
                handlePhoneVerification();
              } else if (onboardingStep === "otp") {
                console.log("Triggering handleVerifyOtp"); // Debugging
                handleVerifyOtp();
              } else {
                console.log("Triggering handleSubmit"); // Debugging
                handleSubmit();
              }
            }}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {onboardingStep === "phone"
              ? "Send Verification Code"
              : onboardingStep === "otp"
              ? "Verify OTP"
              : "Submit"}
          </Button>
          {onboardingStep === "phone" && (
            <p className="text-xs text-center">
              You must have a valid phone number to use Buildbility`s services.
              SMS and data charges may apply.
            </p>
          )}
          <div className="text-center">
            <p className="text-sm">
              Email verified as <strong>{user?.email}</strong>
            </p>
            <Button variant="link" onClick={SignOut}>
              Use a different Email
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
