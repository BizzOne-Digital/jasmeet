export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function adminFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const json = await res.json().catch(() => ({}));

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login?expired=1";
      }
      return {
        success: false,
        error: "Session expired. Please sign in again.",
      };
    }

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Request failed" };
    }
    return { success: true, data: json.data as T };
  } catch {
    return { success: false, error: "Network error" };
  }
}
