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
import { CurrencyDisplay } from "@/components/ui/currency-display";
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
          "h-[42px] gap-3 rounded-[10px] px-3 text-[13.5px] font-medium text-foreground transition-colors",
          "hover:bg-muted hover:text-foreground",
          "data-active:bg-[hsl(233_45%_11%)]/[0.06] data-active:font-semibold data-active:text-[hsl(233_45%_18%)] data-active:shadow-[inset_0_0_0_1px_hsl(233_45%_11%/0.1)]",
        )}
        render={<Link href={item.href} />}
      >
        <span
          className={cn(
            "hero-panel flex size-6 shrink-0 items-center justify-center rounded-[7px] transition-colors",
            isActive
              ? "text-white shadow-sm ring-1 ring-white/10"
              : "bg-none text-foreground/65",
            "group-data-[collapsible=icon]:size-auto group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-inherit group-data-[collapsible=icon]:shadow-none",
          )}
        >
          <Icon
            className={cn(isActive ? "size-[14px]" : "size-[17px]")}
            strokeWidth={isActive ? 2.3 : 1.8}
          />
        </span>
        <span className="truncate">{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  monthlyBudget = 0,
  monthlyExpenses = 0,
}: {
  monthlyBudget?: number;
  monthlyExpenses?: number;
}) {
  const pathname = usePathname();
  const hasBudget = monthlyBudget > 0;
  const remaining = monthlyBudget - monthlyExpenses;
  const isOverBudget = hasBudget && remaining < 0;
  const percentUsed = hasBudget
    ? Math.min(Math.round((monthlyExpenses / monthlyBudget) * 100), 100)
    : 0;

  return (
    <Sidebar collapsible="icon">
      {/* Brand */}
      <SidebarHeader className="gap-0 px-4 pb-5 pt-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <div className="hero-panel flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-white shadow-[0_6px_16px_-4px_hsl(233_45%_11%/0.55)] ring-1 ring-white/10">
            <Wallet className="h-[17px] w-[17px]" strokeWidth={2} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[17px] font-bold leading-[1.15] tracking-tight text-sidebar-foreground">
              Fintrax
            </p>
            <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Personal finance
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-4 py-0">
        {/* Quick action */}
        <SidebarGroup className="px-0 pb-5">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="New Expense"
                  className={cn(
                    "hero-panel h-[42px] justify-center gap-2 rounded-[11px] text-[13.5px] font-semibold text-white shadow-[0_8px_18px_-6px_hsl(233_45%_11%/0.55)] ring-1 ring-white/10",
                    "hover:brightness-110 active:brightness-95",
                    "group-data-[collapsible=icon]:justify-center",
                  )}
                  render={<Link href="/expenses/new" />}
                >
                  <Plus className="size-[15px] shrink-0" strokeWidth={2.5} />
                  <span className="group-data-[collapsible=icon]:hidden">
                    New Expense
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-0 pb-6">
            <SidebarGroupLabel className="mb-2 h-auto px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-[2px]">
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

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {hasBudget && (
          <div className="hero-panel group-data-[collapsible=icon]:hidden mb-2 rounded-[11px] p-3.5 text-white shadow-[0_6px_16px_-4px_hsl(233_45%_11%/0.5)] ring-1 ring-white/10">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                {isOverBudget ? "Over budget" : "Left to spend"}
              </span>
              <span className="text-[10px] font-semibold text-white/50">
                {percentUsed}% used
              </span>
            </div>
            <p
              className={cn(
                "mt-1 truncate text-lg font-bold tracking-tight",
                isOverBudget ? "text-rose-300" : "text-white",
              )}
            >
              <CurrencyDisplay amount={Math.abs(remaining)} />
            </p>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  isOverBudget ? "bg-rose-400" : "bg-white",
                )}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
        )}
        <SidebarMenu className="gap-[2px]">
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
