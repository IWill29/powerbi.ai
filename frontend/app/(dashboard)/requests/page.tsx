import { RequestsTable } from "@/components/dashboard-overview";
import { getRequestsData } from "@/lib/data";

export default async function RequestsPage() {
  const requests = await getRequestsData();

  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <RequestsTable
        requests={requests}
        title="All Requests"
        animateRows
      />
    </div>
  );
}
