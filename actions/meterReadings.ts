"use server";

import mongoose from "mongoose";
import MeterReading from "@/models/MeterReading";
import { getUserId } from "@/lib/auth-utils";

export type MeterReadingData = {
  _id: string;
  meterId: string;
  month: string;
  units: number;
  reading: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function createMeterReading(formData: FormData): Promise<{ success?: boolean; error?: string; readingId?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to create a meter reading" };
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const meterId = formData.get("meterId") as string;
    const month = formData.get("month") as string;
    const units = Number(formData.get("units"));
    const reading = Number(formData.get("reading"));

    if (!meterId || !month || isNaN(units) || isNaN(reading)) {
      return { error: "All fields are required" };
    }

    // Check if a reading already exists for this meter and month
    const existingReading = await MeterReading.findOne({
      meterId,
      month,
      userId,
    });

    if (existingReading) {
      // Update existing reading
      existingReading.units = units;
      existingReading.reading = reading;
      await existingReading.save();
      return { success: true, readingId: existingReading._id.toString() };
    }

    // Create new reading
    const newReading = await MeterReading.create({
      meterId,
      month,
      units,
      reading,
      userId,
    });

    return { success: true, readingId: newReading._id.toString() };
  } catch (error: any) {
    console.error("Error creating meter reading:", error);
    return { error: "Failed to create meter reading" };
  }
}

export async function getMeterReadings(meterId?: string): Promise<MeterReadingData[]> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return [];
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const query: any = { userId };
    if (meterId) {
      query.meterId = meterId;
    }

    const readings = await MeterReading.find(query).sort({ createdAt: -1 }).lean();
    return readings.map((reading: any) => ({
      _id: reading._id.toString(),
      meterId: reading.meterId.toString(),
      month: reading.month,
      units: reading.units,
      reading: reading.reading,
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching meter readings:", error);
    return [];
  }
}
