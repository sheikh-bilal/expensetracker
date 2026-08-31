"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  expenses: "Transactions",
  new: "New Expense",
  budgets: "Budgets",
  reports: "Reports",
  subscriptions: "Subscriptions",
  meters: "Manage Meters",
  settings: "Settings",
  profile: "Profile",
};

function labelFor(segment: string) {
  return SEGMENT_LABELS[segment] ?? "Details";
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: labelFor(segment),
  }));

  const withRoot =
    crumbs[0]?.href === "/dashboard"
      ? crumbs
      : [{ href: "/dashboard", label: "Dashboard" }, ...crumbs];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {withRoot.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === withRoot.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
