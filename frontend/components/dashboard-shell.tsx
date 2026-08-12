"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden bg-background">
        <DashboardHeader />
        <div className="dashboard-canvas flex flex-1 flex-col overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
