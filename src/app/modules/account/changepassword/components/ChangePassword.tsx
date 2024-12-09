"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePassword({ data }: { data: any }) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requirements = [
    { text: "At least 8 characters", regex: /.{8,}/ },
    { text: "At least 1 lowercase letter (a-z)", regex: /[a-z]/ },
    { text: "At least 1 uppercase letter (A-Z)", regex: /[A-Z]/ },
    { text: "At least 1 number (0-9)", regex: /[0-9]/ },
    { text: "At least 1 special character", regex: /[^A-Za-z0-9]/ },
  ];

  const passwordStrength = requirements.filter((req) =>
    req.regex.test(newPassword)
  ).length;

  function handleChangePassword() {
    console.log(data);
  }

  return (
    <Card className="max-w-4xl  mx-8">
      <CardHeader>
        <CardTitle className="text-2xl">Change Password</CardTitle>
        <CardDescription>
          Please enter your current password and choose a new password that
          meets all the requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old-password">Current Password</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Password Requirements:</h3>
          <div className="space-y-2">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {requirement.regex.test(newPassword) ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={
                    requirement.regex.test(newPassword)
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }
                >
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Password Strength
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-full rounded ${
                    step <= passwordStrength
                      ? step <= 2
                        ? "bg-destructive"
                        : step <= 4
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          className="ml-auto"
          disabled={
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword ||
            passwordStrength < requirements.length
          }
          onClick={handleChangePassword}
        >
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
}
