"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OTPInput } from "@/components/ui/otp-input";
import { Icons } from "@/components/icons";
import { verifyOtp, resendOtp, authEmailOtp } from "@/lib/auth/handleOtp";
import { saveUser } from "@/lib/auth/handleAuth";
import { useRouter } from "next/navigation";
import { UserData } from "@/types/auth/typesAuth";

const otpSchema = z.object({
  phoneOtp: z.string().length(6, "OTP must be 6 digits"),
  emailOtp: z.string().length(6, "OTP must be 6 digits"),
});

export default function OTPVerification({
  verification,
  user,
  formattedNumber,
}: {
  verification: string;
  user: UserData;
  formattedNumber: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [verificationId, setVerificationId] =
    React.useState<string>(verification);

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      phoneOtp: "",
      emailOtp: "",
    },
  });

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    console.log("handleOtpSubmit called with values:", values);

    try {
      console.log("Verifying phone OTP...");
      const phoneVerified = await verifyOtp(verificationId, values.phoneOtp);
      console.log("phoneVerified:", phoneVerified);

      if (!phoneVerified) {
        toast.error("Invalid phone OTP");
        console.log("Invalid phone OTP");
        return;
      }

      const userValues = user;
      console.log("User registration values:", userValues);

      await saveUser({ ...userValues, formattedNumber });
      toast.success("Registration successful!");
      console.log("User registration successful!");

      router.push("/login");
    } catch (error) {
      toast.error("Verification failed");
      console.error("Error in handleOtpSubmit:", error);
    } finally {
      setIsLoading(false);
      console.log("handleOtpSubmit process finished.");
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      console.log("Cannot resend OTP yet. Time left:", timeLeft);
      return;
    }

    const values = user;
    const formattedNumber = `+${values.countryCode}${values.phone}`;
    console.log(
      "handleResendOtp called. Formatted phone number:",
      formattedNumber
    );

    try {
      console.log("Resending OTPs...");
      const [emailOtpRes, phoneOtpRes]: any = await Promise.all([
        authEmailOtp(values.email),
        resendOtp(formattedNumber),
      ]);
      console.log("emailOtpRes:", emailOtpRes);
      console.log("phoneOtpRes:", phoneOtpRes);

      if (emailOtpRes && phoneOtpRes) {
        setVerificationId(phoneOtpRes.verificationId);
        setTimeLeft(30);
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

  return (
    <Form {...otpForm}>
      <form
        onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
          <FormField
            control={otpForm.control}
            name="phoneOtp"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>Phone OTP</FormLabel>
                <FormControl>
                  <OTPInput
                    value={value}
                    onChange={onChange}
                    length={6}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={otpForm.control}
            name="emailOtp"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>Email OTP</FormLabel>
                <FormControl>
                  <OTPInput
                    value={value}
                    onChange={onChange}
                    length={6}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          {timeLeft > 0 && (
            <span className="text-sm text-muted-foreground">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={timeLeft > 0}
            onClick={handleResendOtp}
          >
            Resend OTP
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>
    </Form>
  );
}
