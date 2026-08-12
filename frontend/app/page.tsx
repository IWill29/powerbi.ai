import { ArrowRight, CircleDashed, Inbox, List, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const futureSections = [
  {
    title: "Requests",
    description: "Submit and track Power BI solution Requests.",
    href: "/requests",
    icon: List,
  },
  {
    title: "New Request",
    description: "Intake form for title, description, and client reference.",
    href: "/requests/new",
    icon: Plus,
  },
  {
    title: "Approval Inbox",
    description: "Review agent output at mandatory Approval Gates.",
    href: "/approvals",
    icon: Inbox,
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="size-2 rounded-sm bg-[var(--accent-brand)]"
            />
            <span className="font-medium tracking-tight text-foreground">
              AI Power BI Agent Platform
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Phase 1 · Mock Pipeline
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        <section className="space-y-1">
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
            Operations dashboard
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Manage Requests, monitor agent activity, and approve Solutions before
            delivery. MVP scaffold — features ship incrementally.
          </p>
        </section>

        <Card className="rounded-sm ring-1 ring-border shadow-none">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>MVP status</CardTitle>
                <CardDescription>
                  Phase 1 mock pipeline — no real PBIP generation yet.
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                <CircleDashed className="size-3" aria-hidden />
                Scaffold
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-0.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Backend API
                </dt>
                <dd className="font-mono text-[13px]">Not connected</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Agent pipeline
                </dt>
                <dd className="font-mono text-[13px]">Mock (planned)</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Approval Gates
                </dt>
                <dd className="font-mono text-[13px]">HITL required</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
            Sections (coming soon)
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {futureSections.map(({ title, description, href, icon: Icon }) => (
              <Card
                key={href}
                className="rounded-sm ring-1 ring-border shadow-none"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon
                      className="size-3.5 text-muted-foreground"
                      aria-hidden
                    />
                    <CardTitle>{title}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-sm"
                    disabled
                    aria-label={`${title} — coming soon`}
                  >
                    Open
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
