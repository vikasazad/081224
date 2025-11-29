import { defineSecret } from "firebase-functions/params";

export const WHATSAPP_PHONE_ID = "616505061545755";
export const whatsappApiKey = defineSecret("WHATSAPP_API_KEY");
export const DEFAULT_TIMEOUT_MINUTES = 10;
export const MAX_ASSIGNMENTS_PER_BATCH = 500;
