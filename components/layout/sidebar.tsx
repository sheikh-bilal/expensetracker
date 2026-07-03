"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ReceiptText,
  Repeat,
  Settings2,
  PiggyBank,
  ChartPie,
  Gauge,
  Wallet,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = { name: string; href: string; icon: React.ElementType };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutGrid },
      { name: "Transactions", href: "/expenses", icon: ReceiptText },
      { name: "Subscriptions", href: "/subscriptions", icon: Repeat },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Budgets", href: "/budgets", icon: PiggyBank },
      { name: "Reports", href: "/reports", icon: ChartPie },
    ],
  },
  {
    label: "Utilities",
    items: [{ name: "Meters", href: "/meters", icon: Gauge }],
  },
];

const secondaryNav: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings2 },
];

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.name}
        className={cn(
          "h-9 gap-2.5 rounded-lg text-[13px] font-medium text-foreground/60 transition-colors",
          "hover:bg-sidebar-accent hover:text-foreground",
          "data-active:bg-primary/10 data-active:font-semibold data-active:text-primary",
        )}
        render={<Link href={item.href} />}
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary opacity-0 transition-all duration-200",
            isActive && "opacity-100",
            "group-data-[collapsible=icon]:hidden",
          )}
        />
        <Icon
          className="size-[17px] shrink-0"
          strokeWidth={isActive ? 2 : 1.75}
        />
        <span className="truncate">{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Brand */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <div className="hero-panel flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ring-1 ring-white/10">
            <Wallet className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-tight tracking-tight text-sidebar-foreground">
              Fintrax
            </p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Personal finance
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0.5 py-2">
        {/* Quick action */}
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="New Expense"
                  className={cn(
                    "h-9 justify-center gap-2 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground shadow-sm",
                    "hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90",
                    "group-data-[collapsible=icon]:justify-center",
                  )}
                  render={<Link href="/expenses/new" />}
                >
                  <Plus className="size-4 shrink-0" strokeWidth={2.5} />
                  <span className="group-data-[collapsible=icon]:hidden">
                    New Expense
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isNavActive(pathname, item.href)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border py-2">
        <SidebarMenu className="gap-0.5">
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isNavActive(pathname, item.href)}
            />
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
