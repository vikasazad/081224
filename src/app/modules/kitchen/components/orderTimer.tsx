"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface OrderTimerProps {
  startTime: Date;
  duration: number; // in minutes
  onAlert: () => void;
}

export default function OrderTimer({
  startTime,
  duration,
  onAlert,
}: OrderTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);

  // Total duration in milliseconds
  const totalDuration = duration * 60 * 1000;

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

      // Trigger alert 5 minutes before end if not already triggered
      if (remaining <= 5 * 60 * 1000 && remaining > 0 && !alertTriggered) {
        onAlert();
        setAlertTriggered(true);
      }

      // Clear interval if timer is done
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, totalDuration, onAlert, alertTriggered]);

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
            timeLeft <= 5 * 60 * 1000
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
    </div>
  );
}
