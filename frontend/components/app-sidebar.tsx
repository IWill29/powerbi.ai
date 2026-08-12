"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { mainNavItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
      <SidebarHeader className="px-2 py-2.5">
        <div className="flex h-8 items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center">
          <div
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-accent-brand"
          >
            <span className="font-mono text-[9px] font-semibold tracking-tighter text-[oklch(0.12_0.006_264)]">
              PB
            </span>
          </div>
          <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[13px] font-medium tracking-tight">
              Power BI APS
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-1">
        <SidebarGroup className="py-0">
          <SidebarGroupLabel className="h-6 px-2 text-[11px] font-normal text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainNavItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                      className={cn(
                        "relative h-7 rounded-sm px-2 text-[13px] transition-colors duration-100",
                        active &&
                          "bg-sidebar-accent font-medium before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent-brand"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-3.5 shrink-0",
                          active ? "text-accent-brand" : "text-muted-foreground"
                        )}
                      />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge
                        className={cn(
                          "rounded-sm bg-transparent font-mono text-[10px] tabular-nums text-muted-foreground",
                          active && "text-accent-brand"
                        )}
                      >
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-1 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-8 items-center gap-2 rounded-sm px-2 group-data-[collapsible=icon]:size-7 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5">
              <Avatar className="size-6 rounded-sm">
                <AvatarFallback className="rounded-sm bg-muted text-[9px] font-medium">
                  RV
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[12px] font-medium">Reviewer</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Approval Gates
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
