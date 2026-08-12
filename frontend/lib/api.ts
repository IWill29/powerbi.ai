import type {
  ApprovalGateDetail,
  MockRequest,
  RequestEvent,
  RequestStatus,
} from "@/lib/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new ApiError(detail || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

type ApiRequestSummary = {
  id: string;
  title: string;
  client: string;
  status: RequestStatus;
  updated_at: string;
  created_at: string;
  submitted_by: string;
  agent_run?: string | null;
  current_gate?: number | null;
};

type ApiRequestDetail = ApiRequestSummary & {
  description: string;
};

type ApiRequestEvent = {
  id: string;
  request_id: string;
  message: string;
  timestamp: string;
  kind: RequestEvent["kind"];
  agent_name: string;
  event_type: string;
};

type ApiDashboardStats = {
  active_requests: number;
  pending_approvals: number;
  agent_runs_today: number;
  avg_gate_minutes: number;
};

export type CreateRequestPayload = {
  title: string;
  description: string;
  client_reference: string;
  submitted_by: string;
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function mapRequest(summary: ApiRequestSummary): MockRequest {
  return {
    id: summary.id,
    title: summary.title,
    client: summary.client,
    status: summary.status,
    updatedAt: formatRelativeTime(summary.updated_at),
    createdAt: formatDate(summary.created_at),
    description: "description" in summary ? (summary as ApiRequestDetail).description : "",
    submittedBy: summary.submitted_by,
    agentRun: summary.agent_run ?? undefined,
    currentGate: summary.current_gate === 1 || summary.current_gate === 2
      ? summary.current_gate
      : undefined,
  };
}

function mapEvent(event: ApiRequestEvent): RequestEvent {
  return {
    id: event.id,
    requestId: event.request_id,
    message: event.message,
    timestamp: formatRelativeTime(event.timestamp),
    kind: event.kind,
  };
}

function mapGateDetail(raw: Record<string, unknown>): ApprovalGateDetail {
  const activity = (raw.activity_timeline as Array<Record<string, string>>) ?? [];
  const decision = raw.decision_summary as Record<string, unknown>;
  const preview = raw.preview as Record<string, unknown>;

  return {
    requestId: raw.request_id as string,
    gateNumber: raw.gate_number as 1 | 2,
    gateLabel: raw.gate_label as string,
    agentSummary: raw.agent_summary as string,
    evidence: (raw.evidence as ApprovalGateDetail["evidence"]) ?? [],
    warnings: (raw.warnings as ApprovalGateDetail["warnings"]) ?? [],
    corrections: ((raw.corrections as Array<Record<string, string>>) ?? []).map((c) => ({
      id: c.id,
      field: c.field,
      before: c.before,
      after: c.after,
      reason: c.reason,
      businessImpact: c.business_impact,
    })),
    preview: {
      title: preview.title as string,
      subtitle: preview.subtitle as string,
      blocks: (preview.blocks as ApprovalGateDetail["preview"]["blocks"]) ?? [],
    },
    previousGateNote: raw.previous_gate_note as string | undefined,
    decisionSummary: {
      verdict: decision.verdict as ApprovalGateDetail["decisionSummary"]["verdict"],
      verdictLabel: decision.verdict_label as string,
      correctionCount: decision.correction_count as number,
      warningCount: decision.warning_count as number,
      blockerCount: decision.blocker_count as number,
      summaryText: decision.summary_text as string,
    },
    validationChecklist: (raw.validation_checklist as ApprovalGateDetail["validationChecklist"]) ?? [],
    activityTimeline: activity.map((item) => ({
      id: item.id,
      time: item.time,
      actor: item.actor,
      event: item.event,
      detail: item.detail,
    })),
    pipelineSteps: (raw.pipeline_steps as ApprovalGateDetail["pipelineSteps"]) ?? [],
  };
}

export async function fetchBackendHealth(): Promise<boolean> {
  try {
    const data = await apiFetch<{ status: string }>("/health");
    return data.status === "ok";
  } catch {
    return false;
  }
}

export async function fetchRequests(status?: RequestStatus): Promise<MockRequest[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await apiFetch<ApiRequestSummary[]>(`/requests${query}`);
  return data.map(mapRequest);
}

export async function fetchRequest(id: string): Promise<MockRequest | null> {
  try {
    const data = await apiFetch<ApiRequestDetail>(`/requests/${id}`);
    return mapRequest(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchRequestEvents(requestId: string): Promise<RequestEvent[]> {
  const data = await apiFetch<ApiRequestEvent[]>(`/requests/${requestId}/events`);
  return data.map(mapEvent);
}

export async function fetchPendingApprovals(): Promise<MockRequest[]> {
  return fetchRequests("Approval Gate");
}

export async function fetchApprovalGateDetail(
  requestId: string
): Promise<ApprovalGateDetail | null> {
  try {
    const data = await apiFetch<Record<string, unknown>>(`/approvals/${requestId}`);
    return mapGateDetail(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function decideApproval(
  requestId: string,
  decision: "approve" | "reject" | "request_changes",
  reviewer = "Reviewer"
): Promise<void> {
  await apiFetch(`/approvals/${requestId}/decide`, {
    method: "POST",
    body: JSON.stringify({ decision, reviewer }),
  });
}

export async function createRequest(payload: CreateRequestPayload): Promise<MockRequest> {
  const data = await apiFetch<ApiRequestDetail>("/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapRequest(data);
}

export async function fetchDashboardStats(): Promise<ApiDashboardStats> {
  return apiFetch<ApiDashboardStats>("/requests/stats");
}

export function getEventsStreamUrl(requestId: string): string {
  return `${API_BASE}/requests/${requestId}/events/stream`;
}
