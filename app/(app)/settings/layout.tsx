export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-6 min-h-full bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-indigo-50/30 p-6">
      {children}
    </div>
  );
}
