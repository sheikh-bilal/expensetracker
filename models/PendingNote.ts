import mongoose, { Schema, models } from "mongoose";
import { NOTE_COLORS } from "@/lib/constants/pendingNote";

const pendingItemSchema = new Schema(
  {
    // Client-generated id so items can be keyed before the note is saved
    id: { type: String, required: true },
    label: { type: String, default: "", trim: true, maxlength: 120 },
    amount: { type: Number, default: 0, min: 0 },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const pendingNoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: { type: String, default: "", trim: true, maxlength: 60 },
    color: { type: String, enum: NOTE_COLORS, default: "lemon" },
    pinned: { type: Boolean, default: false },
    items: { type: [pendingItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const PendingNote = models.PendingNote || mongoose.model("PendingNote", pendingNoteSchema);

export default PendingNote;
