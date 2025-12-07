// contracts.ts
// Shared API contracts (schemas and types) used by both the server and the app.
// Import in the app as: `import { type GetSampleResponse } from "@shared/contracts"`
// Import in the server as: `import { postSampleRequestSchema } from "@shared/contracts"`

import { z } from "zod";

// GET /api/sample
export const getSampleResponseSchema = z.object({
  message: z.string(),
});
export type GetSampleResponse = z.infer<typeof getSampleResponseSchema>;

// POST /api/sample
export const postSampleRequestSchema = z.object({
  value: z.string(),
});
export type PostSampleRequest = z.infer<typeof postSampleRequestSchema>;
export const postSampleResponseSchema = z.object({
  message: z.string(),
});
export type PostSampleResponse = z.infer<typeof postSampleResponseSchema>;

// POST /api/upload/image
export const uploadImageRequestSchema = z.object({
  image: z.instanceof(File),
});
export type UploadImageRequest = z.infer<typeof uploadImageRequestSchema>;
export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string(),
  filename: z.string(),
});
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// Market schemas
export const phoneNumberSchema = z.object({
  id: z.string(),
  label: z.string(),
  number: z.string(),
  isPrimary: z.boolean(),
  lastFailedAt: z.string().nullable().optional(),
  failureCount: z.number().optional(),
});
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

export const marketSchema = z.object({
  id: z.string(),
  marketNumber: z.number(),
  name: z.string(),
  stationCallLetters: z.string().optional(),
  airTime: z.string(), // Time only (e.g., "10:00 PM")
  timezone: z.string(), // Timezone (EST, CST, MST, PST)
  list: z.enum(["3pm", "6pm"]), // Which list this station is on
  phones: z.array(phoneNumberSchema),
});
export type Market = z.infer<typeof marketSchema>;

// GET /api/markets - Get all markets
export const getMarketsResponseSchema = z.object({
  markets: z.array(marketSchema),
});
export type GetMarketsResponse = z.infer<typeof getMarketsResponseSchema>;

// GET /api/markets/:id - Get single market
export const getMarketResponseSchema = marketSchema;
export type GetMarketResponse = z.infer<typeof getMarketResponseSchema>;

// PATCH /api/markets/:marketId/phones/:phoneId/primary - Set primary phone
export const setPrimaryPhoneResponseSchema = marketSchema;
export type SetPrimaryPhoneResponse = z.infer<typeof setPrimaryPhoneResponseSchema>;

// PUT /api/markets/:id - Update market
export const updateMarketRequestSchema = z.object({
  name: z.string(),
  stationCallLetters: z.string().optional(),
  airTime: z.string(), // Time only (e.g., "10:00 PM")
  timezone: z.string(), // Timezone (EST, CST, MST, PST)
  list: z.enum(["3pm", "6pm"]), // Which list this station is on
  phones: z.array(
    z.object({
      id: z.string().optional(), // Optional because new phones won't have an ID
      label: z.string(),
      number: z.string(),
      isPrimary: z.boolean(),
    })
  ),
});
export type UpdateMarketRequest = z.infer<typeof updateMarketRequestSchema>;
export const updateMarketResponseSchema = marketSchema;
export type UpdateMarketResponse = z.infer<typeof updateMarketResponseSchema>;

// DELETE /api/markets/:marketId/phones/:phoneId - Delete phone
export const deletePhoneResponseSchema = marketSchema;
export type DeletePhoneResponse = z.infer<typeof deletePhoneResponseSchema>;

// Edit Log schemas
export const editLogSchema = z.object({
  id: z.string(),
  marketId: z.string(),
  field: z.string(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  editedBy: z.string().nullable(),
  createdAt: z.string(), // ISO date string
});
export type EditLog = z.infer<typeof editLogSchema>;

// GET /api/edit-logs - Get all edit logs
export const getEditLogsResponseSchema = z.object({
  logs: z.array(editLogSchema),
  groupedLogs: z.record(z.string(), z.array(editLogSchema)),
});
export type GetEditLogsResponse = z.infer<typeof getEditLogsResponseSchema>;

// GET /api/edit-logs/market/:marketId - Get edit logs for specific market
export const getMarketEditLogsResponseSchema = z.object({
  logs: z.array(editLogSchema),
});
export type GetMarketEditLogsResponse = z.infer<typeof getMarketEditLogsResponseSchema>;

// Call Log schemas
export const callLogSchema = z.object({
  id: z.string(),
  marketId: z.string(),
  marketName: z.string(),
  phoneNumber: z.string(),
  phoneLabel: z.string(),
  calledBy: z.string().nullable(),
  action: z.enum(["viewed", "called"]),
  createdAt: z.string(), // ISO date string
});
export type CallLog = z.infer<typeof callLogSchema>;

// POST /api/call-logs - Log a call action
export const createCallLogRequestSchema = z.object({
  marketId: z.string(),
  marketName: z.string(),
  phoneNumber: z.string(),
  phoneLabel: z.string(),
  action: z.enum(["viewed", "called"]),
  calledBy: z.string().nullable().optional(),
});
export type CreateCallLogRequest = z.infer<typeof createCallLogRequestSchema>;

export const createCallLogResponseSchema = z.object({
  success: z.boolean(),
  callLog: callLogSchema,
});
export type CreateCallLogResponse = z.infer<typeof createCallLogResponseSchema>;

// GET /api/call-logs - Get call logs
export const getCallLogsResponseSchema = z.object({
  logs: z.array(callLogSchema),
  groupedLogs: z.record(z.string(), z.array(callLogSchema)),
});
export type GetCallLogsResponse = z.infer<typeof getCallLogsResponseSchema>;

// GET /api/call-logs/stats - Get call statistics
export const getCallStatsResponseSchema = z.object({
  totalCalls: z.number(),
  totalViews: z.number(),
  topMarkets: z.array(
    z.object({
      marketName: z.string(),
      count: z.number(),
    })
  ),
});
export type GetCallStatsResponse = z.infer<typeof getCallStatsResponseSchema>;

// Alert recipient group schemas
export const recipientGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  recipientCount: z.number(),
  list: z.enum(["all", "3pm", "6pm"]),
});
export type RecipientGroup = z.infer<typeof recipientGroupSchema>;

// GET /api/alert-groups - Get all recipient groups
export const getAlertGroupsResponseSchema = z.object({
  groups: z.array(recipientGroupSchema),
});
export type GetAlertGroupsResponse = z.infer<typeof getAlertGroupsResponseSchema>;

// POST /api/alerts/voice - Send voice alert
export const sendVoiceAlertRequestSchema = z.object({
  groupId: z.string(),
  audioUrl: z.string(),
  audioDuration: z.number(), // in seconds
  sentBy: z.string().nullable().optional(),
});
export type SendVoiceAlertRequest = z.infer<typeof sendVoiceAlertRequestSchema>;

export const sendVoiceAlertResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  recipientCount: z.number(),
  alertId: z.string(),
});
export type SendVoiceAlertResponse = z.infer<typeof sendVoiceAlertResponseSchema>;

// POST /api/alerts/text - Send text alert
export const sendTextAlertRequestSchema = z.object({
  groupId: z.string(),
  message: z.string(),
  sentBy: z.string().nullable().optional(),
});
export type SendTextAlertRequest = z.infer<typeof sendTextAlertRequestSchema>;

export const sendTextAlertResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  recipientCount: z.number(),
  alertId: z.string(),
  smsSegments: z.number(),
});
export type SendTextAlertResponse = z.infer<typeof sendTextAlertResponseSchema>;

// Alert Log schemas - for comprehensive alert history and audit trail
export const alertDeliverySchema = z.object({
  id: z.string(),
  alertId: z.string(),
  marketId: z.string(),
  marketName: z.string(),
  phoneNumber: z.string(),
  phoneLabel: z.string(),
  status: z.enum(["sent", "delivered", "failed", "bounced"]),
  errorReason: z.string().nullable(),
  sentAt: z.string(), // ISO date string
  deliveredAt: z.string().nullable(), // ISO date string
  readAt: z.string().nullable(), // ISO date string
});
export type AlertDelivery = z.infer<typeof alertDeliverySchema>;

export const alertLogSchema = z.object({
  id: z.string(),
  alertType: z.enum(["voice", "text"]),
  message: z.string().nullable(),
  audioUrl: z.string().nullable(),
  audioDuration: z.number().nullable(),
  recipientGroup: z.enum(["all", "3pm", "6pm"]),
  recipientCount: z.number(),
  sentBy: z.string().nullable(),
  createdAt: z.string(), // ISO date string
  deliveries: z.array(alertDeliverySchema).optional(), // Optional, only included when detailed
});
export type AlertLog = z.infer<typeof alertLogSchema>;

// GET /api/alert-logs - Get all alert logs
export const getAlertLogsResponseSchema = z.object({
  logs: z.array(alertLogSchema),
  groupedLogs: z.record(z.string(), z.array(alertLogSchema)),
});
export type GetAlertLogsResponse = z.infer<typeof getAlertLogsResponseSchema>;

// GET /api/alert-logs/:id - Get single alert log with deliveries
export const getAlertLogResponseSchema = z.object({
  log: alertLogSchema,
  deliveries: z.array(alertDeliverySchema),
  stats: z.object({
    sent: z.number(),
    delivered: z.number(),
    failed: z.number(),
    bounced: z.number(),
  }),
});
export type GetAlertLogResponse = z.infer<typeof getAlertLogResponseSchema>;

// GET /api/markets/:id - Updated to include failure indicators
export const phoneNumberWithFailuresSchema = phoneNumberSchema.extend({
  lastFailedAt: z.string().nullable(),
  failureCount: z.number(),
  hasFailed: z.boolean(), // Computed field for UI
});
export type PhoneNumberWithFailures = z.infer<typeof phoneNumberWithFailuresSchema>;

// POST /api/import/csv - Import CSV data
export const importCSVRequestSchema = z.object({
  csvData: z.string().min(1, "CSV data is required"),
  dryRun: z.boolean().optional().default(false),
});
export type ImportCSVRequest = z.infer<typeof importCSVRequestSchema>;

export const importCSVResponseSchema = z.object({
  success: z.boolean(),
  dryRun: z.boolean(),
  results: z.object({
    created: z.number(),
    updated: z.number(),
    skipped: z.number(),
    errors: z.array(
      z.object({
        marketNumber: z.number(),
        error: z.string(),
      })
    ),
  }),
  message: z.string(),
});
export type ImportCSVResponse = z.infer<typeof importCSVResponseSchema>;

