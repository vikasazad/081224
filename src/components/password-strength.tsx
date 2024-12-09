"use client";

import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

// Password validator functions
const hasNumber = (number: string) => new RegExp(/[0-9]/).test(number);
const hasMixed = (number: string) =>
  new RegExp(/[a-z]/).test(number) && new RegExp(/[A-Z]/).test(number);
const hasSpecial = (number: string) =>
  new RegExp(/[!#@$%^&*)(+=._-]/).test(number);

// Set color based on password strength
const strengthColor = (count: number) => {
  if (count < 2) return { label: "Poor", color: "bg-red-500" };
  if (count < 3) return { label: "Weak", color: "bg-orange-500" };
  if (count < 4) return { label: "Normal", color: "bg-yellow-500" };
  if (count < 5) return { label: "Good", color: "bg-green-500" };
  if (count < 6) return { label: "Strong", color: "bg-green-700" };
  return { label: "Poor", color: "bg-red-500" };
};

// Password strength indicator
const strengthIndicator = (number: string) => {
  let strengths = 0;
  if (number.length > 5) strengths += 1;
  if (number.length > 7) strengths += 1;
  if (hasNumber(number)) strengths += 1;
  if (hasSpecial(number)) strengths += 1;
  if (hasMixed(number)) strengths += 1;
  return strengths;
};

interface PasswordStrengthProps {
  password: string;
  onChange: (value: string) => void;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [strengthInfo, setStrengthInfo] = useState({ label: "", color: "" });

  useEffect(() => {
    const newStrength = strengthIndicator(password);
    setStrength(newStrength);
    setStrengthInfo(strengthColor(newStrength));
  }, [password]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Progress
          value={(strength / 5) * 100}
          className={`h-2 w-[20%] ${strengthInfo.color}`}
        />
        <span className="text-sm font-medium">{strengthInfo.label}</span>
      </div>
    </div>
  );
}
