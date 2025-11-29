import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Import and export scheduled functions
export { runEveryMinute } from "./functions/run-every-minute";

/**
 * Simple hello world callable function for testing
 */
export const helloWorld = functions.https.onCall((request) => {
  const name = request.data.name || "World";
  return {
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  };
});
