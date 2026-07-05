import { Wallet } from "lucide-react";

const ringMask =
  "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2.5px))";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Conic ring — a thin sweep that fades out behind its head */}
          <div
            className="absolute inset-0 animate-spin rounded-full [animation-duration:0.9s] motion-reduce:animate-none"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 20%, hsl(var(--primary)))",
              WebkitMask: ringMask,
              mask: ringMask,
            }}
            aria-hidden
          />
          {/* Soft pulse halo */}
          <div
            className="absolute inset-1.5 animate-pulse rounded-full bg-primary/5 motion-reduce:animate-none"
            aria-hidden
          />
          {/* Brand mark */}
          <div className="hero-panel flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ring-1 ring-white/10">
            <Wallet className="h-4 w-4" strokeWidth={2} aria-hidden />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
