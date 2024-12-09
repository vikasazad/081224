"use client";

import * as React from "react";
// import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { findUserByEmail } from "@/lib/firebase/firestore";
import { LoginAuth } from "@/app/modules/auth/login/utils/loginApi";
import { signInWithGoogle } from "@/lib/auth/socialLogin";
import { Eye, EyeOff } from "lucide-react";

// Create a schema for form validation
const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .max(255, { message: "Email must not exceed 255 characters" })
    .refine(
      (value) => {
        const normalEmailPattern =
          /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;

        return normalEmailPattern.test(value);
      },
      {
        message: "Must be a valid normal email or special email format",
      }
    ),
});

const passwordSchema = z.object({
  email: z.string(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

interface LoginAuthForm extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function LoginAuthForm({ className, ...props }: LoginAuthForm) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState(false);
  // const router = useRouter();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const userExists = await findUserByEmail(values.email);
      if (userExists) {
        setIsEmailValid(true);
        passwordForm.setValue("email", values.email);
      } else {
        emailForm.setError("email", {
          type: "manual",
          message: "Couldn't find your account. Please try another email.",
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      emailForm.setError("email", {
        type: "manual",
        message: "Error checking email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFinalSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      const result = await LoginAuth({
        email: values.email,
        password: values.password,
      });

      console.log("LoginAuth Result:", result); // Debugging line

      if (result?.error) {
        console.log("HEHE");
        passwordForm.setError("password", {
          type: "manual",
          message: result.message || "Login error.",
        });
        return; // Early exit to avoid setting localStorage or proceeding
      }

      localStorage.setItem("userEmail", values.email);
      // router.push("/dashboard");
    } catch (err) {
      console.error("Error in onFinalSubmit:", err);
      passwordForm.setError("password", {
        type: "manual",
        message: "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {!isEmailValid ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div className="grid gap-2">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify Email
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onFinalSubmit)}>
            <div className="grid gap-2">
              <FormField
                control={passwordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-100" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Password</Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          disabled={isLoading}
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
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </div>
          </form>
        </Form>
      )}

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
        disabled={isLoading}
        onClick={() => signInWithGoogle()}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}
