import { Button } from "@/components/ui/button";
import { X, UserRound } from "lucide-react";
import Image from "next/image";
import type { MyObservation } from "../types";
import { formatDateLA, formatTimeLA } from "../types";
import { IMAGE_SIZE, LA_POSITION_MAP } from "@/lib/constants";

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
          {obs.la_image ? (
            <Image
              src={obs.la_image}
              alt={obs.la_name}
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
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
          <p className="font-medium">
            {obs.la_name}{" "}
            <span className="font-normal text-muted-foreground">
              ({obs.la_email})
            </span>
          </p>
          <p className="text-muted-foreground">
            {LA_POSITION_MAP.get(obs.la_position) ?? obs.la_position} &middot;{" "}
            {obs.course_name} {obs.section_name} &middot;{" "}
            {formatDateLA(obs.time_start)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimeLA(obs.time_start)}–{formatTimeLA(obs.time_end)} &middot;{" "}
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
