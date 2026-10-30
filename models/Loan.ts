import mongoose, { Schema, models } from "mongoose";

const paymentSchema = new Schema(
  {
    // Client-generated id so a payment can be addressed without its own collection
    id: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paidOn: { type: Date, default: Date.now },
    note: { type: String, default: "", trim: true, maxlength: 120 },
  },
  { _id: false }
);

const loanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    lender: {
      type: String,
      required: [true, "Lender is required"],
      trim: true,
      maxlength: 80,
    },
    purpose: { type: String, default: "", trim: true, maxlength: 120 },
    principal: {
      type: Number,
      required: [true, "Loan amount is required"],
      min: 0.01,
    },
    takenOn: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    note: { type: String, default: "", trim: true, maxlength: 300 },
    payments: { type: [paymentSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Loan = models.Loan || mongoose.model("Loan", loanSchema);

export default Loan;
