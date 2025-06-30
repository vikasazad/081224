"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { sendDeliveryReadinessRequest } from "@/app/modules/staff/utils/whatsapp-staff-manager";
import { type Order } from "@/types/kitchen";
import { kitchenTimerConfig } from "./kitchenDashboard";

interface OrderTimerProps {
  startTime: Date;
  duration?: number; // in minutes - optional, will use config default
  onAlert: () => void;
  order?: Order; // Optional order data for delivery readiness
}

export default function OrderTimer({
  startTime,
  duration = kitchenTimerConfig.totalPreparationMinutes, // Use config default
  onAlert,
  order,
}: OrderTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  // const [alertTriggered, setAlertTriggered] = useState<boolean>(false);
  const [deliveryReadinessTriggered, setDeliveryReadinessTriggered] =
    useState<boolean>(false);

  // Total duration in milliseconds
  const totalDuration = duration * 60 * 1000;

  // Calculate thresholds based on config
  const deliveryReadinessThreshold =
    kitchenTimerConfig.deliveryReadinessMinutes * 60 * 1000;
  // const timerAlertThreshold = kitchenTimerConfig.timerAlertMinutes * 60 * 1000;

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

      // Trigger delivery readiness check based on config
      if (
        remaining <= deliveryReadinessThreshold &&
        remaining > deliveryReadinessThreshold - 60 * 1000 && // 1 minute window
        !deliveryReadinessTriggered &&
        order &&
        order.attendantContact &&
        order.attendantName
      ) {
        setDeliveryReadinessTriggered(true);
        // Send delivery readiness request to staff
        sendDeliveryReadinessRequest(
          order.id,
          order.attendantName,
          order.attendantContact,
          order.customerName,
          `Order ${order.id}` // Using order ID as room/table identifier
        ).catch((error) => {
          console.error("Failed to send delivery readiness request:", error);
        });
      }

      // Trigger alert based on config
      // if (
      //   remaining <= timerAlertThreshold &&
      //   remaining > 0 &&
      //   !alertTriggered
      // ) {
      //   onAlert();
      //   setAlertTriggered(true);
      // }

      // Clear interval if timer is done
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    startTime,
    totalDuration,
    onAlert,
    // alertTriggered,
    deliveryReadinessTriggered,
    order,
    deliveryReadinessThreshold,
    // timerAlertThreshold,
  ]);

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
      {deliveryReadinessTriggered &&
        timeLeft <= deliveryReadinessThreshold &&
        timeLeft > 0 && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Delivery readiness request sent to {order?.attendantName}
          </div>
        )}
    </div>
  );
}
