"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { saveSettingsData } from "../../utils/AccountApi";

const Settings = ({ data }: { data: any }) => {
  const [feedbackWindowTiming, setFeedbackWindowTiming] = useState<string>(
    () => {
      const startHour =
        data.feedbackWindow.startTime > 12
          ? data.feedbackWindow.startTime - 12
          : data.feedbackWindow.startTime;
      const endHour =
        data.feedbackWindow.endTime > 12
          ? data.feedbackWindow.endTime - 12
          : data.feedbackWindow.endTime;
      const startPeriod = data.feedbackWindow.startTime < 12 ? "AM" : "PM";
      const endPeriod = data.feedbackWindow.endTime + 1 < 12 ? "AM" : "PM";
      const label = `${startHour} ${startPeriod} - ${endHour} ${endPeriod}`;
      console.log(label);
      return label;
    }
  );
  const [whatsappTimeout, setWhatsappTimeout] = useState<string>(
    data.whatsappTimeout
  );

  // Kitchen Timer Config - Single State Object
  const [kitchenTimerConfig, setKitchenTimerConfig] = useState({
    waitingAlertMinutes: data.kitchenTimerConfig.waitingAlertMinutes,
    totalPreparationMinutes: data.kitchenTimerConfig.totalPreparationMinutes,
    deliveryReadinessMinutes: data.kitchenTimerConfig.deliveryReadinessMinutes,
    onTimeThresholdMinutes: data.kitchenTimerConfig.onTimeThresholdMinutes,
    delayedThresholdMinutes: data.kitchenTimerConfig.delayedThresholdMinutes,
    escalationTimeoutMinutes: data.kitchenTimerConfig.escalationTimeoutMinutes,
  });

  const [errors, setErrors] = useState<{
    feedbackWindowTiming?: string;
    whatsappTimeout?: string;
    waitingAlertMinutes?: string;
    totalPreparationMinutes?: string;
    deliveryReadinessMinutes?: string;
    onTimeThresholdMinutes?: string;
    delayedThresholdMinutes?: string;
    escalationTimeoutMinutes?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  // Generate time intervals from 8 AM to 9 PM with 1-hour increments
  const generateTimeIntervals = () => {
    const intervals = [];
    for (let hour = 8; hour <= 20; hour++) {
      const startHour = hour > 12 ? hour - 12 : hour;
      const endHour = hour + 1 > 12 ? hour + 1 - 12 : hour + 1;
      const startPeriod = hour < 12 ? "AM" : "PM";
      const endPeriod = hour + 1 < 12 ? "AM" : "PM";

      const label = `${startHour} ${startPeriod} - ${endHour} ${endPeriod}`;
      intervals.push({
        value: label,
        label: label,
      });
    }
    return intervals;
  };

  const timeIntervals = generateTimeIntervals();

  // Convert AM/PM time format to 24-hour format
  const convertTo24HourFormat = (timeRange: string) => {
    // Parse "8 AM - 9 AM" format
    const [startTime, endTime] = timeRange.split(" - ");

    const parseTime = (time: string) => {
      const parts = time.trim().split(" ");
      let hour = parseInt(parts[0]);
      const period = parts[1];

      if (period === "PM" && hour !== 12) {
        hour += 12;
      } else if (period === "AM" && hour === 12) {
        hour = 0;
      }

      return hour;
    };

    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);

    return `${startHour} - ${endHour}`;
  };

  const validateForm = () => {
    const newErrors: {
      feedbackWindowTiming?: string;
      whatsappTimeout?: string;
      waitingAlertMinutes?: string;
      totalPreparationMinutes?: string;
      deliveryReadinessMinutes?: string;
      onTimeThresholdMinutes?: string;
      delayedThresholdMinutes?: string;
      escalationTimeoutMinutes?: string;
    } = {};

    // Validate feedback window timing
    if (!feedbackWindowTiming) {
      newErrors.feedbackWindowTiming = "Please select a feedback window timing";
    }

    // Validate WhatsApp timeout
    if (!whatsappTimeout) {
      newErrors.whatsappTimeout = "Please enter a timeout value";
    } else {
      const timeoutValue = parseInt(whatsappTimeout);
      if (isNaN(timeoutValue)) {
        newErrors.whatsappTimeout = "Please enter a valid number";
      } else if (timeoutValue < 0 || timeoutValue > 15) {
        newErrors.whatsappTimeout = "Timeout must be between 0 and 15 minutes";
      }
    }

    // Validate Kitchen Timer Config fields
    const validateTimerField = (
      value: string,
      fieldName: keyof typeof newErrors,
      label: string,
      min: number = 0,
      max: number = 999
    ) => {
      if (!value) {
        newErrors[fieldName] = `${label} is required`;
      } else {
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          newErrors[fieldName] = "Please enter a valid number";
        } else if (numValue < min || numValue > max) {
          newErrors[
            fieldName
          ] = `Value must be between ${min} and ${max} minutes`;
        }
      }
    };

    validateTimerField(
      kitchenTimerConfig.waitingAlertMinutes,
      "waitingAlertMinutes",
      "Waiting Alert Time",
      1,
      60
    );
    validateTimerField(
      kitchenTimerConfig.totalPreparationMinutes,
      "totalPreparationMinutes",
      "Total Preparation Time",
      1,
      120
    );
    validateTimerField(
      kitchenTimerConfig.deliveryReadinessMinutes,
      "deliveryReadinessMinutes",
      "Delivery Readiness Time",
      1,
      60
    );
    validateTimerField(
      kitchenTimerConfig.onTimeThresholdMinutes,
      "onTimeThresholdMinutes",
      "On-Time Threshold",
      1,
      120
    );
    validateTimerField(
      kitchenTimerConfig.delayedThresholdMinutes,
      "delayedThresholdMinutes",
      "Delayed Threshold",
      1,
      120
    );
    validateTimerField(
      kitchenTimerConfig.escalationTimeoutMinutes,
      "escalationTimeoutMinutes",
      "Escalation Timeout",
      1,
      180
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      const time = convertTo24HourFormat(feedbackWindowTiming).split(" - ");
      const formData = {
        feedbackWindowTiming: {
          startTime: Number(time[0]),
          endTime: Number(time[1]),
        },
        whatsappTimeout: Number(whatsappTimeout),
        kitchenTimerConfig: {
          waitingAlertMinutes: Number(kitchenTimerConfig.waitingAlertMinutes),
          totalPreparationMinutes: Number(
            kitchenTimerConfig.totalPreparationMinutes
          ),
          deliveryReadinessMinutes: Number(
            kitchenTimerConfig.deliveryReadinessMinutes
          ),
          onTimeThresholdMinutes: Number(
            kitchenTimerConfig.onTimeThresholdMinutes
          ),
          delayedThresholdMinutes: Number(
            kitchenTimerConfig.delayedThresholdMinutes
          ),
          escalationTimeoutMinutes: Number(
            kitchenTimerConfig.escalationTimeoutMinutes
          ),
        },
      };
      console.log(formData);

      const response = await saveSettingsData(formData);
      if (response) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div>
        <Card className="max-w-4xl mx-8 p-6">
          <CardTitle className="text-2xl font-bold mb-6">Settings</CardTitle>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Window Timing Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="feedbackWindowTiming"
                  className="block text-sm font-medium text-gray-700"
                >
                  Feedback Window Timing
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="w-5 h-5 rounded-full p-0 text-xs"
                    >
                      ?
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      This setting determines the time window after service
                      completion during which customers can provide feedback on
                      their experience.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={feedbackWindowTiming}
                onValueChange={(value) => {
                  console.log(value);
                  setFeedbackWindowTiming(value);
                  if (errors.feedbackWindowTiming) {
                    setErrors((prev) => ({
                      ...prev,
                      feedbackWindowTiming: undefined,
                    }));
                  }
                }}
              >
                <SelectTrigger
                  className={
                    errors.feedbackWindowTiming ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select a time interval" />
                </SelectTrigger>
                <SelectContent>
                  {timeIntervals.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.feedbackWindowTiming && (
                <p className="text-sm text-red-600">
                  {errors.feedbackWindowTiming}
                </p>
              )}
            </div>

            {/* WhatsApp Assignment Timeout Timer */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="whatsappTimeout"
                  className="block text-sm font-medium text-gray-700"
                >
                  WhatsApp Assignment Timeout Timer
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="w-5 h-5 rounded-full p-0 text-xs"
                    >
                      ?
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      This setting defines the maximum time (in minutes) to wait
                      for a staff member to accept a WhatsApp assignment before
                      reassigning to another available staff member.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  id="whatsappTimeout"
                  value={whatsappTimeout}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow digits and limit to 2 characters
                    if (/^\d{0,2}$/.test(value)) {
                      setWhatsappTimeout(value);
                      if (errors.whatsappTimeout) {
                        setErrors((prev) => ({
                          ...prev,
                          whatsappTimeout: undefined,
                        }));
                      }
                    }
                  }}
                  maxLength={2}
                  placeholder="0-15"
                  className={`pr-20 ${
                    errors.whatsappTimeout ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                  minutes
                </span>
              </div>
              {errors.whatsappTimeout && (
                <p className="text-sm text-red-600">{errors.whatsappTimeout}</p>
              )}
            </div>

            {/* Kitchen Timer Configuration Section */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Kitchen Timer Configuration
              </h3>

              {/* Waiting Alert Minutes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="waitingAlertMinutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Waiting Alert Time
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-5 h-5 rounded-full p-0 text-xs"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Time to wait before alerting staff if an order has not
                        been started after being placed.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    id="waitingAlertMinutes"
                    value={kitchenTimerConfig.waitingAlertMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,3}$/.test(value)) {
                        setKitchenTimerConfig((prev) => ({
                          ...prev,
                          waitingAlertMinutes: value,
                        }));
                        if (errors.waitingAlertMinutes) {
                          setErrors((prev) => ({
                            ...prev,
                            waitingAlertMinutes: undefined,
                          }));
                        }
                      }
                    }}
                    maxLength={3}
                    placeholder="e.g., 10"
                    className={`pr-20 ${
                      errors.waitingAlertMinutes ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                    minutes
                  </span>
                </div>
                {errors.waitingAlertMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.waitingAlertMinutes}
                  </p>
                )}
              </div>

              {/* Total Preparation Minutes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="totalPreparationMinutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Total Preparation Time
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-5 h-5 rounded-full p-0 text-xs"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Expected total time for completing order preparation
                        from start to finish.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    id="totalPreparationMinutes"
                    value={kitchenTimerConfig.totalPreparationMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,3}$/.test(value)) {
                        setKitchenTimerConfig((prev) => ({
                          ...prev,
                          totalPreparationMinutes: value,
                        }));
                        if (errors.totalPreparationMinutes) {
                          setErrors((prev) => ({
                            ...prev,
                            totalPreparationMinutes: undefined,
                          }));
                        }
                      }
                    }}
                    maxLength={3}
                    placeholder="e.g., 20"
                    className={`pr-20 ${
                      errors.totalPreparationMinutes ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                    minutes
                  </span>
                </div>
                {errors.totalPreparationMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.totalPreparationMinutes}
                  </p>
                )}
              </div>

              {/* Delivery Readiness Minutes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="deliveryReadinessMinutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Delivery Readiness Time
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-5 h-5 rounded-full p-0 text-xs"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Time before order completion when delivery readiness
                        request should be sent.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    id="deliveryReadinessMinutes"
                    value={kitchenTimerConfig.deliveryReadinessMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,3}$/.test(value)) {
                        setKitchenTimerConfig((prev) => ({
                          ...prev,
                          deliveryReadinessMinutes: value,
                        }));
                        if (errors.deliveryReadinessMinutes) {
                          setErrors((prev) => ({
                            ...prev,
                            deliveryReadinessMinutes: undefined,
                          }));
                        }
                      }
                    }}
                    maxLength={3}
                    placeholder="e.g., 10"
                    className={`pr-20 ${
                      errors.deliveryReadinessMinutes ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                    minutes
                  </span>
                </div>
                {errors.deliveryReadinessMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.deliveryReadinessMinutes}
                  </p>
                )}
              </div>

              {/* On-Time Threshold Minutes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="onTimeThresholdMinutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    On-Time Threshold
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-5 h-5 rounded-full p-0 text-xs"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Maximum time within which orders completed are
                        considered on time.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    id="onTimeThresholdMinutes"
                    value={kitchenTimerConfig.onTimeThresholdMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,3}$/.test(value)) {
                        setKitchenTimerConfig((prev) => ({
                          ...prev,
                          onTimeThresholdMinutes: value,
                        }));
                        if (errors.onTimeThresholdMinutes) {
                          setErrors((prev) => ({
                            ...prev,
                            onTimeThresholdMinutes: undefined,
                          }));
                        }
                      }
                    }}
                    maxLength={3}
                    placeholder="e.g., 30"
                    className={`pr-20 ${
                      errors.onTimeThresholdMinutes ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                    minutes
                  </span>
                </div>
                {errors.onTimeThresholdMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.onTimeThresholdMinutes}
                  </p>
                )}
              </div>

              {/* Delayed Threshold Minutes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="delayedThresholdMinutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Delayed Threshold
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-5 h-5 rounded-full p-0 text-xs"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Time threshold after which orders are marked as delayed.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    id="delayedThresholdMinutes"
                    value={kitchenTimerConfig.delayedThresholdMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,3}$/.test(value)) {
                        setKitchenTimerConfig((prev) => ({
                          ...prev,
                          delayedThresholdMinutes: value,
                        }));
                        if (errors.delayedThresholdMinutes) {
                          setErrors((prev) => ({
                            ...prev,
                            delayedThresholdMinutes: undefined,
                          }));
                        }
                      }
                    }}
                    maxLength={3}
                    placeholder="e.g., 30"
                    className={`pr-20 ${
                      errors.delayedThresholdMinutes ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                    minutes
                  </span>
                </div>
                {errors.delayedThresholdMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.delayedThresholdMinutes}
                  </p>
                )}
              </div>

              {/* Escalation Timeout Minutes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="escalationTimeoutMinutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Escalation Timeout
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-5 h-5 rounded-full p-0 text-xs"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Total time before escalating order issues to manager for
                        intervention.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    id="escalationTimeoutMinutes"
                    value={kitchenTimerConfig.escalationTimeoutMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,3}$/.test(value)) {
                        setKitchenTimerConfig((prev) => ({
                          ...prev,
                          escalationTimeoutMinutes: value,
                        }));
                        if (errors.escalationTimeoutMinutes) {
                          setErrors((prev) => ({
                            ...prev,
                            escalationTimeoutMinutes: undefined,
                          }));
                        }
                      }
                    }}
                    maxLength={3}
                    placeholder="e.g., 40"
                    className={`pr-20 ${
                      errors.escalationTimeoutMinutes ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                    minutes
                  </span>
                </div>
                {errors.escalationTimeoutMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.escalationTimeoutMinutes}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              Save Settings{" "}
              {isLoading && <Icons.spinner className="w-4 h-4 animate-spin" />}
            </Button>
          </form>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default Settings;
