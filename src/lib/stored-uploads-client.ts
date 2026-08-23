"use client";

import { parseStoredUploadUrl } from "@/lib/upload-folders";

/** Client-side helper — deletes MongoDB blob when replacing/removing stored uploads. */
export async function deleteStoredUploadByUrl(url?: string | null): Promise<void> {
  if (!parseStoredUploadUrl(url)) return;

  try {
    await fetch("/api/upload", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Non-blocking cleanup
  }
}
