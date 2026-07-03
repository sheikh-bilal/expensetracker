import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <AppShell defaultSidebarOpen={defaultSidebarOpen}>{children}</AppShell>;
}
