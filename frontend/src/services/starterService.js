// src/services/starterService.js
import { apiRequest, downloadFile } from "../utils/api";

/**
 * Call backend to activate Starter key for current user.
 * Backend will:
 * - check active STARTER plan
 * - create key if missing
 * - mark it active
 */
export async function activateStarterKey() {
  return apiRequest("/api/extension/starter/activate", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Deactivate Starter key for logged-in user
 */
export async function deactivateStarterKey() {
  return apiRequest("/api/extension/starter/deactivate", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Download Starter (Essential) extension zip
 */
export async function downloadStarterExtension() {
  await downloadFile(
    "/api/user/download/starter",
    "DopeGuard_Essential_Starter.zip"
  );
}

/**
 * Download Premium extension zip
 */
export async function downloadPremiumExtension() {
  await downloadFile("/api/user/download/premium", "DopeGuard_Premium.zip");
}
