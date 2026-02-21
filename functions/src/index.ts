import * as functions from "firebase-functions";
// Synced from ../server during build; no TypeScript types are generated for it.
// @ts-expect-error - JavaScript backend module without declaration file.
import app from "../backend/index.js";

export const api = functions.https.onRequest(app);
