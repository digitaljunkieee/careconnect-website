import { NextResponse } from "next/server";

export function jsonSuccess<T>(
  data: T,
  message = "OK",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  );
}

export function jsonError(
  message: string,
  status = 500,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details
      }
    },
    { status }
  );
}

export function getErrorStatus(error: unknown, fallback = 500) {
  if (error && typeof error === "object" && "statusCode" in error) {
    const value = (error as { statusCode?: unknown }).statusCode;
    if (typeof value === "number") {
      return value;
    }
  }

  return fallback;
}
