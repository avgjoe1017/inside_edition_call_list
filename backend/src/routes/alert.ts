/**
 * Alert Routes
 * Handles sending voice and text alerts to station groups
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppType } from "../types";
import { db } from "../db";
import {
  sendTextAlertRequestSchema,
  sendVoiceAlertRequestSchema,
} from "../../../shared/contracts";
import { sendSMS } from "../lib/twilio";
import { validateAndFormatPhone } from "../lib/phoneValidator";

const app = new Hono<AppType>();

/**
 * POST /api/alerts/text
 * Send text alert (SMS) to a recipient group
 */
app.post(
  "/text",
  zValidator("json", sendTextAlertRequestSchema),
  async (c) => {
    try {
      const { groupId, message } = c.req.valid("json");
      const user = c.get("user");
      const sentBy = user?.email || user?.name || null;

      // Determine which markets to target based on group
      let markets;
      if (groupId === "all") {
        markets = await db.market.findMany({
          include: { phones: true },
        });
      } else if (groupId === "3pm") {
        markets = await db.market.findMany({
          where: { list: "3pm" },
          include: { phones: true },
        });
      } else if (groupId === "6pm") {
        markets = await db.market.findMany({
          where: { list: "6pm" },
          include: { phones: true },
        });
      } else {
        return c.json({ error: "Invalid recipient group" }, 400);
      }

      // Create alert log entry
      const alertLog = await db.alertLog.create({
        data: {
          alertType: "text",
          message,
          recipientGroup: groupId === "all" ? "all" : groupId,
          recipientCount: markets.length,
          sentBy: sentBy || null,
        },
      });

      // Calculate SMS segments (160 chars per segment)
      const smsSegments = Math.ceil(message.length / 160);

      // Send SMS to each market's primary phone number
      const deliveryPromises = markets.map(async (market) => {
        const primaryPhone = market.phones.find((p) => p.isPrimary) || market.phones[0];
        if (!primaryPhone) return null;

        // Validate and format phone number
        const phoneValidation = validateAndFormatPhone(primaryPhone.number, "US");
        if (!phoneValidation.isValid || !phoneValidation.formatted) {
          // Create delivery record with failed status
          return await db.alertDelivery.create({
            data: {
              alertId: alertLog.id,
              marketId: market.id,
              marketName: market.name,
              phoneNumber: primaryPhone.number,
              phoneLabel: primaryPhone.label,
              status: "bounced",
              errorReason: phoneValidation.error || "Invalid phone number format",
            },
          });
        }

        try {
          // Send SMS via Twilio
          const twilioResult = await sendSMS(phoneValidation.formatted, message);

          // Map Twilio status to our status
          let status: "sent" | "delivered" | "failed" | "bounced" = "sent";
          let errorReason: string | null = null;

          if (twilioResult.status === "failed" || twilioResult.status === "undelivered") {
            status = "bounced";
            errorReason = twilioResult.errorMessage || "Delivery failed";
          } else if (twilioResult.status === "delivered") {
            status = "delivered";
          }

          // Create delivery record
          const delivery = await db.alertDelivery.create({
            data: {
              alertId: alertLog.id,
              marketId: market.id,
              marketName: market.name,
              phoneNumber: primaryPhone.number,
              phoneLabel: primaryPhone.label,
              status,
              errorReason,
              sentAt: new Date(),
            },
          });

          // Update phone number failure tracking if delivery failed
          if (status === "bounced") {
            await db.phoneNumber.update({
              where: { id: primaryPhone.id },
              data: {
                lastFailedAt: new Date(),
                failureCount: { increment: 1 },
              },
            });
          }

          return delivery;
        } catch (error: any) {
          // Handle Twilio API errors
          console.error(`Failed to send SMS to ${market.name}:`, error);

          const delivery = await db.alertDelivery.create({
            data: {
              alertId: alertLog.id,
              marketId: market.id,
              marketName: market.name,
              phoneNumber: primaryPhone.number,
              phoneLabel: primaryPhone.label,
              status: "failed",
              errorReason: error.message || "SMS sending failed",
            },
          });

          // Update phone number failure tracking
          await db.phoneNumber.update({
            where: { id: primaryPhone.id },
            data: {
              lastFailedAt: new Date(),
              failureCount: { increment: 1 },
            },
          });

          return delivery;
        }
      });

      // Wait for all SMS sends to complete (or fail)
      await Promise.allSettled(deliveryPromises);

      return c.json({
        success: true,
        message: `Text alert sent to ${markets.length} recipients`,
        recipientCount: markets.length,
        alertId: alertLog.id,
        smsSegments,
      });
    } catch (error: any) {
      console.error("Error sending text alert:", error);
      return c.json({ error: "Failed to send text alert", details: error.message }, 500);
    }
  }
);

/**
 * POST /api/alerts/voice
 * Send voice alert to a recipient group
 * Note: Voice alerts would require a different service (e.g., Twilio Voice API or audio file distribution)
 * This is a placeholder for future implementation
 */
app.post(
  "/voice",
  zValidator("json", sendVoiceAlertRequestSchema),
  async (c) => {
    try {
      const { groupId, audioUrl, audioDuration } = c.req.valid("json");
      const user = c.get("user");
      const sentBy = user?.email || user?.name || null;

      // Determine which markets to target based on group
      let markets;
      if (groupId === "all") {
        markets = await db.market.findMany({
          include: { phones: true },
        });
      } else if (groupId === "3pm") {
        markets = await db.market.findMany({
          where: { list: "3pm" },
          include: { phones: true },
        });
      } else if (groupId === "6pm") {
        markets = await db.market.findMany({
          where: { list: "6pm" },
          include: { phones: true },
        });
      } else {
        return c.json({ error: "Invalid recipient group" }, 400);
      }

      // Create alert log entry
      const alertLog = await db.alertLog.create({
        data: {
          alertType: "voice",
          audioUrl,
          audioDuration,
          recipientGroup: groupId === "all" ? "all" : groupId,
          recipientCount: markets.length,
          sentBy: sentBy || null,
        },
      });

      // TODO: Implement voice alert delivery (e.g., via Twilio Voice API or file distribution)
      // For now, create delivery records with "sent" status
      const deliveryPromises = markets.map(async (market) => {
        const primaryPhone = market.phones.find((p) => p.isPrimary) || market.phones[0];
        if (!primaryPhone) return null;

        return await db.alertDelivery.create({
          data: {
            alertId: alertLog.id,
            marketId: market.id,
            marketName: market.name,
            phoneNumber: primaryPhone.number,
            phoneLabel: primaryPhone.label,
            status: "sent",
          },
        });
      });

      await Promise.allSettled(deliveryPromises);

      return c.json({
        success: true,
        message: `Voice alert sent to ${markets.length} recipients`,
        recipientCount: markets.length,
        alertId: alertLog.id,
      });
    } catch (error: any) {
      console.error("Error sending voice alert:", error);
      return c.json({ error: "Failed to send voice alert", details: error.message }, 500);
    }
  }
);

export { app as alertRouter };

