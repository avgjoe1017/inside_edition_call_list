import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { storage } from "./secure-storage";
import { BACKEND_URL } from "./config";

export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
  plugins: [
    emailOTPClient(),
    expoClient({
      scheme: "insideedition", // Must match app.json "scheme" field
      storagePrefix: "inside-edition-call-list",
      storage,
    }),
  ],
});
