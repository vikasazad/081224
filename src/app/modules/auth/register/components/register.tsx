"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AuthRegister from "@/components/register-auth-form";
export default function RegisterPage() {
  return (
    <div>
      <div className="flex justify-between my-4 px-8">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </>
        </Link>
        <Link
          href="/stafflogin"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Staff Login
        </Link>
      </div>

      <div className="container flex  flex-col items-center justify-center pb-5">
        <Card className="w-[350px]">
          <CardHeader className="space-y-1 ">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AuthRegister />
          </CardContent>
          <CardFooter>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
