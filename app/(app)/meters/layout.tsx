export default function MetersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-6 min-h-full bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-teal-50/30 p-6">
      {children}
    </div>
  );
}
