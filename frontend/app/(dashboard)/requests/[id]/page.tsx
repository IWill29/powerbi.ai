import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import {
  statusStyles,
} from "@/components/dashboard-overview";
import { RequestEventsStream } from "@/components/request-events-stream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getApprovalGateData,
  getRequestData,
  getRequestEventsData,
} from "@/lib/data";
import { getStatusIndex, statusProgression } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;
  const request = await getRequestData(id);

  if (!request) {
    notFound();
  }

  const events = await getRequestEventsData(id);
  const gate = await getApprovalGateData(id);
  const currentStatusIndex = getStatusIndex(request.status);

  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <Button
        variant="ghost"
        size="xs"
        className="h-7 w-fit rounded-sm px-2 text-[11px] text-muted-foreground"
        render={<Link href="/requests" />}
      >
        <ArrowLeft className="size-3" />
        Visi Requests
      </Button>

      <Card className="gap-0 rounded-sm border border-border py-0 shadow-none">
        <CardHeader className="border-b border-border px-3 py-2.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {request.id}
                {request.agentRun ? (
                  <>
                    <span aria-hidden> · </span>
                    {request.agentRun}
                  </>
                ) : null}
              </span>
              <CardTitle className="text-[15px] font-medium tracking-tight">
                {request.title}
              </CardTitle>
              <p className="text-[12px] text-muted-foreground">
                {request.client}
                <span aria-hidden> · </span>
                {request.submittedBy}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full border-0 px-2 py-px font-normal text-[11px]",
                statusStyles[request.status]
              )}
            >
              {request.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 p-3">
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {request.description}
          </p>

          <dl className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-sm border border-border/60 px-2.5 py-1.5">
              <dt className="text-[10px] text-muted-foreground">Izveidots</dt>
              <dd className="font-mono text-[12px] tabular-nums">
                {request.createdAt}
              </dd>
            </div>
            <div className="rounded-sm border border-border/60 px-2.5 py-1.5">
              <dt className="text-[10px] text-muted-foreground">
                Pēdējā aktivitāte
              </dt>
              <dd className="font-mono text-[12px] tabular-nums">
                {request.updatedAt}
              </dd>
            </div>
            {request.currentGate ? (
              <div className="rounded-sm border border-accent-brand/20 bg-accent-brand-muted/30 px-2.5 py-1.5">
                <dt className="text-[10px] text-muted-foreground">
                  Approval Gate
                </dt>
                <dd className="text-[12px] text-accent-brand">
                  Gate {request.currentGate}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Statusa progresija
            </h2>
            <ol className="flex flex-wrap items-center gap-1">
              {statusProgression.map((step, index) => {
                const isComplete = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <li key={step} className="flex items-center gap-1">
                    <span
                      className={cn(
                        "rounded-sm px-2 py-0.5 text-[11px]",
                        isComplete &&
                          "bg-emerald-500/12 text-emerald-400",
                        isCurrent &&
                          "bg-accent-brand-muted text-accent-brand ring-1 ring-accent-brand/30",
                        !isComplete &&
                          !isCurrent &&
                          "bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {step}
                    </span>
                    {index < statusProgression.length - 1 ? (
                      <span
                        aria-hidden
                        className="text-[10px] text-muted-foreground"
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          {request.status === "Approval Gate" && gate ? (
            <div className="flex items-center justify-between gap-2 rounded-sm border border-accent-brand/20 bg-accent-brand-muted/20 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-3.5 text-accent-brand" />
                <p className="text-[12px]">
                  Gaida Reviewer — Approval Gate {gate.gateNumber}
                </p>
              </div>
              <Button
                size="sm"
                className="h-7 rounded-sm text-[11px]"
                render={<Link href={`/approvals/${request.id}`} />}
              >
                Review
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <RequestEventsStream
        requestId={id}
        initialEvents={events}
        title={`Request Events — ${request.id}`}
      />
    </div>
  );
}
