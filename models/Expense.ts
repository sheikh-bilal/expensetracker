import mongoose, { Schema, models } from "mongoose";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  BILL_TYPES,
  EXPENSE_STATUSES,
  DEFAULT_EXPENSE_STATUS,
} from "@/lib/constants/expense";

const expenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: EXPENSE_CATEGORIES,
    },
    subCategory: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: PAYMENT_METHODS,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: EXPENSE_STATUSES,
      default: DEFAULT_EXPENSE_STATUS,
    },
    // Bills-specific fields
    billDetails: {
      billType: {
        type: String,
        enum: BILL_TYPES,
      },
      meterReadingId: {
        type: Schema.Types.ObjectId,
        ref: "MeterReading",
      },
    },
  },
  {
    timestamps: true,
  },
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

const Expense = models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
