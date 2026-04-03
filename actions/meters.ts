"use server";

import mongoose from "mongoose";
import Meter from "@/models/Meter";
import { getUserId } from "@/lib/auth-utils";

export type Meter = {
  _id: string;
  type: "electricity" | "water" | "gas";
  name: string;
  refNo: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function getMeters(): Promise<Meter[]> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return [];
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    const meters = await Meter.find({ userId }).sort({ createdAt: -1 }).lean();
    return meters.map((meter: any) => ({
      _id: meter._id.toString(),
      type: meter.type,
      name: meter.name,
      refNo: meter.refNo,
      createdAt: meter.createdAt,
      updatedAt: meter.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching meters:", error);
    return [];
  }
}

export async function createMeter(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to create a meter" };
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const type = formData.get("type") as "electricity" | "water" | "gas";
    const name = formData.get("name") as string;
    const refNo = formData.get("refNo") as string;

    if (!type || !name || !refNo) {
      return { error: "All fields are required" };
    }

    // Check if refNo already exists for this user
    const existingMeter = await Meter.findOne({ userId, refNo });
    if (existingMeter) {
      return { error: "A meter with this reference number already exists" };
    }

    await Meter.create({
      userId,
      type,
      name,
      refNo,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating meter:", error);
    if (error.code === 11000) {
      return { error: "A meter with this reference number already exists" };
    }
    return { error: "Failed to create meter" };
  }
}

export async function deleteMeter(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to delete a meter" };
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    const meter = await Meter.findOneAndDelete({ _id: id, userId });

    if (!meter) {
      return { error: "Meter not found or you don't have permission to delete it" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting meter:", error);
    return { error: "Failed to delete meter" };
  }
}

export async function getMeterById(id: string): Promise<Meter | null> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return null;
    }

    await mongoose.connect(process.env.MONGODB_URI!);
    const meter = await Meter.findOne({ _id: id, userId }).lean();
    if (!meter) return null;

    return {
      _id: (meter as any)._id.toString(),
      type: (meter as any).type,
      name: (meter as any).name,
      refNo: (meter as any).refNo,
      createdAt: (meter as any).createdAt,
      updatedAt: (meter as any).updatedAt,
    };
  } catch (error) {
    console.error("Error fetching meter:", error);
    return null;
  }
}

export async function updateMeter(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to update a meter" };
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const name = formData.get("name") as string;
    const refNo = formData.get("refNo") as string;

    if (!name || !refNo) {
      return { error: "All fields are required" };
    }

    // Check if refNo exists for another meter of this user
    const existingMeter = await Meter.findOne({
      userId,
      refNo,
      _id: { $ne: id }
    });
    if (existingMeter) {
      return { error: "A meter with this reference number already exists" };
    }

    const meter = await Meter.findOneAndUpdate(
      { _id: id, userId },
      { name, refNo },
      { new: true }
    );

    if (!meter) {
      return { error: "Meter not found or you don't have permission to update it" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating meter:", error);
    if (error.code === 11000) {
      return { error: "A meter with this reference number already exists" };
    }
    return { error: "Failed to update meter" };
  }
}
