import {
  fetchApprovalGateDetail,
  fetchBackendHealth,
  fetchDashboardStats,
  fetchPendingApprovals,
  fetchRequest,
  fetchRequestEvents,
  fetchRequests,
} from "@/lib/api";
import {
  allRequests,
  approvalGateDetails,
  dashboardStats,
  getApprovalGateDetail,
  getEventsForRequest,
  getPendingApprovals,
  getRequestById,
  requestEvents,
  type ApprovalGateDetail,
  type MockRequest,
  type RequestEvent,
} from "@/lib/mock-data";

export async function getRequestsData(): Promise<MockRequest[]> {
  try {
    if (await fetchBackendHealth()) {
      return await fetchRequests();
    }
  } catch {
    // fall through to mock
  }
  return allRequests;
}

export async function getRequestData(id: string): Promise<MockRequest | undefined> {
  try {
    if (await fetchBackendHealth()) {
      const request = await fetchRequest(id);
      return request ?? undefined;
    }
  } catch {
    // fall through
  }
  return getRequestById(id);
}

export async function getRequestEventsData(requestId: string): Promise<RequestEvent[]> {
  try {
    if (await fetchBackendHealth()) {
      return await fetchRequestEvents(requestId);
    }
  } catch {
    // fall through
  }
  return getEventsForRequest(requestId);
}

export async function getPendingApprovalsData(): Promise<MockRequest[]> {
  try {
    if (await fetchBackendHealth()) {
      return await fetchPendingApprovals();
    }
  } catch {
    // fall through
  }
  return getPendingApprovals();
}

export async function getApprovalGateData(
  requestId: string
): Promise<ApprovalGateDetail | undefined> {
  try {
    if (await fetchBackendHealth()) {
      const gate = await fetchApprovalGateDetail(requestId);
      return gate ?? undefined;
    }
  } catch {
    // fall through
  }
  return getApprovalGateDetail(requestId);
}

export async function getDashboardStatsData() {
  try {
    if (await fetchBackendHealth()) {
      const stats = await fetchDashboardStats();
      return {
        activeRequests: stats.active_requests,
        pendingApprovals: stats.pending_approvals,
        agentRunsToday: stats.agent_runs_today,
        avgGateMinutes: stats.avg_gate_minutes,
      };
    }
  } catch {
    // fall through
  }
  return dashboardStats;
}

export async function getAllEventsData(): Promise<RequestEvent[]> {
  try {
    if (await fetchBackendHealth()) {
      const requests = await fetchRequests();
      const batches = await Promise.all(
        requests.map(async (request) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/requests/${request.id}/events`,
            { cache: "no-store" }
          );
          if (!res.ok) {
            return [] as Array<{
              id: string;
              request_id: string;
              message: string;
              timestamp: string;
              kind: RequestEvent["kind"];
            }>;
          }
          return (await res.json()) as Array<{
            id: string;
            request_id: string;
            message: string;
            timestamp: string;
            kind: RequestEvent["kind"];
          }>;
        })
      );
      return batches
        .flat()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .map((event) => ({
          id: event.id,
          requestId: event.request_id,
          message: event.message,
          timestamp: new Date(event.timestamp).toLocaleString(),
          kind: event.kind,
        }));
    }
  } catch {
    // fall through
  }
  return requestEvents;
}

export function getMockApprovalGateDetails(): typeof approvalGateDetails {
  return approvalGateDetails;
}
