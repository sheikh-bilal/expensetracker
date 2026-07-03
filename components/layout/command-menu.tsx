"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Settings,
  Wallet,
  PieChart,
  Gauge,
  User,
  Plus,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/expenses", icon: Receipt },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Manage Meters", href: "/meters", icon: Gauge },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 justify-center gap-2 rounded-full px-0 text-muted-foreground sm:w-auto sm:justify-start sm:rounded-lg sm:px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <CommandShortcut className="hidden sm:inline">⌘K</CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/expenses/new"))}
            >
              <Plus />
              <span>New Expense</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <item.icon />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
