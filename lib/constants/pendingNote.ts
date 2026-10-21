// Sticky-note paper colors — the matching paper/ink tokens live in globals.css (.note-*)
export const NOTE_COLORS = ["lemon", "peach", "rose", "mint", "sky", "lilac"] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export const NOTE_COLOR_LABELS: Record<NoteColor, string> = {
  lemon: "Lemon",
  peach: "Peach",
  rose: "Rose",
  mint: "Mint",
  sky: "Sky",
  lilac: "Lilac",
};

// Swatch fills for pickers rendered outside a note
export const NOTE_SWATCHES: Record<NoteColor, string> = {
  lemon: "#fff1a1",
  peach: "#ffd6b3",
  rose: "#ffcfdc",
  mint: "#c6f0d6",
  sky: "#cde4ff",
  lilac: "#e2d6ff",
};

// Small tilt per note so the board feels hand-placed; picked by stable index
export const NOTE_TILTS = [-1.6, 1.1, -0.7, 1.5, -1.2, 0.6, 1.8, -0.4];

export const MAX_NOTE_ITEMS = 100;
