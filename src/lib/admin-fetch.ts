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
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Request failed" };
    }
    return { success: true, data: json.data as T };
  } catch {
    return { success: false, error: "Network error" };
  }
}
