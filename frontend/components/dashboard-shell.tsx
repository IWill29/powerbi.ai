"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { BackendStatus } from "@/lib/backend-status";

type DashboardShellProps = {
  backendStatus: BackendStatus;
  children: React.ReactNode;
};

export function DashboardShell({
  backendStatus,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden">
        <DashboardHeader backendStatus={backendStatus} />
        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
