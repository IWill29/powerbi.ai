"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { mainNavItems } from "@/lib/nav-items";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (/^\/approvals\/[^/]+$/.test(pathname)) return "Approval Review";
  if (/^\/requests\/new$/.test(pathname)) return "New Request";
  if (/^\/requests\/[^/]+$/.test(pathname)) return "Request Detail";
  const match = mainNavItems.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
  return match?.title ?? "Dashboard";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
      <SidebarTrigger className="-ml-0.5 size-7 text-muted-foreground hover:text-foreground" />
      <h1 className="truncate text-[13px] font-medium tracking-tight">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 rounded-sm px-2 text-[12px] font-normal text-muted-foreground hover:bg-accent hover:text-foreground"
          render={<Link href="/requests/new" />}
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">New Request</span>
        </Button>
      </div>
    </header>
  );
}
