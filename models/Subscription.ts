import mongoose, { Schema, models } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    billingDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["entertainment", "bills", "education", "other"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ isActive: 1 });
subscriptionSchema.index({ billingDate: 1 });

const Subscription = models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
