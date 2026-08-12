"use client";

import { useEffect, useState } from "react";

import { EventsTimeline } from "@/components/dashboard-overview";
import type { RequestEvent } from "@/lib/mock-data";
import { getEventsStreamUrl } from "@/lib/api";

type RequestEventsStreamProps = {
  requestId: string;
  initialEvents: RequestEvent[];
  title?: string;
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function mapStreamEvent(raw: Record<string, unknown>): RequestEvent {
  return {
    id: raw.id as string,
    requestId: raw.request_id as string,
    message: raw.message as string,
    timestamp: formatRelativeTime(raw.timestamp as string),
    kind: raw.kind as RequestEvent["kind"],
  };
}

export function RequestEventsStream({
  requestId,
  initialEvents,
  title,
}: RequestEventsStreamProps) {
  const [events, setEvents] = useState<RequestEvent[]>(initialEvents);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    const source = new EventSource(getEventsStreamUrl(requestId));

    source.addEventListener("request_event", (message) => {
      try {
        const raw = JSON.parse(message.data) as Record<string, unknown>;
        const event = mapStreamEvent(raw);
        setEvents((current) => {
          if (current.some((item) => item.id === event.id)) return current;
          return [...current, event];
        });
      } catch {
        // ignore malformed SSE payloads
      }
    });

    return () => source.close();
  }, [requestId]);

  return (
    <EventsTimeline
      events={events}
      title={title ?? `Request Events — ${requestId}`}
      scrollHeight="none"
      showRequestId={false}
    />
  );
}
