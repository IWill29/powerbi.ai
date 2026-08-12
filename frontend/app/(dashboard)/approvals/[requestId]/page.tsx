import { notFound } from "next/navigation";

import { ApprovalReview } from "@/components/approval-review";
import { getApprovalGateData, getRequestData } from "@/lib/data";

type ApprovalReviewPageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function ApprovalReviewPage({
  params,
}: ApprovalReviewPageProps) {
  const { requestId } = await params;
  const request = await getRequestData(requestId);
  const gate = await getApprovalGateData(requestId);

  if (!request || !gate || request.status !== "Approval Gate") {
    notFound();
  }

  return <ApprovalReview request={request} gate={gate} />;
}
