export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-indigo-400 [animation-duration:0.6s]" />
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
