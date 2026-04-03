"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "./breadcrumb";

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
        const response = await fetch("/api/auth/user");
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
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-white/80 px-6 backdrop-blur-md shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] border-b border-border transition-all">
      {/* Breadcrumb */}
      <div className="flex-1">
        <Breadcrumb />
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:ring-indigo-500"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all">
            <Avatar className="h-8 w-8 hover:opacity-90 ring-1 ring-border shadow-sm transition-all">
              <AvatarImage src="/avatar.jpg" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-lg border border-border/80">
            <div className="flex items-center gap-2.5 p-2.5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-600 text-white font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                {isLoading ? (
                  <>
                    <p className="text-sm font-semibold leading-none text-foreground">Loading...</p>
                    <p className="text-xs leading-none text-muted-foreground">Please wait</p>
                  </>
                ) : user ? (
                  <>
                    <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold leading-none text-foreground">Guest</p>
                    <p className="text-xs leading-none text-muted-foreground">Not logged in</p>
                  </>
                )}
              </div>
            </div>
            <DropdownMenuSeparator className="mx-1" />
            <div className="p-1">
              <DropdownMenuItem className="rounded-md py-2 px-2.5 cursor-pointer text-sm font-medium gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="rounded-md py-2 px-2.5 cursor-pointer text-sm font-medium gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="mx-1" />
            <div className="p-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-md py-2 px-2.5 cursor-pointer text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
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
