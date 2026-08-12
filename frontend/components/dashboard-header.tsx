"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { BackendStatusDot } from "@/components/backend-status-dot";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { BackendStatus } from "@/lib/backend-status";
import { mainNavItems } from "@/lib/nav-items";

type DashboardHeaderProps = {
  backendStatus: BackendStatus;
};

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const match = mainNavItems.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
  return match?.title ?? "Dashboard";
}

export function DashboardHeader({ backendStatus }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-4" />
      <h1 className="text-[13px] font-medium tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <BackendStatusDot status={backendStatus} />
        <Button
          size="sm"
          className="rounded-sm"
          render={<Link href="/requests/new" />}
        >
          <Plus data-icon="inline-start" />
          New Request
        </Button>
      </div>
    </header>
  );
}
