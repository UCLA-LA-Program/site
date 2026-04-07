import { Button } from "@/components/ui/button";
import { X, UserRound } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import type { MyObservation } from "../types";
import { formatTime } from "../types";

export function ObservationRow({
  obs,
  onRemove,
}: {
  obs: MyObservation;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-sm border bg-muted">
          {obs.observee_image ? (
            <Image
              src={obs.observee_image}
              alt={obs.observee_name}
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound
              className="h-full w-full text-muted-foreground"
              strokeWidth={1}
            />
          )}
        </div>
        <div className="min-w-0 text-sm">
          <p className="font-medium">{obs.observee_name}</p>
          <p className="text-muted-foreground">
            {obs.course_name} {obs.section_name} &middot;{" "}
            {format(obs.time_start, "M/d")}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTime(obs.time_start)}–{formatTime(obs.time_end)} &middot;{" "}
            {obs.location}
          </p>
          {obs.ta_name && (
            <p className="text-xs text-muted-foreground">
              TA: {obs.ta_name}
              {obs.ta_email && <span> ({obs.ta_email})</span>}
            </p>
          )}
        </div>
      </div>
      {onRemove && (
        <Button size="icon-xs" variant="ghost" onClick={onRemove}>
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
