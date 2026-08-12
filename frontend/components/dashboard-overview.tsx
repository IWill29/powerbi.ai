"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Clock,
  ClipboardCheck,
  GitBranch,
  List,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dashboardStats,
  recentRequests,
  requestEvents,
  type RequestStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<RequestStatus, string> = {
  Intake: "bg-muted text-muted-foreground",
  "Agent Run": "bg-blue-500/10 text-blue-400",
  "Approval Gate": "bg-[var(--accent-brand)]/15 text-[var(--accent-brand)]",
  Delivered: "bg-emerald-500/10 text-emerald-400",
};

const eventIcons = {
  agent: Bot,
  gate: ClipboardCheck,
  system: GitBranch,
} as const;

const statCards: {
  label: string;
  value: string | number;
  icon: typeof List;
  highlight?: boolean;
}[] = [
  {
    label: "Active Requests",
    value: dashboardStats.activeRequests,
    icon: List,
  },
  {
    label: "Pending Approvals",
    value: dashboardStats.pendingApprovals,
    icon: ClipboardCheck,
    highlight: true,
  },
  {
    label: "Agent Runs today",
    value: dashboardStats.agentRunsToday,
    icon: Bot,
  },
  {
    label: "Avg gate time",
    value: `${dashboardStats.avgGateMinutes}m`,
    icon: Clock,
  },
];

export function DashboardOverview() {
  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-4 p-4">
      <div className="dashboard-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-sm shadow-none ring-1 ring-border"
          >
            <CardContent className="flex items-center justify-between pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-xl font-medium tabular-nums tracking-tight",
                    stat.highlight && "text-[var(--accent-brand)]"
                  )}
                >
                  {stat.value}
                </span>
              </div>
              <div className="flex size-8 items-center justify-center rounded-sm bg-muted/60">
                <stat.icon className="size-3.5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="dashboard-stagger grid flex-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-sm shadow-none ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="text-[13px] font-medium">
              Recent Requests
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              className="rounded-sm text-muted-foreground"
              render={<Link href="/requests" />}
            >
              View all
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              className="table-fixed"
              containerClassName="overflow-x-hidden max-sm:overflow-x-auto max-sm:scrollbar-none"
            >
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-[38%] pl-4 text-[11px] uppercase tracking-wide">
                    Request
                  </TableHead>
                  <TableHead className="h-8 w-[28%] text-[11px] uppercase tracking-wide">
                    Client
                  </TableHead>
                  <TableHead className="h-8 w-[20%] text-[11px] uppercase tracking-wide">
                    Status
                  </TableHead>
                  <TableHead className="h-8 w-[14%] pr-4 text-right text-[11px] uppercase tracking-wide">
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request, index) => (
                  <TableRow
                    key={request.id}
                    className="dashboard-row-reveal cursor-default"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <TableCell className="min-w-0 pl-4 whitespace-normal">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-mono text-[12px] text-muted-foreground">
                          {request.id}
                        </span>
                        <span className="truncate font-medium">
                          {request.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0 truncate whitespace-normal text-muted-foreground">
                      {request.client}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "max-w-full truncate rounded-sm font-mono text-[10px] uppercase tracking-wide",
                          statusStyles[request.status]
                        )}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono text-[12px] whitespace-nowrap text-muted-foreground tabular-nums">
                      {request.updatedAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="rounded-sm shadow-none ring-1 ring-border">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-medium">
                  Approval Gates
                </CardTitle>
                <Badge
                  variant="outline"
                  className="rounded-sm font-mono tabular-nums"
                >
                  {dashboardStats.pendingApprovals} open
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-4">
              {recentRequests
                .filter((r) => r.status === "Approval Gate")
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between gap-3 rounded-sm border border-border bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {request.id}
                      </span>
                      <span className="truncate text-[13px] font-medium">
                        {request.title}
                      </span>
                      <span className="truncate text-[12px] text-muted-foreground">
                        {request.client}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      className="shrink-0 rounded-sm"
                      render={<Link href="/approvals" />}
                    >
                      Review
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-1 flex-col rounded-sm shadow-none ring-1 ring-border">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-[13px] font-medium">
                Request Events
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 p-0">
              <ScrollArea className="h-[220px]">
                <div className="flex flex-col">
                  {requestEvents.map((event, index) => {
                    const Icon = eventIcons[event.kind];
                    return (
                      <div key={event.id}>
                        <div
                          className="dashboard-row-reveal flex gap-2.5 px-4 py-2.5"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm bg-muted/60">
                            <Icon className="size-3 text-muted-foreground" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <p className="text-[13px] leading-snug">
                              {event.message}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="font-mono">{event.requestId}</span>
                              <span aria-hidden>·</span>
                              <span className="font-mono tabular-nums">
                                {event.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                        {index < requestEvents.length - 1 ? (
                          <Separator className="mx-4 w-auto" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
