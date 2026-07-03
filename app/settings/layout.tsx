import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AppShell
      defaultSidebarOpen={defaultSidebarOpen}
      contentClassName="bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-indigo-50/30"
    >
      {children}
    </AppShell>
  );
}
