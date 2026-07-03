import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

export default async function MetersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AppShell
      defaultSidebarOpen={defaultSidebarOpen}
      contentClassName="bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-teal-50/30"
    >
      {children}
    </AppShell>
  );
}
