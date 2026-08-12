"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Database,
  HelpCircle,
  Info,
  LineChart,
  Pencil,
  XCircle,
} from "lucide-react";

import { statusStyles } from "@/components/dashboard-overview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import type {
  ActivityTimelineItem,
  ApprovalGateDetail,
  ApprovalWarning,
  CorrectionDiff,
  EvidenceItem,
  MockPreview,
  MockRequest,
  PipelineStep,
  ValidationChecklistItem,
} from "@/lib/mock-data";
import { decideApproval } from "@/lib/api";
import { cn } from "@/lib/utils";

const checklistIcons = {
  pass: CheckCircle2,
  pass_with_warning: AlertTriangle,
  fail: XCircle,
} as const;

const checklistStyles = {
  pass: "text-emerald-400",
  pass_with_warning: "text-amber-400",
  fail: "text-destructive",
} as const;

const checklistLabels = {
  pass: "OK",
  pass_with_warning: "Brīdinājums",
  fail: "Neizdevās",
} as const;

const evidenceIcons = {
  dataSource: Database,
  kpi: LineChart,
  openQuestion: HelpCircle,
} as const;

const evidenceLabels = {
  dataSource: "Datu avoti",
  kpi: "KPI",
  openQuestion: "Atvērtie jautājumi",
} as const;

const verdictStyles = {
  approve: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  approve_with_warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  reject: "border-destructive/30 bg-destructive/10 text-destructive",
  needs_changes: "border-accent-brand/30 bg-accent-brand-muted text-accent-brand",
} as const;

type MockAction = "approve" | "reject" | "changes" | null;

type ApprovalReviewProps = {
  request: MockRequest;
  gate: ApprovalGateDetail;
};

function PipelineBar({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden className="text-muted-foreground/50">
              →
            </span>
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-1.5 py-px text-[10px] font-medium",
              step.status === "done" && "text-emerald-400",
              step.status === "current" && "bg-accent-brand-muted text-accent-brand",
              step.status === "pending" && "text-muted-foreground"
            )}
          >
            {step.status === "done" ? (
              <Check className="size-2.5" />
            ) : step.status === "current" ? (
              <Clock className="size-2.5" />
            ) : (
              <Circle className="size-2.5" />
            )}
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function DecisionSummarySection({
  gate,
}: {
  gate: ApprovalGateDetail;
}) {
  const { decisionSummary } = gate;

  return (
    <section className="flex flex-col gap-2 rounded-sm border border-border/60 bg-muted/15 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className={cn(
            "rounded-sm border px-2 py-px text-[11px] font-medium",
            verdictStyles[decisionSummary.verdict]
          )}
        >
          {decisionSummary.verdictLabel}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {decisionSummary.correctionCount} labojumi
          <span aria-hidden> · </span>
          {decisionSummary.warningCount} brīdinājums
          {decisionSummary.warningCount === 1 ? "" : "i"}
          <span aria-hidden> · </span>
          {decisionSummary.blockerCount} blokeri
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-foreground/90">
        {decisionSummary.summaryText}
      </p>
    </section>
  );
}

function ValidationChecklistSection({
  items,
}: {
  items: ValidationChecklistItem[];
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Validācijas checklist
      </h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = checklistIcons[item.status];
          return (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-sm border border-border/60 bg-muted/20 px-2.5 py-2"
            >
              <Icon
                className={cn(
                  "mt-0.5 size-3.5 shrink-0",
                  checklistStyles[item.status]
                )}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] font-medium leading-tight">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      checklistStyles[item.status]
                    )}
                  >
                    {checklistLabels[item.status]}
                  </span>
                </div>
                {item.detail ? (
                  <span className="text-[11px] leading-snug text-muted-foreground">
                    {item.detail}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RequirementsHighlights({ evidence }: { evidence: EvidenceItem[] }) {
  const kpis = evidence.filter((item) => item.category === "kpi");
  const openQuestions = evidence.filter(
    (item) => item.category === "openQuestion"
  );

  if (kpis.length === 0 && openQuestions.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Prasības un KPI
      </h2>
      <div className="grid gap-2 lg:grid-cols-2">
        {kpis.length > 0 ? (
          <div className="flex flex-col gap-1.5 rounded-sm border border-accent-brand/15 bg-accent-brand-muted/20 px-2.5 py-2">
            <div className="flex items-center gap-1.5">
              <LineChart className="size-3 text-accent-brand" />
              <h3 className="text-[11px] font-medium text-accent-brand">
                KPI definīcijas
              </h3>
            </div>
            <ul className="flex flex-col gap-1">
              {kpis.map((item) => (
                <li key={item.id}>
                  <p className="text-[12px] font-medium leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {openQuestions.length > 0 ? (
          <div className="flex flex-col gap-1.5 rounded-sm border border-amber-500/20 bg-amber-500/8 px-2.5 py-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="size-3 text-amber-400" />
              <h3 className="text-[11px] font-medium text-amber-300">
                Atvērtie jautājumi
              </h3>
            </div>
            <ul className="flex flex-col gap-1">
              {openQuestions.map((item) => (
                <li key={item.id}>
                  <p className="text-[12px] font-medium leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CorrectionsSection({ corrections }: { corrections: CorrectionDiff[] }) {
  if (corrections.length === 0) return null;

  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Pencil className="size-3 text-accent-brand" />
        <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Labojumi (pirms → pēc)
        </h2>
      </div>
      <ul className="flex flex-col gap-1.5">
        {corrections.map((correction) => (
          <li
            key={correction.id}
            className="rounded-sm border border-accent-brand/15 bg-accent-brand-muted/30 px-2.5 py-2"
          >
            <p className="text-[11px] font-medium text-muted-foreground">
              {correction.field}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="rounded-sm bg-destructive/10 px-1.5 py-px text-destructive line-through">
                {correction.before}
              </span>
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <span className="rounded-sm bg-emerald-500/12 px-1.5 py-px text-emerald-400">
                {correction.after}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              {correction.reason}
            </p>
            {correction.businessImpact ? (
              <p className="mt-1 text-[11px] font-medium text-accent-brand/90">
                {correction.businessImpact}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityTimelineSection({ items }: { items: ActivityTimelineItem[] }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Aktivitātes laika līnija
      </h2>
      <ol className="relative flex flex-col gap-0 border-l border-border/60 pl-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "relative pb-2.5",
              index === items.length - 1 && "pb-0"
            )}
          >
            <span
              aria-hidden
              className="absolute -left-[calc(0.75rem+1px)] top-1 size-1.5 rounded-full bg-accent-brand"
            />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {item.time}
              </span>
              <span className="text-[11px] font-medium text-accent-brand">
                {item.actor}
              </span>
            </div>
            <p className="text-[12px] leading-tight">{item.event}</p>
            {item.detail ? (
              <p className="text-[11px] leading-snug text-muted-foreground">
                {item.detail}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function RisksAndOpenItems({
  warnings,
  openQuestions,
}: {
  warnings: ApprovalWarning[];
  openQuestions: EvidenceItem[];
}) {
  const warningItems = warnings.filter((w) => w.severity === "warning");
  const infoItems = warnings.filter((w) => w.severity === "info");

  if (
    warningItems.length === 0 &&
    infoItems.length === 0 &&
    openQuestions.length === 0
  ) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Riski un atvērtie punkti
      </h2>

      {warningItems.length > 0 ? (
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-1.5 text-[10px] font-medium text-amber-400 uppercase">
            <AlertTriangle className="size-3" />
            Brīdinājumi
          </h3>
          <ul className="flex flex-col gap-1">
            {warningItems.map((warning) => (
              <li
                key={warning.id}
                className="flex items-start gap-2 rounded-sm border border-amber-500/25 bg-amber-500/8 px-2.5 py-1.5 text-[11px] leading-snug text-amber-200/90"
              >
                <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-400" />
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {infoItems.length > 0 ? (
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
            <Info className="size-3" />
            Piezīmes
          </h3>
          <ul className="flex flex-col gap-1">
            {infoItems.map((warning) => (
              <li
                key={warning.id}
                className="flex items-start gap-2 rounded-sm border border-border/60 bg-muted/20 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground"
              >
                <Info className="mt-0.5 size-3 shrink-0" />
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {openQuestions.length > 0 ? (
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
            <HelpCircle className="size-3" />
            Atvērtie jautājumi
          </h3>
          <ul className="flex flex-col gap-1">
            {openQuestions.map((item) => (
              <li
                key={item.id}
                className="rounded-sm border border-border/50 px-2.5 py-1.5"
              >
                <p className="text-[12px] font-medium leading-tight">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function EvidenceSection({
  category,
  items,
}: {
  category: EvidenceItem["category"];
  items: EvidenceItem[];
}) {
  const Icon = evidenceIcons[category];
  const sectionItems = items.filter((item) => item.category === category);
  if (sectionItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 text-muted-foreground" />
        <h3 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {evidenceLabels[category]}
        </h3>
      </div>
      <ul className="flex flex-col gap-1">
        {sectionItems.map((item) => (
          <li
            key={item.id}
            className="rounded-sm border border-border/50 px-2.5 py-1.5"
          >
            <p className="text-[12px] font-medium leading-tight">{item.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FullEvidenceSection({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-sm border border-border/60 bg-muted/15 px-2.5 py-2 text-left transition-colors hover:bg-muted/25">
        <span className="text-[11px] font-medium text-muted-foreground">
          Skatīt pilnu evidence
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-3 data-panel-open:animate-in data-panel-open:fade-in-0">
        <div className="grid gap-3 lg:grid-cols-2">
          <EvidenceSection category="dataSource" items={evidence} />
          <EvidenceSection category="kpi" items={evidence} />
          <EvidenceSection category="openQuestion" items={evidence} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MockPreviewPanel({ preview }: { preview: MockPreview }) {
  return (
    <div className="overflow-hidden rounded-sm border border-border bg-[oklch(0.14_0.008_264)]">
      <div className="border-b border-border/60 px-3 py-2">
        <p className="text-[12px] font-medium">{preview.title}</p>
        <p className="text-[10px] text-muted-foreground">{preview.subtitle}</p>
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        {preview.blocks.map((block, index) => {
          if (block.type === "kpi") {
            return (
              <div
                key={`${block.label}-${index}`}
                className="rounded-sm border border-border/40 bg-card/40 px-2.5 py-2"
              >
                <p className="text-[10px] text-muted-foreground">{block.label}</p>
                <p className="font-mono text-lg font-medium tabular-nums text-accent-brand">
                  {block.value}
                </p>
              </div>
            );
          }

          if (block.type === "bar" && block.bars) {
            return (
              <div
                key={`${block.label}-${index}`}
                className="rounded-sm border border-border/40 bg-card/40 px-2.5 py-2 sm:col-span-2"
              >
                <p className="mb-2 text-[10px] text-muted-foreground">
                  {block.label}
                </p>
                <div className="flex flex-col gap-1.5">
                  {block.bars.map((bar) => (
                    <div key={bar.label} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 truncate text-[10px] text-muted-foreground">
                        {bar.label}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted/40">
                        <div
                          className="h-full rounded-sm bg-accent-brand/70"
                          style={{ width: `${bar.width}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (block.type === "table" && block.rows) {
            return (
              <div
                key={`${block.label}-${index}`}
                className="rounded-sm border border-border/40 bg-card/40 px-2.5 py-2 sm:col-span-2"
              >
                <p className="mb-1.5 text-[10px] text-muted-foreground">
                  {block.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {block.rows.map((row) => (
                    <li
                      key={row}
                      className="font-mono text-[10px] tabular-nums text-foreground/85"
                    >
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

const actionMessages: Record<Exclude<MockAction, null>, string> = {
  approve: "Apstiprināts — Mock Pipeline turpinās.",
  reject: "Noraidīts — Request apturēts.",
  changes: "Labojumi pieprasīti — pipeline atgriezīsies iepriekšējā fāzē.",
};

async function submitDecision(
  requestId: string,
  action: Exclude<MockAction, null>
): Promise<void> {
  const decision =
    action === "approve"
      ? "approve"
      : action === "reject"
        ? "reject"
        : "request_changes";
  await decideApproval(requestId, decision);
}

export function ApprovalReview({ request, gate }: ApprovalReviewProps) {
  const router = useRouter();
  const [action, setAction] = useState<MockAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGate1 = gate.gateNumber === 1;
  const openQuestions = gate.evidence.filter(
    (item) => item.category === "openQuestion"
  );

  async function handleAction(next: Exclude<MockAction, null>) {
    setSubmitting(true);
    setError(null);
    try {
      await submitDecision(request.id, next);
      setAction(next);
      router.refresh();
      if (next === "approve") {
        setTimeout(() => router.push(`/requests/${request.id}`), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="xs"
          className="h-7 rounded-sm px-2 text-[11px] text-muted-foreground"
          render={<Link href="/approvals" />}
        >
          <ArrowLeft className="size-3" />
          Atpakaļ
        </Button>
        <Badge
          variant="secondary"
          className="rounded-full border-0 bg-accent-brand-muted px-2 py-px text-[11px] text-accent-brand"
        >
          Approval Gate {gate.gateNumber}
        </Badge>
        <span className="text-[11px] text-muted-foreground">{gate.gateLabel}</span>
      </div>

      <Card className="gap-0 rounded-sm border border-border py-0 shadow-none">
        <CardHeader className="sticky top-0 z-10 border-b border-border bg-card px-3 py-2.5">
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
              <PipelineBar steps={gate.pipelineSteps} />
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
          {gate.previousGateNote ? (
            <p className="rounded-sm border border-border/60 bg-muted/20 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
              {gate.previousGateNote}
            </p>
          ) : null}

          <DecisionSummarySection gate={gate} />

          {isGate1 ? <RequirementsHighlights evidence={gate.evidence} /> : null}

          <ValidationChecklistSection items={gate.validationChecklist} />

          {!isGate1 ? (
            <CorrectionsSection corrections={gate.corrections} />
          ) : gate.corrections.length > 0 ? (
            <CorrectionsSection corrections={gate.corrections} />
          ) : null}

          <Separator />

          <ActivityTimelineSection items={gate.activityTimeline} />

          <Separator />

          <RisksAndOpenItems
            warnings={gate.warnings}
            openQuestions={isGate1 ? [] : openQuestions}
          />

          <Separator />

          <section className="flex flex-col gap-1.5">
            <h2 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Mock Solution preview
            </h2>
            <MockPreviewPanel preview={gate.preview} />
          </section>

          <FullEvidenceSection evidence={gate.evidence} />

          {error ? (
            <p className="text-[12px] text-destructive">{error}</p>
          ) : action ? (
            <div
              role="status"
              className={cn(
                "rounded-sm border px-3 py-2 text-[12px]",
                action === "approve" &&
                  "border-emerald-500/25 bg-emerald-500/8 text-emerald-300",
                action === "reject" &&
                  "border-destructive/25 bg-destructive/8 text-destructive",
                action === "changes" &&
                  "border-accent-brand/25 bg-accent-brand-muted text-accent-brand"
              )}
            >
              {actionMessages[action]}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Lēmums tiek nosūtīts backend API un atjauno Mock Pipeline.
            </p>
          )}

          <div className="sticky bottom-0 -mx-3 flex flex-wrap items-center gap-2 border-t border-border bg-card px-3 py-3">
            <Button
              size="sm"
              className="h-8 rounded-sm bg-emerald-600 text-[12px] hover:bg-emerald-600/90"
              onClick={() => handleAction("approve")}
              disabled={action !== null || submitting}
            >
              <Check className="size-3.5" />
              Apstiprināt
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-sm text-[12px]"
              onClick={() => handleAction("changes")}
              disabled={action !== null || submitting}
            >
              <Pencil className="size-3.5" />
              Pieprasīt labojumus
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 rounded-sm text-[12px]"
              onClick={() => handleAction("reject")}
              disabled={action !== null || submitting}
            >
              <XCircle className="size-3.5" />
              Noraidīt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-8 rounded-sm text-[12px] text-muted-foreground"
              render={<Link href={`/requests/${request.id}`} />}
            >
              Skatīt Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
