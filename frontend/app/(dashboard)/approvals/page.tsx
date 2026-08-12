import { ApprovalQueue } from "@/components/dashboard-overview";
import { getPendingApprovalsData } from "@/lib/data";

export default async function ApprovalsPage() {
  const approvalItems = await getPendingApprovalsData();

  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <ApprovalQueue
        items={approvalItems}
        title="Pending Approvals"
        openCount={approvalItems.length}
        variant="full"
        animateRows
      />
    </div>
  );
}
