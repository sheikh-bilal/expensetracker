import mongoose, { Schema, models } from "mongoose";

export type MeterType = "electricity" | "water" | "gas";

const meterSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["electricity", "water", "gas"],
    },
    name: {
      type: String,
      required: [true, "Meter name is required"],
      trim: true,
    },
    refNo: {
      type: String,
      required: [true, "Reference number is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure refNo is unique per user
meterSchema.index({ userId: 1, refNo: 1 }, { unique: true });

const Meter = models.Meter || mongoose.model("Meter", meterSchema);

export default Meter;
