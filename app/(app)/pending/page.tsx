"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCheck,
  Loader2,
  Plus,
  Search,
  StickyNote as StickyNoteIcon,
  X,
} from "lucide-react";

import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { StickyNote, noteTotals } from "@/components/pending/sticky-note";
import {
  createPendingNote,
  deletePendingNote,
  getPendingNotes,
  updatePendingNote,
  type PendingNoteInput,
  type PendingNoteRecord,
} from "@/actions/pendingNotes";
import {
  NOTE_COLORS,
  NOTE_COLOR_LABELS,
  NOTE_SWATCHES,
  NOTE_TILTS,
  type NoteColor,
} from "@/lib/constants/pendingNote";
import { cn } from "@/lib/utils";

const SAVE_DELAY_MS = 600;

// Stable tilt per note, independent of its position on the board
function tiltFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return NOTE_TILTS[Math.abs(hash) % NOTE_TILTS.length];
}

function sortNotes(notes: PendingNoteRecord[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export default function PendingPage() {
  const [notes, setNotes] = useState<PendingNoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [savingCount, setSavingCount] = useState(0);
  const [query, setQuery] = useState("");

  // Debounced autosave: patches are merged per note and flushed after a pause in typing
  const pendingPatches = useRef(new Map<string, PendingNoteInput>());
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    getPendingNotes().then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, []);

  const flush = useCallback(async (id: string) => {
    const patch = pendingPatches.current.get(id);
    saveTimers.current.delete(id);
    if (!patch) return;
    pendingPatches.current.delete(id);

    setSavingCount((n) => n + 1);
    const result = await updatePendingNote(id, patch);
    setSavingCount((n) => n - 1);
    if (result.error) toast.error(result.error);
  }, []);

  // Don't lose the last keystrokes when navigating away
  useEffect(() => {
    const timers = saveTimers.current;
    const flushAll = () => {
      for (const id of [...timers.keys()]) {
        clearTimeout(timers.get(id));
        flush(id);
      }
    };
    window.addEventListener("beforeunload", flushAll);
    return () => {
      window.removeEventListener("beforeunload", flushAll);
      flushAll();
    };
  }, [flush]);

  const updateNote = (id: string, patch: PendingNoteInput) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, ...patch } : n)),
    );

    pendingPatches.current.set(id, {
      ...pendingPatches.current.get(id),
      ...patch,
    });
    clearTimeout(saveTimers.current.get(id));
    saveTimers.current.set(
      id,
      setTimeout(() => flush(id), SAVE_DELAY_MS),
    );
  };

  const addNote = async (color: NoteColor, input: PendingNoteInput = {}) => {
    setCreating(true);
    const result = await createPendingNote({ color, ...input });
    setCreating(false);

    if (!result.note) {
      toast.error(result.error ?? "Failed to create note");
      return;
    }
    const created = result.note;
    setNotes((prev) => [created, ...prev]);
    setFreshId(created._id);
    setQuery("");
  };

  const removeNote = async (note: PendingNoteRecord) => {
    clearTimeout(saveTimers.current.get(note._id));
    saveTimers.current.delete(note._id);
    pendingPatches.current.delete(note._id);
    setNotes((prev) => prev.filter((n) => n._id !== note._id));

    const result = await deletePendingNote(note._id);
    if (result.error) {
      toast.error(result.error);
      setNotes((prev) => [note, ...prev]);
      return;
    }

    toast(`“${note.title || "Untitled note"}” torn off`, {
      action: {
        label: "Undo",
        onClick: () =>
          addNote(note.color, {
            title: note.title,
            pinned: note.pinned,
            items: note.items,
          }),
      },
    });
  };

  const nextColor = useMemo(
    () => NOTE_COLORS[notes.length % NOTE_COLORS.length],
    [notes.length],
  );

  const stats = useMemo(() => {
    let pending = 0;
    let settled = 0;
    let openItems = 0;
    let biggest: { title: string; amount: number } | null = null;
    for (const note of notes) {
      const totals = noteTotals(note.items);
      pending += totals.pending;
      settled += totals.settled;
      openItems += totals.openCount;
      if (totals.pending > 0 && (!biggest || totals.pending > biggest.amount)) {
        biggest = {
          title: note.title || "Untitled note",
          amount: totals.pending,
        };
      }
    }
    return { pending, settled, openItems, biggest };
  }, [notes]);

  const visibleNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = sortNotes(notes);
    if (!q) return sorted;
    return sorted.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.items.some((item) => item.label.toLowerCase().includes(q)),
    );
  }, [notes, query]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="hero-panel relative overflow-hidden rounded-2xl text-white shadow-[0_18px_40px_-16px_hsl(233_45%_11%/0.6)] ring-1 ring-white/10">
        <div
          className="hero-grid pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Notes
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Pending board
            </h1>
            <p className="mt-1 max-w-md text-sm text-white/60">
              Scribble down what you still owe. These notes stay off your books
              until you&apos;re ready.
            </p>

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Total still to pay
              </p>
              <CurrencyDisplay
                amount={stats.pending}
                animate
                className="mt-1 block text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
              />
            </div>

            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {[
                { label: "Notes", value: notes.length },
                { label: "Open items", value: stats.openItems },
                {
                  label: "Already paid",
                  value: <CurrencyDisplay amount={stats.settled} />,
                },
                {
                  label: "Biggest pile",
                  value: stats.biggest ? stats.biggest.title : "—",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-0 border-l border-white/15 pl-3"
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The pad — tear off a colored note */}
          <div className="flex flex-col items-center gap-3 lg:pr-4">
            <div
              className="flex items-end"
              role="group"
              aria-label="Tear off a new note"
            >
              {NOTE_COLORS.map((color, i) => (
                <button
                  key={color}
                  type="button"
                  disabled={creating || loading}
                  onClick={() => addNote(color)}
                  aria-label={`New ${NOTE_COLOR_LABELS[color]} note`}
                  title={`New ${NOTE_COLOR_LABELS[color].toLowerCase()} note`}
                  className={cn(
                    "relative -ml-5 h-[88px] w-[72px] rounded-[3px] shadow-[0_8px_16px_-6px_rgb(0_0_0/0.5)] transition-all duration-300 first:ml-0 sm:h-24 sm:w-20",
                    "hover:z-10 hover:-translate-y-4 focus-visible:z-10 focus-visible:-translate-y-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    "disabled:pointer-events-none disabled:opacity-70",
                  )}
                  style={{
                    background: `linear-gradient(to bottom, rgb(0 0 0 / 0.06), transparent 18px), ${NOTE_SWATCHES[color]}`,
                    transform: `rotate(${(i - 2.5) * 5}deg) translateY(${Math.abs(i - 2.5) * 4}px)`,
                  }}
                >
                  <Plus
                    className="absolute bottom-2 right-2 size-4 text-black/35"
                    strokeWidth={2.5}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] font-medium text-white/55">
              {creating
                ? "Peeling one off…"
                : "Pick a color to tear off a note"}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <PageLoader label="Loading your notes" />
      ) : notes.length === 0 ? (
        <EmptyBoard onCreate={() => addNote(nextColor)} creating={creating} />
      ) : (
        <>
          {/* Board toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes and items…"
                aria-label="Search notes"
                className="h-9 w-full rounded-lg border bg-card pl-9 pr-8 text-sm shadow-xs outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                aria-live="polite"
              >
                {savingCount > 0 ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <CheckCheck className="size-3.5" /> All changes saved
                  </>
                )}
              </span>
              <Button
                size="sm"
                onClick={() => addNote(nextColor)}
                disabled={creating}
                className="hero-panel text-white ring-1 ring-white/10 hover:brightness-110"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                New note
              </Button>
            </div>
          </div>

          {visibleNotes.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No notes match “{query}”.
            </p>
          ) : (
            <div className="columns-1 gap-8 pb-10 sm:columns-2 xl:columns-3 2xl:columns-4">
              {visibleNotes.map((note) => (
                <div
                  key={note._id}
                  className={cn(
                    "mb-10 break-inside-avoid pt-3",
                    note._id === freshId && "note-enter",
                  )}
                >
                  <StickyNote
                    note={note}
                    tilt={tiltFor(note._id)}
                    autoFocus={note._id === freshId}
                    onChange={(patch) => updateNote(note._id, patch)}
                    onDelete={() => removeNote(note)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyBoard({
  onCreate,
  creating,
}: {
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="relative mb-8 h-36 w-44" aria-hidden>
        {(["sky", "rose", "lemon"] as NoteColor[]).map((color, i) => (
          <div
            key={color}
            className="absolute inset-0 rounded-[3px] shadow-[0_10px_20px_-8px_rgb(0_0_0/0.25)]"
            style={{
              background: NOTE_SWATCHES[color],
              transform: `rotate(${(i - 1) * 8}deg) translate(${(i - 1) * 14}px, ${i * -4}px)`,
            }}
          >
            {i === 2 && (
              <div className="flex h-full flex-col justify-center gap-3 px-5">
                <div className="h-1.5 w-3/4 rounded-full bg-black/10" />
                <div className="h-1.5 w-1/2 rounded-full bg-black/10" />
                <div className="h-1.5 w-2/3 rounded-full bg-black/10" />
              </div>
            )}
          </div>
        ))}
      </div>
      <h2 className="text-lg font-semibold tracking-tight">
        Your board is empty
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Stick a note for anything you still owe, like rent, a friend&apos;s loan
        or this week&apos;s groceries. Type{" "}
        <span className="font-medium text-foreground">Milk 250</span> and press
        Enter.
      </p>
      <Button
        onClick={onCreate}
        disabled={creating}
        className="mt-5 gap-2 cursor-pointer"
      >
        <StickyNoteIcon className="size-4" />
        Stick your first note
      </Button>
    </div>
  );
}
