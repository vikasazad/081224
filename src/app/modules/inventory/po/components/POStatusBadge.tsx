"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { POStatus } from "@/types/inventory";

interface POStatusBadgeProps {
  status: POStatus;
  className?: string;
}

const statusConfig: Record<
  POStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "outline" },
  "pending-approval": { label: "Pending Approval", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  sent: { label: "Sent", variant: "default" },
  received: { label: "Received", variant: "default" },
  "partially-received": { label: "Partially Received", variant: "destructive" },
};

export function POStatusBadge({ status, className }: POStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export default POStatusBadge;
