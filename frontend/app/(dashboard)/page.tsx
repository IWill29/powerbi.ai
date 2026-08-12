import { DashboardOverview } from "@/components/dashboard-overview";
import {
  getAllEventsData,
  getDashboardStatsData,
  getRequestsData,
} from "@/lib/data";
import { getBackendStatus } from "@/lib/backend-status";

export default async function DashboardPage() {
  await getBackendStatus();
  const [requests, events, stats] = await Promise.all([
    getRequestsData(),
    getAllEventsData(),
    getDashboardStatsData(),
  ]);

  return <DashboardOverview requests={requests} events={events} stats={stats} />;
}
