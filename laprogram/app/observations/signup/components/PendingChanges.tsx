import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Check } from "lucide-react";
import { format } from "date-fns";
import type { Availability } from "@/types/db";
import type { MyObservation } from "../types";
import { formatTime } from "../types";

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
          <p className="text-xs text-muted-foreground">
            No pending changes.
          </p>
        )}
        {addSlots.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-green-600">Adding</h3>
            <div className="space-y-3">
              {addSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{slot.la_name}</p>
                    <p className="text-muted-foreground">
                      {slot.course_name} {slot.section_name} &middot;{" "}
                      {format(slot.time_start, "M/d")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(slot.time_start)}–
                      {formatTime(slot.time_end)} &middot; {slot.location}
                    </p>
                  </div>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => onUndoAdd(slot.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {removeSlots.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-red-600">Removing</h3>
            <div className="space-y-3">
              {removeSlots.map((obs) => (
                <div
                  key={obs.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 text-sm">
                    <p className="font-medium line-through opacity-60">
                      {obs.observee_name}
                    </p>
                    <p className="text-muted-foreground line-through opacity-60">
                      {obs.course_name} {obs.section_name} &middot;{" "}
                      {format(obs.time_start, "M/d")}
                    </p>
                    <p className="text-xs text-muted-foreground line-through opacity-60">
                      {formatTime(obs.time_start)}–
                      {formatTime(obs.time_end)} &middot; {obs.location}
                    </p>
                  </div>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => onUndoRemove(obs.id)}
                    title="Undo removal"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
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
