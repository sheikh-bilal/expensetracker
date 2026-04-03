import mongoose, { Schema, models } from "mongoose";
import bcrypt from "bcryptjs";

const userSettingsSchema = new Schema({
  currency: {
    type: String,
    default: "PKR",
    enum: ["PKR", "USD", "EUR", "GBP", "INR", "AED", "SAR"],
  },
  monthlyBudget: {
    type: Number,
    default: null,
  },
  savingsGoal: {
    type: Number,
    default: 20, // Default 20% savings goal
    min: 0,
    max: 100,
  },
}, { _id: false });

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    settings: {
      type: userSettingsSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const User = models.User || mongoose.model("User", userSchema);

export default User;
