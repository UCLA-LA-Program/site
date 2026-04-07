import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Check } from "lucide-react";
import { format } from "date-fns";
import type { Availability } from "@/types/db";
import { LA_POSITION_MAP } from "@/lib/constants";
import type { MyObservation } from "../types";
import { formatTime } from "../types";

function PendingRow({
  slot,
  strikethrough,
  action,
}: {
  slot: Availability;
  strikethrough?: boolean;
  action: React.ReactNode;
}) {
  const strike = strikethrough ? "line-through opacity-60" : "";
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 text-sm">
        <p className={`font-medium ${strike}`}>{slot.la_name}</p>
        <p className={`text-muted-foreground ${strike}`}>
          {slot.la_position && (
            <>
              {LA_POSITION_MAP.get(slot.la_position) ?? slot.la_position}{" "}
              &middot; {slot.course_name} {slot.section_name} &middot;{" "}
              {format(slot.time_start, "M/d")}{" "}
            </>
          )}
        </p>
        <p className={`text-xs text-muted-foreground ${strike}`}>
          {formatTime(slot.time_start)}–{formatTime(slot.time_end)} &middot;{" "}
          {slot.location}
        </p>
      </div>
      {action}
    </div>
  );
}

export function PendingChanges({
  addSlots,
  removeSlots,
  onUndoAdd,
  onUndoRemove,
  onConfirm,
}: {
  addSlots: Availability[];
  removeSlots: MyObservation[];
  onUndoAdd: (id: string) => void;
  onUndoRemove: (id: string) => void;
  onConfirm: () => void;
}) {
  const hasChanges = addSlots.length > 0 || removeSlots.length > 0;

  return (
    <Card className={hasChanges ? "border-primary/30" : ""}>
      <CardHeader>
        <CardTitle>Pending Changes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasChanges && (
          <p className="text-xs text-muted-foreground">No pending changes.</p>
        )}
        {addSlots.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-green-600">Adding</h3>
            <div className="space-y-3">
              {addSlots.map((slot) => (
                <PendingRow
                  key={slot.id}
                  slot={slot}
                  action={
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => onUndoAdd(slot.id)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {removeSlots.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-red-600">Removing</h3>
            <div className="space-y-3">
              {removeSlots.map((obs) => (
                <PendingRow
                  key={obs.id}
                  slot={obs}
                  strikethrough
                  action={
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => onUndoRemove(obs.id)}
                      title="Undo removal"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {hasChanges && <Separator />}

        <Button
          className="w-full"
          size="sm"
          onClick={onConfirm}
          disabled={!hasChanges}
        >
          <Check className="size-3.5" />
          Confirm Changes
        </Button>
      </CardContent>
    </Card>
  );
}
