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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { mainNavItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center">
          <div
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-[var(--accent-brand)] text-[11px] font-semibold text-[oklch(0.16_0.015_250)]"
          >
            PB
          </div>
          <div className="flex min-w-0 flex-col gap-0 leading-none group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">Power BI APS</span>
            <span className="truncate text-[11px] text-muted-foreground">
              Operations
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
                      className="transition-colors duration-150"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge
                        className={cn(
                          "bg-[var(--accent-brand)]/15 text-[var(--accent-brand)]",
                          active && "bg-[var(--accent-brand)]/25"
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

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 rounded-md px-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
              <Avatar className="size-7 rounded-sm">
                <AvatarFallback className="rounded-sm text-[11px]">
                  RV
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-0 leading-none group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">Reviewer</span>
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
