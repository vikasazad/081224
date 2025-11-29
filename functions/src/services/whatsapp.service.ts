import { WHATSAPP_PHONE_ID } from "../config";

/**
 * Send WhatsApp text message
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} message - The message to send
 * @param {string} apiKey - The WhatsApp API key
 * @return {Promise<boolean>} True if message sent successfully
 */
export async function sendWhatsAppTextMessage(
  phoneNumber: string,
  message: string,
  apiKey: string
): Promise<boolean> {
  try {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      console.error("WhatsApp API Key is empty!");
      return false;
    }

    const apiUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_ID}/messages`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cleanApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      console.error(
        `WhatsApp failed for ${phoneNumber}. Status: ${response.status}`,
        responseData
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error sending WhatsApp to ${phoneNumber}:`, error);
    return false;
  }
}
