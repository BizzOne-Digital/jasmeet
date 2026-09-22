import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => e.message).join(", ");
    return jsonError(message, 400);
  }
  if (error instanceof Error && error.message === "Unauthorized") {
    return jsonError("Unauthorized", 401);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
