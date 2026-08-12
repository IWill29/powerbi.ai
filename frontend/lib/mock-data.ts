export type RequestStatus =
  | "Intake"
  | "Agent Run"
  | "Approval Gate"
  | "Delivered";

export type MockRequest = {
  id: string;
  title: string;
  client: string;
  status: RequestStatus;
  updatedAt: string;
  agentRun?: string;
};

export type RequestEvent = {
  id: string;
  requestId: string;
  message: string;
  timestamp: string;
  kind: "agent" | "gate" | "system";
};

export const dashboardStats = {
  activeRequests: 12,
  pendingApprovals: 3,
  agentRunsToday: 8,
  avgGateMinutes: 4,
} as const;

export const recentRequests: MockRequest[] = [
  {
    id: "REQ-1042",
    title: "Sales pipeline dashboard",
    client: "Northwind Trading",
    status: "Approval Gate",
    updatedAt: "2m ago",
    agentRun: "RUN-8821",
  },
  {
    id: "REQ-1041",
    title: "Inventory turnover report",
    client: "Contoso Retail",
    status: "Agent Run",
    updatedAt: "18m ago",
    agentRun: "RUN-8819",
  },
  {
    id: "REQ-1039",
    title: "Executive KPI scorecard",
    client: "Fabrikam Finance",
    status: "Delivered",
    updatedAt: "1h ago",
    agentRun: "RUN-8812",
  },
  {
    id: "REQ-1038",
    title: "Regional revenue drill-through",
    client: "Adventure Works",
    status: "Intake",
    updatedAt: "3h ago",
  },
  {
    id: "REQ-1036",
    title: "Supplier performance model",
    client: "Tailspin Toys",
    status: "Approval Gate",
    updatedAt: "5h ago",
    agentRun: "RUN-8804",
  },
];

export const requestEvents: RequestEvent[] = [
  {
    id: "EVT-4410",
    requestId: "REQ-1042",
    message: "Validation sub-agent passed Solution checks",
    timestamp: "2m ago",
    kind: "agent",
  },
  {
    id: "EVT-4408",
    requestId: "REQ-1042",
    message: "Approval Gate opened — awaiting Reviewer",
    timestamp: "4m ago",
    kind: "gate",
  },
  {
    id: "EVT-4405",
    requestId: "REQ-1041",
    message: "Requirements sub-agent completed intake analysis",
    timestamp: "12m ago",
    kind: "agent",
  },
  {
    id: "EVT-4401",
    requestId: "REQ-1041",
    message: "Agent Run RUN-8819 started (Mock Pipeline)",
    timestamp: "18m ago",
    kind: "system",
  },
  {
    id: "EVT-4396",
    requestId: "REQ-1039",
    message: "Solution approved and marked Delivered",
    timestamp: "1h ago",
    kind: "gate",
  },
];
