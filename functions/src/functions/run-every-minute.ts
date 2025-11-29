import { onSchedule } from "firebase-functions/v2/scheduler";
import { whatsappApiKey } from "../config";
import { checkAssignmentTimeouts } from "./check-assignment-timeouts";

/**
 * Scheduled function that runs every 1 minute
 * Add any additional functions that need to run every minute here
 */
export const runEveryMinute = onSchedule(
  {
    schedule: "every 1 minutes",
    secrets: [whatsappApiKey],
  },
  async () => {
    const rawApiKey = whatsappApiKey.value();
    const apiKey = rawApiKey ? rawApiKey.trim() : "";

    // Call all functions that need to run every minute
    await checkAssignmentTimeouts(apiKey);

    // Add more functions here in the future if needed
    // Example:
    // await someOtherFunction(apiKey);
    // await yetAnotherFunction();
  }
);
