"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Clock,
  ClipboardCheck,
  GitBranch,
  List,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  type MockRequest,
  type RequestEvent,
  type RequestStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const statusStyles: Record<RequestStatus, string> = {
  Intake: "bg-muted/60 text-muted-foreground",
  "Agent Run": "bg-sky-500/12 text-sky-400",
  "Approval Gate": "bg-accent-brand-muted text-accent-brand",
  Delivered: "bg-emerald-500/12 text-emerald-400",
};

export const statusFilters: Array<RequestStatus | "All"> = [
  "All",
  "Intake",
  "Agent Run",
  "Approval Gate",
  "Delivered",
];

export const eventIcons = {
  agent: Bot,
  gate: ClipboardCheck,
  system: GitBranch,
} as const;

type RequestsTableProps = {
  requests: MockRequest[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  animateRows?: boolean;
};

export function RequestsTable({
  requests,
  title = "Requests",
  showViewAll = false,
  viewAllHref = "/requests",
  animateRows = false,
}: RequestsTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;
      const matchesSearch =
        !query ||
        request.title.toLowerCase().includes(query) ||
        request.client.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [requests, searchQuery, statusFilter]);

  return (
    <Card className="w-full gap-0 rounded-sm border border-border py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border px-3 py-2">
        <CardTitle className="text-[13px] font-medium tracking-tight">
          {title}
        </CardTitle>
        {showViewAll ? (
          <Button
            variant="ghost"
            size="xs"
            className="h-6 rounded-sm px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            render={<Link href={viewAllHref} />}
          >
            View all
            <ArrowRight data-icon="inline-end" className="size-3" />
          </Button>
        ) : null}
      </CardHeader>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-2 py-1.5">
        <div className="relative min-w-[140px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filter requests…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-7 rounded-sm border-transparent bg-muted/40 pl-7 text-[12px] shadow-none focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-0.5">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              data-active={statusFilter === filter}
              onClick={() => setStatusFilter(filter)}
              className="filter-pill"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="p-0">
        <Table
          className="table-fixed"
          containerClassName="overflow-x-hidden max-sm:overflow-x-auto max-sm:scrollbar-none"
        >
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-7 w-[38%] pl-3 text-[11px] font-normal text-muted-foreground">
                Request
              </TableHead>
              <TableHead className="h-7 w-[28%] text-[11px] font-normal text-muted-foreground">
                Client
              </TableHead>
              <TableHead className="h-7 w-[20%] text-[11px] font-normal text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-7 w-[14%] pr-3 text-right text-[11px] font-normal text-muted-foreground">
                Updated
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request, index) => (
              <TableRow
                key={request.id}
                className={cn(
                  "issue-row cursor-pointer border-border/50 hover:bg-accent/40",
                  animateRows && "dashboard-row-reveal"
                )}
                style={animateRows ? { animationDelay: `${index * 30}ms` } : undefined}
                onClick={() => router.push(`/requests/${request.id}`)}
              >
                <TableCell className="min-w-0 py-1.5 pl-3 whitespace-normal">
                  <div className="flex min-w-0 flex-col gap-px">
                    <span className="truncate font-mono text-[10px] tabular-nums text-muted-foreground">
                      {request.id}
                    </span>
                    <span className="truncate text-[13px] font-normal leading-tight">
                      {request.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="min-w-0 truncate py-1.5 whitespace-normal text-[12px] text-muted-foreground">
                  {request.client}
                </TableCell>
                <TableCell className="py-1.5 whitespace-normal">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "max-w-full truncate rounded-full border-0 px-2 py-px font-normal text-[11px]",
                      statusStyles[request.status]
                    )}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-1.5 pr-3 text-right font-mono text-[11px] whitespace-nowrap text-muted-foreground tabular-nums">
                  {request.updatedAt}
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-[12px] text-muted-foreground"
                >
                  No requests match the current filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

type ApprovalQueueProps = {
  items: MockRequest[];
  title?: string;
  openCount?: number;
  variant?: "compact" | "full";
  animateRows?: boolean;
};

export function ApprovalQueue({
  items,
  title = "Approval Gates",
  openCount = dashboardStats.pendingApprovals,
  variant = "compact",
  animateRows = false,
}: ApprovalQueueProps) {
  const isFull = variant === "full";

  return (
    <Card
      className={cn(
        "gap-0 rounded-sm py-0 shadow-none",
        isFull
          ? "border border-border"
          : "border border-accent-brand/15"
      )}
    >
      <CardHeader className="border-b border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="gate-pulse size-1.5 rounded-full bg-accent-brand"
            />
            <CardTitle className="text-[13px] font-medium tracking-tight">
              {title}
            </CardTitle>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {openCount} open
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("flex flex-col gap-1", isFull ? "p-2" : "p-1.5")}>
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">
            No pending Approval Gates.
          </p>
        ) : (
          items.map((request, index) => (
            <div
              key={request.id}
              className={cn(
                "flex items-center justify-between gap-2 rounded-sm px-2 transition-colors hover:bg-accent/50",
                isFull ? "py-2.5" : "py-1.5",
                animateRows && "dashboard-row-reveal"
              )}
              style={animateRows ? { animationDelay: `${index * 35}ms` } : undefined}
            >
              <div className="flex min-w-0 flex-col gap-px">
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {request.id}
                </span>
                <span className="truncate text-[12px] font-normal leading-tight">
                  {request.title}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {request.client}
                  {request.agentRun ? (
                    <>
                      <span aria-hidden> · </span>
                      <span className="font-mono tabular-nums">
                        {request.agentRun}
                      </span>
                    </>
                  ) : null}
                </span>
              </div>
              <Button
                size={isFull ? "sm" : "xs"}
                variant={isFull ? "default" : "ghost"}
                className={cn(
                  "shrink-0 rounded-sm text-[11px]",
                  isFull
                    ? "h-7 px-3"
                    : "h-6 px-2 text-accent-brand hover:bg-accent-brand-muted hover:text-accent-brand"
                )}
                render={<Link href={`/approvals/${request.id}`} />}
              >
                Review
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

type EventsTimelineProps = {
  events: RequestEvent[];
  title?: string;
  scrollHeight?: string;
  animateRows?: boolean;
  showRequestId?: boolean;
};

export function EventsTimeline({
  events,
  title = "Request Events",
  scrollHeight = "220px",
  animateRows = false,
  showRequestId = true,
}: EventsTimelineProps) {
  const useScroll = scrollHeight !== "none";

  const timeline = (
    <div className="flex flex-col py-0.5">
      {events.map((event, index) => {
        const Icon = eventIcons[event.kind];
        return (
          <div
            key={event.id}
            className={cn(
              "activity-item hover:bg-accent/30",
              animateRows && "dashboard-row-reveal"
            )}
            style={animateRows ? { animationDelay: `${index * 35}ms` } : undefined}
          >
            <div
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-sm",
                event.kind === "gate"
                  ? "text-accent-brand"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-3" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <p className="text-[12px] leading-snug text-foreground/90">
                {event.message}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {showRequestId ? (
                  <>
                    <span className="font-mono tabular-nums">
                      {event.requestId}
                    </span>
                    <span aria-hidden>·</span>
                  </>
                ) : null}
                <span className="font-mono tabular-nums">{event.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}
      {events.length === 0 ? (
        <p className="px-3 py-8 text-center text-[12px] text-muted-foreground">
          No Request Events recorded yet.
        </p>
      ) : null}
    </div>
  );

  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 rounded-sm border border-border py-0 shadow-none">
      <CardHeader className="border-b border-border px-3 py-2">
        <CardTitle className="text-[13px] font-medium tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        {useScroll ? (
          <ScrollArea style={{ height: scrollHeight }}>{timeline}</ScrollArea>
        ) : (
          timeline
        )}
      </CardContent>
    </Card>
  );
}

export type DashboardStatsData = {
  activeRequests: number;
  pendingApprovals: number;
  agentRunsToday: number;
  avgGateMinutes: number;
};

export function DashboardOverview({
  requests = recentRequests,
  events = requestEvents,
  stats: statsProp,
}: {
  requests?: MockRequest[];
  events?: RequestEvent[];
  stats?: DashboardStatsData;
} = {}) {
  const stats: DashboardStatsData = statsProp ?? {
    activeRequests: dashboardStats.activeRequests,
    pendingApprovals: dashboardStats.pendingApprovals,
    agentRunsToday: dashboardStats.agentRunsToday,
    avgGateMinutes: dashboardStats.avgGateMinutes,
  };
  const approvalItems = requests.filter(
    (r) => r.status === "Approval Gate"
  );

  const statCards: {
    label: string;
    value: string | number;
    icon: typeof List;
    highlight?: boolean;
  }[] = [
    {
      label: "Active Requests",
      value: stats.activeRequests,
      icon: List,
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: ClipboardCheck,
      highlight: true,
    },
    {
      label: "Agent Runs today",
      value: stats.agentRunsToday,
      icon: Bot,
    },
    {
      label: "Avg gate time",
      value: `${stats.avgGateMinutes}m`,
      icon: Clock,
    },
  ];

  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <div className="dashboard-stagger grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "panel-surface px-3 py-2",
              stat.highlight && "border-accent-brand/20"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="stat-label">{stat.label}</span>
                <span
                  className={cn(
                    "font-mono text-xl font-medium leading-none tabular-nums tracking-tight",
                    stat.highlight ? "text-accent-brand" : "text-foreground"
                  )}
                >
                  {stat.value}
                </span>
              </div>
              <stat.icon
                className={cn(
                  "size-3.5 shrink-0",
                  stat.highlight ? "text-accent-brand" : "text-muted-foreground"
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-stagger grid items-start gap-2.5 lg:grid-cols-[1.45fr_1fr]">
        <RequestsTable
          requests={requests.slice(0, 5)}
          title="Recent Requests"
          showViewAll
          animateRows
        />

        <div className="flex flex-col gap-2.5">
          <ApprovalQueue items={approvalItems} animateRows openCount={stats.pendingApprovals} />
          <EventsTimeline events={events.slice(0, 12)} animateRows />
        </div>
      </div>
    </div>
  );
}
