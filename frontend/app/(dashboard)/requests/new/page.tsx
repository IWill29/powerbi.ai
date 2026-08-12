import { RequestIntakeForm } from "@/components/request-intake-form";

export default function NewRequestPage() {
  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <RequestIntakeForm />
    </div>
  );
}
