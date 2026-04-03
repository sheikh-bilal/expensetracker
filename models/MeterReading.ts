import mongoose, { Schema, models } from "mongoose";
import { MONTHS } from "@/lib/constants/expense";

const meterReadingSchema = new Schema(
  {
    meterId: {
      type: Schema.Types.ObjectId,
      ref: "Meter",
      required: [true, "Meter ID is required"],
      index: true,
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      enum: MONTHS,
    },
    units: {
      type: Number,
      required: [true, "Units are required"],
      min: 0,
    },
    reading: {
      type: Number,
      required: [true, "Reading is required"],
      min: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one reading per meter per month per user
meterReadingSchema.index({ meterId: 1, month: 1, userId: 1 }, { unique: true });

const MeterReading = models.MeterReading || mongoose.model("MeterReading", meterReadingSchema);

export default MeterReading;
