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

const mainNav: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutGrid },
  { name: "Transactions", href: "/expenses", icon: ReceiptText },
  { name: "Subscriptions", href: "/subscriptions", icon: Repeat },
];

const financeNav: NavItem[] = [
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Reports", href: "/reports", icon: ChartPie },
];

const utilityNav: NavItem[] = [
  { name: "Manage Meters", href: "/meters", icon: Gauge },
];

const secondaryNav: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings2 },
];

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

const navItemClass =
  "h-9 gap-2.5 text-[13.5px] text-foreground/65 data-active:bg-primary/10 data-active:text-primary data-active:font-semibold hover:bg-sidebar-accent hover:text-foreground";

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.name}
        className={navItemClass}
        render={<Link href={item.href} />}
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity",
            isActive && "opacity-100",
            "group-data-[collapsible=icon]:hidden",
          )}
        />
        <Icon className="size-[18px]" strokeWidth={1.75} />
        <span>{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">E</span>
          </div>
          <span className="truncate text-[15px] font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            ExpenseTrack
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavActive(pathname, item.href)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Finance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {financeNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavActive(pathname, item.href)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Utility Bills
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {utilityNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavActive(pathname, item.href)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border py-2">
        <SidebarMenu className="gap-1">
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
