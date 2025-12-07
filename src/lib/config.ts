/**
 * Frontend configuration and environment variables.
 *
 * Centralizes configuration values so modules like `api` and `authClient`
 * don't need to import from each other, avoiding require cycles.
 */

// Default backend URL for local development (your machine on LAN)
const DEFAULT_DEV_BACKEND_URL = "http://192.168.86.37:3000";

/**
 * Backend URL used by the mobile/web client.
 *
 * - Prefer `EXPO_PUBLIC_BACKEND_URL` for production/custom environments.
 * - Falls back to your local development backend when unset.
 *
 * NOTE: When running on a physical device, `localhost` refers to the device,
 * not your development machine. Use your local IP address instead.
 *
 * See `PRODUCTION_INSTRUCTIONS.md` for deployment details.
 */
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (__DEV__ ? DEFAULT_DEV_BACKEND_URL : DEFAULT_DEV_BACKEND_URL);

// Log the backend URL in development for quick diagnostics
if (__DEV__) {
  console.log("[Config] Backend URL:", BACKEND_URL);
}

export { BACKEND_URL };
