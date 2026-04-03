import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function BudgetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
