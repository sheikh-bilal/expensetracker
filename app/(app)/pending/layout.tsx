import { Caveat } from "next/font/google";
import { cn } from "@/lib/utils";

const hand = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-hand",
});

export default function PendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        hand.variable,
        "relative -m-6 min-h-full bg-gradient-to-br from-amber-50/50 via-yellow-50/20 to-orange-50/40 p-6 dark:from-transparent dark:via-transparent dark:to-transparent",
      )}
    >
      <div className="board-dots pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}
