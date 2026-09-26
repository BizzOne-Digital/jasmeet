import { NextResponse } from "next/server";
import { ZodError } from "zod";
import mongoose from "mongoose";

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => e.message).join(", ");
    return jsonError(message, 400);
  }
  if (error instanceof Error && error.message === "Unauthorized") {
    return jsonError("Unauthorized", 401);
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
    return jsonError(message || "Validation failed", 400);
  }
  if (error instanceof mongoose.Error.CastError) {
    return jsonError(`Invalid value for ${error.path}`, 400);
  }
  if (isDuplicateKeyError(error)) {
    return jsonError("A record with this slug or SKU already exists", 409);
  }
  if (
    error instanceof Error &&
    error.message.includes("MONGODB_URI")
  ) {
    return jsonError(
      "Database is not configured. Set MONGODB_URI on the server.",
      503
    );
  }
  if (error instanceof SyntaxError) {
    return jsonError("Invalid request body", 400);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
