import { EventsTimeline } from "@/components/dashboard-overview";
import { getAllEventsData } from "@/lib/data";

export default async function ActivityPage() {
  const events = await getAllEventsData();

  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2.5 p-3">
      <EventsTimeline
        events={events}
        title="Request Events"
        scrollHeight="none"
        animateRows
      />
    </div>
  );
}
