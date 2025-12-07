import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";

import { auth } from "./auth";
import { env } from "./env";
import { uploadRouter } from "./routes/upload";
import { sampleRouter } from "./routes/sample";
import { marketRouter } from "./routes/market";
import { editLogRouter } from "./routes/editLog";
import callLogRouter from "./routes/callLog";
import alertLogRouter from "./routes/alertLog";
import { alertRouter } from "./routes/alert";
import { alertGroupsRouter } from "./routes/alertGroups";
import { twilioWebhookRouter } from "./routes/twilioWebhook";
import { importRouter } from "./routes/import";
import { type AppType } from "./types";

// AppType context adds user and session to the context, will be null if the user or session is null
const app = new Hono<AppType>();

console.log("🔧 Initializing Hono application...");
app.use("*", logger());
// CORS configuration - allows requests from frontend domains
const allowedOrigins = [
  "http://localhost:8081", // Expo dev server
  "http://localhost:19006", // Expo web dev server
  "https://inside-edition-call-list.vercel.app", // Vercel production
  "https://inside-edition-call-list.netlify.app", // Netlify production
  process.env.FRONTEND_URL, // Custom frontend URL from env
].filter(Boolean);

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return "*";
      // Allow configured origins
      if (allowedOrigins.includes(origin)) return origin;
      // In development, allow any localhost
      if (env.NODE_ENV === "development" && origin.includes("localhost")) return origin;
      // Default fallback
      return origin;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

/** Authentication middleware
 * Extracts session from request headers and attaches user/session to context
 * All routes can access c.get("user") and c.get("session")
 */
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null); // type: typeof auth.$Infer.Session.user | null
  c.set("session", session?.session ?? null); // type: typeof auth.$Infer.Session.session | null
  return next();
});

// Better Auth handler
// Handles all authentication endpoints: /api/auth/sign-in, /api/auth/sign-up, etc.
console.log("🔐 Mounting Better Auth handler at /api/auth/*");
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Serve uploaded images statically
// Files in uploads/ directory are accessible at /uploads/* URLs
console.log("📁 Serving static files from uploads/ directory");
app.use("/uploads/*", serveStatic({ root: "./" }));

// Mount route modules
console.log("📤 Mounting upload routes at /api/upload");
app.route("/api/upload", uploadRouter);

console.log("📝 Mounting sample routes at /api/sample");
app.route("/api/sample", sampleRouter);

console.log("📍 Mounting market routes at /api/markets");
app.route("/api/markets", marketRouter);

console.log("📋 Mounting edit log routes at /api/edit-logs");
app.route("/api/edit-logs", editLogRouter);

console.log("📞 Mounting call log routes at /api/call-logs");
app.route("/api/call-logs", callLogRouter);

console.log("📢 Mounting alert log routes at /api/alert-logs");
app.route("/api/alert-logs", alertLogRouter);

console.log("📨 Mounting alert routes at /api/alerts");
app.route("/api/alerts", alertRouter);

console.log("👥 Mounting alert groups routes at /api/alert-groups");
app.route("/api/alert-groups", alertGroupsRouter);

console.log("📱 Mounting Twilio webhook routes at /api/webhooks/twilio");
app.route("/api/webhooks/twilio", twilioWebhookRouter);

console.log("📥 Mounting import routes at /api/import");
app.route("/api/import", importRouter);

// Health check endpoint
// Used by load balancers and monitoring tools to verify service is running
app.get("/health", (c) => {
  console.log("💚 Health check requested");
  return c.json({ status: "ok" });
});

// Start the server
console.log("⚙️  Starting server...");
serve({ fetch: app.fetch, port: Number(env.PORT) }, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📍 Environment: ${env.NODE_ENV || "development"}`);
  console.log(`🚀 Server is running on port ${env.PORT}`);
  if (env.NODE_ENV === "development") {
    console.log(`🔗 Base URL: http://localhost:${env.PORT}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📚 Available endpoints:");
    console.log("  🔐 Auth:     /api/auth/*");
    console.log("  📤 Upload:   POST /api/upload/image");
    console.log("  📝 Sample:   GET/POST /api/sample");
    console.log("  📍 Markets:  GET /api/markets");
    console.log("               GET /api/markets/:id");
    console.log("               PUT /api/markets/:id");
    console.log("               PATCH /api/markets/:marketId/phones/:phoneId/primary");
    console.log("               DELETE /api/markets/:marketId/phones/:phoneId");
    console.log("  📋 EditLogs: GET /api/edit-logs");
    console.log("               GET /api/edit-logs/market/:marketId");
    console.log("  📞 CallLogs: GET /api/call-logs");
    console.log("               POST /api/call-logs");
    console.log("  📢 AlertLogs: GET /api/alert-logs");
    console.log("                GET /api/alert-logs/:id");
    console.log("  📨 Alerts:   POST /api/alerts/text");
    console.log("               POST /api/alerts/voice");
    console.log("  👥 Groups:   GET /api/alert-groups");
    console.log("  📱 Webhooks: POST /api/webhooks/twilio/status");
    console.log("  📥 Import:   POST /api/import/csv");
    console.log("  💚 Health:   GET /health");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } else {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
});
