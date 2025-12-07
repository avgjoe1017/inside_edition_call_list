/**
 * Twilio SMS Service
 * Handles sending SMS messages via Twilio API and processing status webhooks
 */

import twilio from "twilio";
import { env } from "../env";

// Initialize Twilio client (only if credentials are provided)
let twilioClient: ReturnType<typeof twilio> | null = null;

if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
} else {
  console.warn("⚠️  Twilio credentials not configured. SMS sending will be disabled.");
}

/**
 * Send SMS message via Twilio
 * @param to - Phone number in E.164 format (e.g., +15551234567)
 * @param message - SMS message content
 * @returns Twilio message SID and status
 */
export async function sendSMS(to: string, message: string) {
  if (!twilioClient || !env.TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.");
  }

  try {
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER, // Must be a Twilio phone number
      to: to,
      statusCallback: `${env.BACKEND_URL}/api/webhooks/twilio/status`, // Webhook for status updates
    });

    return {
      sid: twilioMessage.sid,
      status: twilioMessage.status, // "queued", "sent", "delivered", "undelivered", "failed"
      errorCode: twilioMessage.errorCode,
      errorMessage: twilioMessage.errorMessage,
    };
  } catch (error: any) {
    console.error("Twilio SMS error:", error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Validate phone number format using Twilio's lookup API (optional, costs money)
 * For free validation, use libphonenumber instead
 */
export async function validatePhoneNumber(phoneNumber: string): Promise<boolean> {
  try {
    // Basic validation - use libphonenumber for free validation
    // This is just a placeholder if you want to use Twilio's paid lookup API
    return phoneNumber.startsWith("+") && phoneNumber.length >= 10;
  } catch (error) {
    return false;
  }
}

