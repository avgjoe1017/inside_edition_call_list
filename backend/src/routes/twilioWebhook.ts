/**
 * Twilio Webhook Routes
 * Handles status callbacks from Twilio for SMS delivery tracking
 */

import { Hono } from "hono";
import type { AppType } from "../types";
import { db } from "../db";

const app = new Hono<AppType>();

/**
 * POST /api/webhooks/twilio/status
 * Twilio status callback webhook
 * Twilio calls this endpoint when SMS status changes (sent, delivered, failed, etc.)
 */
app.post("/status", async (c) => {
  try {
    // Twilio sends form data, not JSON
    const formData = await c.req.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const to = formData.get("To") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    console.log("📱 Twilio webhook received:", {
      messageSid,
      messageStatus,
      to,
      errorCode,
      errorMessage,
    });

    // Find the delivery record by phone number and most recent alert
    // We'll need to store the Twilio SID in the delivery record for better matching
    // For now, find by phone number and recent timestamp
    const delivery = await db.alertDelivery.findFirst({
      where: {
        phoneNumber: to,
        status: "sent", // Only update if still in "sent" status
      },
      orderBy: {
        sentAt: "desc",
      },
      include: {
        alert: true,
      },
    });

    if (!delivery) {
      console.warn("⚠️  No delivery record found for Twilio callback:", to);
      return c.text("OK", 200); // Return 200 so Twilio doesn't retry
    }

    // Map Twilio status to our status
    let status: "sent" | "delivered" | "failed" | "bounced" = delivery.status as "sent" | "delivered" | "failed" | "bounced";
    let deliveredAt: Date | null = delivery.deliveredAt;
    let errorReason: string | null = delivery.errorReason;

    switch (messageStatus) {
      case "delivered":
        status = "delivered";
        deliveredAt = new Date();
        break;
      case "failed":
      case "undelivered":
        status = "bounced";
        errorReason = errorMessage || `Twilio error: ${errorCode || "Unknown"}`;
        // Update phone number failure tracking
        const phoneNumber = await db.phoneNumber.findFirst({
          where: {
            number: to,
            marketId: delivery.marketId,
          },
        });
        if (phoneNumber) {
          await db.phoneNumber.update({
            where: { id: phoneNumber.id },
            data: {
              lastFailedAt: new Date(),
              failureCount: { increment: 1 },
            },
          });
        }
        break;
      case "sent":
        status = "sent";
        break;
      default:
        // Keep existing status for other statuses (queued, etc.)
        break;
    }

    // Update delivery record
    await db.alertDelivery.update({
      where: { id: delivery.id },
      data: {
        status,
        deliveredAt,
        errorReason,
      },
    });

    console.log(`✅ Updated delivery ${delivery.id} to status: ${status}`);

    // Return 200 OK to Twilio (they expect this)
    return c.text("OK", 200);
  } catch (error: any) {
    console.error("Error processing Twilio webhook:", error);
    // Still return 200 so Twilio doesn't keep retrying
    return c.text("OK", 200);
  }
});

export { app as twilioWebhookRouter };

