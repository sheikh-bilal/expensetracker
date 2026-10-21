"use server";

import connectDB from "@/lib/db";
import PendingNote from "@/models/PendingNote";
import { getUserId } from "@/lib/auth-utils";
import {
  MAX_NOTE_ITEMS,
  NOTE_COLORS,
  type NoteColor,
} from "@/lib/constants/pendingNote";

export type PendingItem = {
  id: string;
  label: string;
  amount: number;
  done: boolean;
};

export type PendingNoteRecord = {
  _id: string;
  title: string;
  color: NoteColor;
  pinned: boolean;
  items: PendingItem[];
  createdAt: string;
  updatedAt: string;
};

export type PendingNoteInput = Partial<
  Pick<PendingNoteRecord, "title" | "color" | "pinned" | "items">
>;

function serialize(note: any): PendingNoteRecord {
  return {
    _id: note._id.toString(),
    title: note.title ?? "",
    color: note.color,
    pinned: !!note.pinned,
    items: (note.items ?? []).map((item: any) => ({
      id: item.id,
      label: item.label ?? "",
      amount: item.amount ?? 0,
      done: !!item.done,
    })),
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
  };
}

// Whitelists and clamps client input before it reaches the database
function sanitize(input: PendingNoteInput): PendingNoteInput {
  const clean: PendingNoteInput = {};

  if (typeof input.title === "string") clean.title = input.title.slice(0, 60);
  if (input.color && NOTE_COLORS.includes(input.color)) clean.color = input.color;
  if (typeof input.pinned === "boolean") clean.pinned = input.pinned;
  if (Array.isArray(input.items)) {
    clean.items = input.items.slice(0, MAX_NOTE_ITEMS).map((item) => {
      const amount = Number(item.amount);
      return {
        id: String(item.id).slice(0, 64),
        label: String(item.label ?? "").slice(0, 120),
        amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
        done: !!item.done,
      };
    });
  }

  return clean;
}

export async function getPendingNotes(): Promise<PendingNoteRecord[]> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return [];
    }

    await connectDB();
    const notes = await PendingNote.find({ userId }).sort({ createdAt: -1 }).lean();
    return notes.map(serialize);
  } catch (error) {
    console.error("Error fetching pending notes:", error);
    return [];
  }
}

export async function createPendingNote(
  input: PendingNoteInput = {}
): Promise<{ note?: PendingNoteRecord; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to create a note" };
    }

    await connectDB();
    const note = await PendingNote.create({ userId, ...sanitize(input) });
    return { note: serialize(note.toObject()) };
  } catch (error) {
    console.error("Error creating pending note:", error);
    return { error: "Failed to create note" };
  }
}

export async function updatePendingNote(
  id: string,
  input: PendingNoteInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to update a note" };
    }

    await connectDB();
    const note = await PendingNote.findOneAndUpdate(
      { _id: id, userId },
      { $set: sanitize(input) },
      { runValidators: true }
    );

    if (!note) {
      return { error: "Note not found or you don't have permission to update it" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating pending note:", error);
    return { error: "Failed to save note" };
  }
}

export async function deletePendingNote(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to delete a note" };
    }

    await connectDB();
    const note = await PendingNote.findOneAndDelete({ _id: id, userId });

    if (!note) {
      return { error: "Note not found or you don't have permission to delete it" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting pending note:", error);
    return { error: "Failed to delete note" };
  }
}
