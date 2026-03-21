"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VarianceReasonCode } from "@/types/inventory";

interface ReasonCodeSelectProps {
  value?: VarianceReasonCode;
  onChange: (value: VarianceReasonCode) => void;
  disabled?: boolean;
}

const reasonCodeLabels: Record<VarianceReasonCode, string> = {
  "counting-error": "Counting Error",
  damage: "Damage/Spoilage",
  theft: "Theft/Shrinkage",
  "unrecorded-usage": "Unrecorded Usage",
  "unrecorded-receipt": "Unrecorded Receipt",
  other: "Other",
};

export function ReasonCodeSelect({
  value,
  onChange,
  disabled = false,
}: ReasonCodeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as VarianceReasonCode)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select reason..." />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(reasonCodeLabels).map(([code, label]) => (
          <SelectItem key={code} value={code}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ReasonCodeSelect;
