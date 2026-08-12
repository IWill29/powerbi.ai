"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BackendStatus } from "@/lib/backend-status";
import { cn } from "@/lib/utils";

type BackendStatusDotProps = {
  status: BackendStatus;
  className?: string;
};

export function BackendStatusDot({ status, className }: BackendStatusDotProps) {
  const connected = status === "Connected";

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
        aria-label={`API ${status}`}
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            connected ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
        <span className="font-mono uppercase tracking-wide">API</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Backend {connected ? "connected" : "unreachable"}
      </TooltipContent>
    </Tooltip>
  );
}
