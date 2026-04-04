"use server";

import { unstable_noStore as noStore } from "next/cache";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";
import Subscription from "@/models/Subscription";
import Meter from "@/models/Meter";
import { getAuthUser } from "./auth";
import { getUserId } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

export async function getProfileStats() {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return null;

    await connectDB();

    const [expenseCount, subscriptionCount, meterCount, user] = await Promise.all([
      Expense.countDocuments({ userId }),
      Subscription.countDocuments({ userId }),
      Meter.countDocuments({ userId }),
      User.findById(userId).lean(),
    ]);

    return {
      expenseCount,
      subscriptionCount,
      meterCount,
      createdAt: (user as any)?.createdAt ?? null,
    };
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return null;
  }
}

export async function updateProfile(data: { name: string }) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return { error: "Unauthorized" };

    const name = data.name.trim();
    if (!name || name.length < 2) return { error: "Name must be at least 2 characters" };

    await User.findByIdAndUpdate(user._id, { name });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return { error: "Unauthorized" };

    const fullUser = await User.findById(user._id).select("+password");
    if (!fullUser) return { error: "User not found" };

    const isValid = await fullUser.comparePassword(data.currentPassword);
    if (!isValid) return { error: "Current password is incorrect" };

    if (data.newPassword.length < 6)
      return { error: "New password must be at least 6 characters" };

    fullUser.password = data.newPassword;
    await fullUser.save();

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: "Failed to change password" };
  }
}
