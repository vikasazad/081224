"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import PasswordStrength from "@/components/password-strength";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Icons } from "@/components/icons";

const normalEmailPattern =
  /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;

export default function AuthStaffLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    adminEmail: "",
    staffEmail: "",
    password: "",
    loginError: "",
  });
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({ adminEmail: "", staffEmail: "", password: "", loginError: "" });

    if (!adminEmail || !normalEmailPattern.test(adminEmail)) {
      setErrors((prev) => ({
        ...prev,
        adminEmail: !adminEmail
          ? "Admin email is required"
          : "Invalid email format",
      }));
      setIsLoading(false);
      return;
    }
    if (!staffEmail || !normalEmailPattern.test(staffEmail)) {
      setErrors((prev) => ({
        ...prev,
        staffEmail: !staffEmail
          ? "Staff email is required"
          : "Invalid email format",
      }));
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }));
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: adminEmail,
        staffEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors((prev) => ({ ...prev, loginError: "Invalid credentials." }));
        toast.error("Invalid credentials.");
      } else {
        toast.success("Login successful");

        // Navigate to staff page immediately
        router.push("/staff");
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error("Error in login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Staff Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the staff portal
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                placeholder="admin@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              {errors.adminEmail && (
                <p className="text-sm text-red-500">{errors.adminEmail}</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="staffEmail">Staff Email</Label>
              <Input
                id="staffEmail"
                placeholder="staff@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
              />
              {errors.staffEmail && (
                <p className="text-sm text-red-500">{errors.staffEmail}</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              {errors.loginError && (
                <p className="text-sm text-red-500">{errors.loginError}</p>
              )}
            </div>
            <PasswordStrength password={password} onChange={setPassword} />
            <Button disabled={isLoading} type="submit">
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
