import { NextResponse } from "next/server";
import { seedDatabase } from "@/actions/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to seed database" },
      { status: 500 }
    );
  }
}
