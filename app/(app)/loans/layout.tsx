export default function LoansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-6 min-h-full bg-gradient-to-br from-indigo-50/40 via-slate-50/20 to-sky-50/30 p-6 dark:from-transparent dark:via-transparent dark:to-transparent">
      {children}
    </div>
  );
}
