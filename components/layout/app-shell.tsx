import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  defaultSidebarOpen = true,
  contentClassName,
}: {
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
  contentClassName?: string;
}) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen} className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <Header />
        <div
          className={cn(
            "flex-1 overflow-y-auto p-6 scrollbar-hide custom-scrollbar",
            contentClassName,
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
