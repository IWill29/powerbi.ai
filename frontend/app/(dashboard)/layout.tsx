import { DashboardShell } from "@/components/dashboard-shell";
import { getBackendStatus } from "@/lib/backend-status";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const backendStatus = await getBackendStatus();

  return (
    <DashboardShell backendStatus={backendStatus}>{children}</DashboardShell>
  );
}
