export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-6 min-h-full bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-red-50/30 p-6">
      {children}
    </div>
  );
}
