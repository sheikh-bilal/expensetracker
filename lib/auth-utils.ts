import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "./db";
import User from "@/models/User";

export async function getSession() {
  try {
    const cookiesList = await cookies();
    const sessionToken = cookiesList.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    await connectDB();

    // Find user by session token (you might want to store userId instead and look up by userId)
    // For now, we'll decode a simple JWT-like token or use the session directly
    const userId = sessionToken; // Simplified - in production, verify JWT

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return null;
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function createSession(userId: string) {
  const cookiesList = await cookies();

  cookiesList.set("session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export async function destroySession() {
  const cookiesList = await cookies();

  cookiesList.delete("session");
}

export async function requireAuth() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  // Add admin checks here if needed
  return user;
}

// Helper function to destroy session without redirect (for API routes)
export async function destroySessionOnly() {
  const cookiesList = await cookies();
  cookiesList.delete("session");
}

// Efficient helper - returns userId without DB lookup
export async function getUserId(): Promise<string | null> {
  try {
    const cookiesList = await cookies();
    const sessionToken = cookiesList.get("session")?.value;
    return sessionToken || null;
  } catch {
    return null;
  }
}
