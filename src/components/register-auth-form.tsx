"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { countriesList } from "@/lib/data/countriesData";
import { authEmailOtp, authPhoneOtp } from "@/lib/auth/handleOtp";
import { findUserByEmail } from "@/lib/firebase/firestore";
import PasswordStrength from "./password-strength";
import { Eye, EyeOff } from "lucide-react";
import OTPVerification from "./otp-verification";
import { signInWithGoogle } from "@/lib/auth/socialLogin";

const registerSchema = z
  .object({
    firstname: z.string().min(1, "First Name is required").max(255),
    lastname: z.string().min(1, "Last Name is required").max(255),
    email: z.string().email("Must be a valid email").max(255),
    countryCode: z.string().min(1, "Country Code is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    businessName: z.string().min(1, "Business Name is required").max(255),
    businessType: z.enum(["Accommodation", "Dining", "Both"], {
      required_error: "Please select a business type",
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  phoneOtp: z.string().length(6, "OTP must be 6 digits"),
  emailOtp: z.string().length(6, "OTP must be 6 digits"),
});

interface AuthRegisterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function AuthRegister({ className, ...props }: AuthRegisterProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showVerification, setShowVerification] = React.useState(false);
  const [verificationId, setVerificationId] = React.useState<string>("");
  const [timeLeft, setTimeLeft] = React.useState(90);
  const [password, setPassword] = React.useState("");
  const [fNumber, setFNumber] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      countryCode: "91",
      phone: "",
      businessName: "",
      businessType: "Accommodation",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      phoneOtp: "", // Make sure these are empty strings
      emailOtp: "",
    },
  });

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleRegisterSubmit = async (
    values: z.infer<typeof registerSchema>
  ) => {
    setIsLoading(true);
    console.log("handleRegisterSubmit called with values:", values);

    try {
      console.log("Checking if user is already registered...");
      const isUserRegistered = await findUserByEmail(values.email);
      console.log("isUserRegistered:", isUserRegistered);

      if (isUserRegistered) {
        toast.error("User already registered with this email!");
        return;
      }

      const formattedNumber = `+${values.countryCode}${values.phone}`;
      console.log("Formatted phone number:", formattedNumber);

      setFNumber(formattedNumber);

      console.log("Sending OTPs to email and phone...");
      const [emailOtpRes, phoneOtpRes]: any = await Promise.all([
        authEmailOtp(values.email),
        authPhoneOtp(formattedNumber),
      ]);
      console.log("emailOtpRes:", emailOtpRes);
      console.log("phoneOtpRes:", phoneOtpRes);

      if (emailOtpRes && phoneOtpRes) {
        otpForm.reset();
        setVerificationId(phoneOtpRes.verificationId);
        setShowVerification(true);
        setTimeLeft(90);
        console.log(
          "Verification codes sent successfully. Verification ID set:",
          phoneOtpRes.verificationId
        );
      } else {
        toast.error("Failed to send verification codes");
        console.log("Failed to send OTPs");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error in handleRegisterSubmit:", error);
    } finally {
      setIsLoading(false);
      console.log("handleRegisterSubmit process finished.");
    }
  };

  const updatePasswordStrength = (password: string) => {
    setPassword(password);
  };

  const groupedCountries = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    countriesList.forEach((country) => {
      if (!groups[country.phone]) {
        groups[country.phone] = [];
      }
      groups[country.phone].push(country);
    });
    return groups;
  }, []);

  return (
    <>
      <div id="recaptcha-container" />
      <div className={cn("grid gap-6", className)} {...props}>
        {!showVerification ? (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={registerForm.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={registerForm.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Business Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={registerForm.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(groupedCountries).map(
                            ([phoneCode, countries]) => (
                              <SelectItem key={phoneCode} value={phoneCode}>
                                +{phoneCode} -
                                {countries.map((c) => c.label).join(", ")}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10 digit number"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={registerForm.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <FormControl className="mr-2">
                              <RadioGroupItem value="Accommodation" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Accommodation
                            </FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <FormControl className="mr-2">
                              <RadioGroupItem value="Dining" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Dining
                            </FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <FormControl className="mr-2">
                              <RadioGroupItem value="Both" />
                            </FormControl>
                            <FormLabel className="font-normal">Both</FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updatePasswordStrength(e.target.value);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <PasswordStrength
                      password={password}
                      onChange={setPassword}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm">
                By signing up, you agree to our{" "}
                <Link href="#" className="underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline">
                  Privacy Policy
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Account
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => signInWithGoogle()}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Google
            </Button>
          </Form>
        ) : (
          <OTPVerification
            verification={verificationId}
            user={registerForm.getValues()}
            formattedNumber={fNumber}
          />
        )}
      </div>
    </>
  );
}

export default AuthRegister;
