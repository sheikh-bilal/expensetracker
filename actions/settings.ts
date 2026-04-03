"use server";

import { unstable_noStore as noStore } from "next/cache";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "./auth";

export async function getUserSettings() {
  noStore(); // Disable caching
  try {
    await connectDB();

    const user = await getAuthUser();

    if (!user) {
      return null;
    }

    const fullUser = await User.findById(user._id).lean();

    if (!fullUser) {
      return null;
    }

    // Handle cases where settings field doesn't exist (old documents)
    const settings = (fullUser as any).settings || {};

    return {
      currency: settings.currency || "PKR",
      monthlyBudget: settings.monthlyBudget || null,
      savingsGoal: settings.savingsGoal || 20,
    };
  } catch (error) {
    console.error("Error getting user settings:", error);
    return {
      currency: "PKR",
      monthlyBudget: null,
    };
  }
}

export async function updateUserSettings(settings: { currency?: string; monthlyBudget?: number | null; savingsGoal?: number | null }) {
  try {
    await connectDB();

    const user = await getAuthUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const updateData: any = {};
    if (settings.currency !== undefined) {
      updateData["settings.currency"] = settings.currency;
    }
    if (settings.monthlyBudget !== undefined) {
      updateData["settings.monthlyBudget"] = settings.monthlyBudget;
    }
    if (settings.savingsGoal !== undefined) {
      updateData["settings.savingsGoal"] = settings.savingsGoal;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, upsert: false }
    ).lean();

    return {
      success: true,
      currency: (updatedUser as any)?.settings?.currency || "PKR",
      monthlyBudget: (updatedUser as any)?.settings?.monthlyBudget || null,
      savingsGoal: (updatedUser as any)?.settings?.savingsGoal || 20,
    };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { error: "Failed to update settings" };
  }
}
