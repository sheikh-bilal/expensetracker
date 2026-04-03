"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Overview", href: "/dashboard" },
  ],
  "/dashboard/overview": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Overview", href: "/dashboard" },
  ],
  "/expenses": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transactions", href: "/expenses" },
  ],
  "/expenses/new": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transactions", href: "/expenses" },
    { label: "New Expense", href: "/expenses/new" },
  ],
  "/subscriptions": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Subscriptions", href: "/subscriptions" },
  ],
  "/settings": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
  ],
};

export function Breadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = breadcrumbMap[pathname] || [{ label: "Dashboard", href: "/dashboard" }];

  return (
    <nav className="flex items-center text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={`${item.href}-${index}`} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50 flex-shrink-0" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "font-medium text-muted-foreground hover:text-foreground transition-colors"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
