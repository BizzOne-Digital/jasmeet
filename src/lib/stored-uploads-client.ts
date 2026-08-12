"use client";

/** Client-side helper — calls delete API when replacing/removing stored uploads. */
export async function deleteStoredUploadByUrl(url?: string | null): Promise<void> {
  if (!url?.startsWith("/api/uploads/")) return;
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Non-blocking cleanup
  }
}
