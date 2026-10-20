// ─── API response helpers ───────────────────────────────────────────────────
// ok(data) → 200 JSON · error(msg, status) → { error } JSON.
// Every route returns one of these so clients read payload.error uniformly.
import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
