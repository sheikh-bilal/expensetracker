import { NextResponse } from "next/server";
import { destroySessionOnly } from "@/lib/auth-utils";

export async function POST() {
  await destroySessionOnly();
  return NextResponse.json({ success: true });
}
