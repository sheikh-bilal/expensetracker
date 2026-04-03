"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Target,
  PieChart,
  Landmark,
  Gauge,
} from "lucide-react";
import { useState, useEffect } from "react";

const mainNav = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/expenses", icon: Receipt },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

const financeNav = [
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Reports", href: "/reports", icon: PieChart },
];

const utilityNav = [
  { name: "Manage Meters", href: "/meters", icon: Gauge },
];

const secondaryNav = [{ name: "Settings", href: "/settings", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out shrink-0",
        mounted && (collapsed ? "w-[70px]" : "w-[260px]"),
        !mounted && "w-[260px]",
      )}
    >
      {/* Collapse Arrow Indicator */}
      {mounted && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-10 -right-3 z-50 h-6 w-6 rounded-full border border-border bg-white shadow-sm flex items-center justify-center hover:bg-muted/50 transition-colors group"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight
              className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground"
              strokeWidth={2.5}
            />
          ) : (
            <ChevronLeft
              className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground"
              strokeWidth={2.5}
            />
          )}
        </button>
      )}

      {/* Brand Header */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border shrink-0 transition-all",
          collapsed ? "justify-center px-0" : "px-6",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <span className="text-sm font-bold">E</span>
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-foreground tracking-tight">
              ExpenseTrack
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide py-4 px-3">
        {/* Main Section */}
        <div className="space-y-4">
          {!collapsed && (
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Main
            </p>
          )}
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = mounted
                ? pathname === item.href || pathname.startsWith(item.href + "/")
                : false;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    collapsed && "justify-center px-0 py-2",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Finance Section */}
          {!collapsed && (
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 pt-2">
              Finance
            </p>
          )}
          <nav className="space-y-0.5">
            {financeNav.map((item) => {
              const Icon = item.icon;
              const isActive = mounted ? pathname === item.href : false;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    collapsed && "justify-center px-0 py-2",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Utility Bills Section */}
          {!collapsed && (
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 pt-2">
              Utility Bills
            </p>
          )}
          <nav className="space-y-0.5">
            {utilityNav.map((item) => {
              const Icon = item.icon;
              const isActive = mounted ? pathname === item.href : false;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    collapsed && "justify-center px-0 py-2",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings Section */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <nav className="space-y-0.5">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = mounted ? pathname === item.href : false;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    collapsed && "justify-center px-0 py-2",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
