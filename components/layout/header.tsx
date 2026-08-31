"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppBreadcrumb } from "./breadcrumb";
import { NotificationsPopover } from "./notifications-popover";
import { ROUTES, API_ROUTES } from "@/lib/constants/routes";

interface User {
  _id: string;
  name: string;
  email: string;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(API_ROUTES.AUTH_USER);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    await fetch(API_ROUTES.AUTH_LOGOUT, { method: "POST" });
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className="sticky top-0 z-10 flex h-[66px] shrink-0 items-center gap-3.5 border-b border-border bg-background/85 px-5 backdrop-blur-md sm:px-7">
      <SidebarTrigger className="-ml-1 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
      <div className="hidden h-5 w-px bg-border md:block" aria-hidden />

      <div className="hidden flex-1 md:block">
        <AppBreadcrumb />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsPopover />

        <div className="h-5 w-px bg-border" aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50">
            <Avatar className="h-[30px] w-[30px] shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_3px_hsl(var(--border))]">
              <AvatarImage src="/avatar.jpg" alt="" />
              <AvatarFallback className="hero-panel text-[11px] font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[8rem] truncate text-[13.5px] font-semibold text-foreground sm:block">
              {isLoading ? "…" : (firstName ?? "Account")}
            </span>
            <ChevronDown
              className="hidden h-3.5 w-3.5 text-muted-foreground sm:block"
              strokeWidth={2.2}
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="mt-2 w-60 rounded-xl p-0 shadow-lg ring-1 ring-foreground/5"
          >
            {/* Identity */}
            <div className="flex items-center gap-3 border-b bg-muted/40 p-3">
              <Avatar className="h-9 w-9 ring-1 ring-foreground/10">
                <AvatarFallback className="hero-panel text-xs font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                {isLoading ? (
                  <p className="text-sm font-semibold text-foreground">
                    Loading…
                  </p>
                ) : user ? (
                  <>
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">
                      {user.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
                      {user.email}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      Guest
                    </p>
                    <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                      Not logged in
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="p-1">
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.PROFILE)}
                className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.SETTINGS)}
                className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="my-0" />
            <div className="p-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
