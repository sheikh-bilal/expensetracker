import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

export default async function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AppShell
      defaultSidebarOpen={defaultSidebarOpen}
      contentClassName="bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-red-50/30"
    >
      {children}
    </AppShell>
  );
}
