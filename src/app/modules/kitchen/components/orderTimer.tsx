"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { KitchenTimerConfig, type Order } from "@/types/kitchen";

interface OrderTimerProps {
  startTime: Date;
  duration?: number; // in minutes - optional, will use config default
  onAlert: () => void;
  order?: Order; // Optional order data (kept for backwards compatibility)
  kitchenTimerConfig: KitchenTimerConfig;
}

export default function OrderTimer({
  startTime,
  duration = 0,
  onAlert,
  order,
  kitchenTimerConfig,
}: OrderTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [showDeliveryMessage, setShowDeliveryMessage] =
    useState<boolean>(false);
  // Total duration in milliseconds
  const totalDuration = duration * 60 * 1000;

  // Calculate thresholds based on config
  const deliveryReadinessThreshold =
    kitchenTimerConfig?.deliveryReadinessMinutes * 60 * 1000;

  // Note: Delivery readiness notifications are sent by the global KitchenTimerService
  // This component just shows a visual indicator when the threshold is reached

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      const remaining = Math.max(0, totalDuration - elapsed);

      // Update time left
      setTimeLeft(remaining);

      // Update progress bar
      const progressValue = (remaining / totalDuration) * 100;
      setProgress(progressValue);

      // Show delivery readiness message when threshold is crossed
      if (
        remaining <= deliveryReadinessThreshold &&
        remaining > 0 &&
        order?.attendantName
      ) {
        setShowDeliveryMessage(true);
      }

      // Clear interval if timer is done
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, totalDuration, onAlert, deliveryReadinessThreshold, order]);

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Time Remaining</span>
        <span
          className={`font-mono ${
            timeLeft <= deliveryReadinessThreshold
              ? "text-red-600 dark:text-red-400 font-bold"
              : ""
          }`}
        >
          {formatTimeLeft()}
        </span>
      </div>
      <Progress
        value={progress}
        className={`h-2 ${
          progress > 66
            ? "bg-muted"
            : progress > 33
            ? "bg-yellow-100 dark:bg-yellow-900"
            : "bg-red-100 dark:bg-red-900"
        }`}
      />
      {showDeliveryMessage && timeLeft > 0 && order?.attendantName && (
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Delivery readiness request sent to {order.attendantName}
        </div>
      )}
    </div>
  );
}
