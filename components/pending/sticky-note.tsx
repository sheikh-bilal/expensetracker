"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, CornerDownLeft, Eraser, Pin, PinOff, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  MAX_NOTE_ITEMS,
  NOTE_COLORS,
  NOTE_COLOR_LABELS,
  NOTE_SWATCHES,
  type NoteColor,
} from "@/lib/constants/pendingNote";
import type {
  PendingItem,
  PendingNoteInput,
  PendingNoteRecord,
} from "@/actions/pendingNotes";

const HAND = "[font-family:var(--font-hand),cursive]";

function newItemId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** "Milk 250", "Rent: 45,000", "250" → label + amount. */
export function parseQuickAdd(text: string): { label: string; amount: number } {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.*?)[\s:=@\-–]*(\d[\d,]*(?:\.\d+)?)$/);
  if (!match) return { label: trimmed, amount: 0 };
  return {
    label: match[1].trim(),
    amount: parseFloat(match[2].replace(/,/g, "")) || 0,
  };
}

export function noteTotals(items: PendingItem[]) {
  let pending = 0;
  let settled = 0;
  let openCount = 0;
  for (const item of items) {
    if (item.done) {
      settled += item.amount;
    } else {
      pending += item.amount;
      openCount++;
    }
  }
  return { pending, settled, openCount };
}

/** Free-typing amount field that only commits valid numbers. */
function AmountInput({
  value,
  onCommit,
  className,
  onKeyDown,
}: {
  value: number;
  onCommit: (value: number) => void;
  className?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [draft, setDraft] = useState(value ? String(value) : "");
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(value ? String(value) : "");
  }, [value]);

  return (
    <input
      inputMode="decimal"
      aria-label="Amount"
      placeholder="0"
      value={draft}
      onFocus={(e) => {
        focused.current = true;
        e.currentTarget.select();
      }}
      onBlur={() => {
        focused.current = false;
        setDraft(value ? String(value) : "");
      }}
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d.,]/g, "");
        setDraft(next);
        const parsed = parseFloat(next.replace(/,/g, ""));
        onCommit(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
      }}
      onKeyDown={onKeyDown}
      className={className}
    />
  );
}

function ItemRow({
  item,
  onChange,
  onRemove,
  onEnter,
}: {
  item: PendingItem;
  onChange: (patch: Partial<PendingItem>) => void;
  onRemove: () => void;
  onEnter: () => void;
}) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <li className="group/item flex h-9 items-center gap-2">
      <button
        type="button"
        onClick={() => onChange({ done: !item.done })}
        aria-label={item.done ? "Mark as pending" : "Mark as paid"}
        aria-pressed={item.done}
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all",
          "border-[color:var(--note-ink)]/35 hover:border-[color:var(--note-accent)] hover:scale-110",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--note-accent)]",
          item.done && "border-[color:var(--note-accent)] bg-[var(--note-accent)] text-white",
        )}
      >
        {item.done && <Check className="size-3" strokeWidth={3.5} />}
      </button>

      <input
        value={item.label}
        onChange={(e) => onChange({ label: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && item.label === "" && !item.amount) {
            e.preventDefault();
            onRemove();
          } else {
            handleKey(e);
          }
        }}
        placeholder="Something to pay…"
        maxLength={120}
        aria-label="Item"
        className={cn(
          HAND,
          "min-w-0 flex-1 truncate bg-transparent text-[21px] leading-none outline-none placeholder:text-[color:var(--note-ink)]/30",
          "decoration-[color:var(--note-accent)] decoration-2 transition-opacity",
          item.done && "line-through opacity-50",
        )}
      />

      <AmountInput
        value={item.amount}
        onCommit={(amount) => onChange({ amount })}
        onKeyDown={handleKey}
        className={cn(
          HAND,
          "w-20 shrink-0 bg-transparent text-right text-[21px] font-semibold leading-none tabular-nums outline-none placeholder:text-[color:var(--note-ink)]/25",
          item.done && "line-through opacity-50",
        )}
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        className="-mr-1 flex size-5 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-black/10 focus-visible:opacity-100 group-hover/item:opacity-60 [@media(hover:none)]:opacity-40"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>
    </li>
  );
}

export function StickyNote({
  note,
  tilt,
  autoFocus,
  onChange,
  onDelete,
}: {
  note: PendingNoteRecord;
  tilt: number;
  autoFocus?: boolean;
  onChange: (patch: PendingNoteInput) => void;
  onDelete: () => void;
}) {
  const [quickAdd, setQuickAdd] = useState("");
  const quickAddRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const { pending, settled, openCount } = noteTotals(note.items);
  const doneCount = note.items.length - openCount;
  const allSettled = note.items.length > 0 && openCount === 0;
  const isFull = note.items.length >= MAX_NOTE_ITEMS;

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  const updateItem = (id: string, patch: Partial<PendingItem>) =>
    onChange({
      items: note.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });

  const removeItem = (id: string) => {
    onChange({ items: note.items.filter((item) => item.id !== id) });
    quickAddRef.current?.focus();
  };

  const addItem = () => {
    if (!quickAdd.trim() || isFull) return;
    const { label, amount } = parseQuickAdd(quickAdd);
    onChange({
      items: [...note.items, { id: newItemId(), label, amount, done: false }],
    });
    setQuickAdd("");
  };

  return (
    <div
      className={cn("sticky-note group relative", `note-${note.color}`)}
      style={{ "--note-tilt": `${tilt}deg` } as React.CSSProperties}
    >
      {/* Tape, or a push-pin when pinned */}
      {note.pinned ? (
        <div className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2">
          <div className="size-5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff8a8a,#d92b2b_55%,#8f1414)] shadow-[0_3px_4px_rgb(0_0_0/0.3)]" />
        </div>
      ) : (
        <div
          className="note-tape absolute -top-3 left-1/2 z-10 h-6 w-24"
          style={{ transform: `translateX(-50%) rotate(${-tilt * 1.8}deg)` }}
        />
      )}

      <article className="note-paper relative flex min-h-[300px] flex-col px-5 pb-4 pt-6">
        {/* Title */}
        <input
          ref={titleRef}
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              quickAddRef.current?.focus();
            }
          }}
          placeholder="Untitled note"
          maxLength={60}
          aria-label="Note title"
          className={cn(
            HAND,
            "w-full bg-transparent text-[30px] font-bold leading-tight outline-none placeholder:text-[color:var(--note-ink)]/35",
          )}
        />
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-50">
          {note.items.length === 0
            ? "Empty note"
            : `${openCount} pending · ${doneCount} paid`}
        </p>

        {/* Lined items */}
        <div className="note-lines -mx-1 flex-1 px-1">
          <ul>
            {note.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onChange={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
                onEnter={() => quickAddRef.current?.focus()}
              />
            ))}
          </ul>

          {/* Quick add */}
          <div className="flex h-9 items-center gap-2">
            <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[color:var(--note-ink)]/25" />
            <input
              ref={quickAddRef}
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              disabled={isFull}
              placeholder={isFull ? "This note is full" : "Add… e.g. Milk 250"}
              aria-label="Add item, with the amount at the end"
              className={cn(
                HAND,
                "min-w-0 flex-1 bg-transparent text-[21px] leading-none outline-none placeholder:text-[color:var(--note-ink)]/35",
              )}
            />
            {quickAdd.trim() && (
              <button
                type="button"
                onClick={addItem}
                aria-label="Add item"
                className="flex h-6 items-center gap-1 rounded-md bg-[var(--note-ink)]/10 px-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--note-ink)]/20"
              >
                <CornerDownLeft className="size-3" strokeWidth={2.5} />
                Add
              </button>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="mt-3 border-t-2 border-dashed border-[color:var(--note-line)] pt-3">
          <div className="flex items-end justify-between gap-3">
            <span className={cn(HAND, "text-[22px] leading-none opacity-75")}>
              {allSettled ? "All paid!" : "Still to pay"}
            </span>
            <CurrencyDisplay
              amount={pending}
              animate
              className={cn(
                HAND,
                "border-b-[4px] border-double border-[color:var(--note-ink)]/60 text-[30px] font-bold leading-none tabular-nums",
              )}
            />
          </div>
          {settled > 0 && (
            <p className="mt-1.5 text-right text-[11px] font-medium opacity-55">
              <CurrencyDisplay amount={settled} /> already paid
            </p>
          )}
        </div>

        {/* Toolbar — revealed on hover/focus, always on touch */}
        <div className="mt-3 flex items-center justify-between gap-2 pr-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Note color">
            {NOTE_COLORS.map((color: NoteColor) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={note.color === color}
                aria-label={NOTE_COLOR_LABELS[color]}
                onClick={() => onChange({ color })}
                className={cn(
                  "size-4 rounded-full ring-1 ring-black/15 transition-transform hover:scale-125",
                  note.color === color && "ring-2 ring-[color:var(--note-ink)]/70 ring-offset-1 ring-offset-[var(--note-bg)]",
                )}
                style={{ background: NOTE_SWATCHES[color] }}
              />
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {doneCount > 0 && (
              <button
                type="button"
                onClick={() => onChange({ items: note.items.filter((item) => !item.done) })}
                aria-label="Clear paid items"
                title="Clear paid items"
                className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-black/10"
              >
                <Eraser className="size-4" strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange({ pinned: !note.pinned })}
              aria-label={note.pinned ? "Unpin note" : "Pin note to top"}
              title={note.pinned ? "Unpin" : "Pin to top"}
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-black/10"
            >
              {note.pinned ? (
                <PinOff className="size-4" strokeWidth={2} />
              ) : (
                <Pin className="size-4" strokeWidth={2} />
              )}
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete note"
              title="Tear off note"
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-red-500/15 hover:text-red-700"
            >
              <Trash2 className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {allSettled && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="note-stamp rounded-md px-4 py-1 text-[26px] font-black uppercase tracking-[0.2em]">
              Settled
            </span>
          </div>
        )}
      </article>
    </div>
  );
}
