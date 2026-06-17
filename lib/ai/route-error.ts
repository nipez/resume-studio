import {
  AIFeatureNotAvailableError,
  AIQuotaExceededError,
} from "@/lib/ai/errors";
import { NextResponse } from "next/server";

export function aiRouteErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof AIQuotaExceededError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: 429 }
    );
  }

  if (err instanceof AIFeatureNotAvailableError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: 403 }
    );
  }

  return null;
}
