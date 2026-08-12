import { getBackendStatus } from "@/lib/backend-status";
import { DashboardOverview } from "@/components/dashboard-overview";

export default async function DashboardPage() {
  await getBackendStatus();

  return <DashboardOverview />;
}
