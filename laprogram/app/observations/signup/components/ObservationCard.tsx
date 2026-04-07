"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import type { MyObservation } from "../types";
import { ObservationRow } from "./ObservationRow";

export function FutureObservations({
  observations,
  onRemove,
}: {
  observations: MyObservation[];
  onRemove: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Future Observations</CardTitle>
      </CardHeader>
      <CardContent>
        {observations.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No future observations yet.
          </p>
        ) : (
          <div className="space-y-4">
            {observations.map((obs) => (
              <ObservationRow
                key={obs.id}
                obs={obs}
                onRemove={() => onRemove(obs.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingObservations({
  observations,
}: {
  observations: MyObservation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Upcoming Observations
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            next 3 days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {observations.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No upcoming observations.
          </p>
        ) : (
          <div className="space-y-4">
            {observations.map((obs) => (
              <ObservationRow key={obs.id} obs={obs} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PastObservations({
  observations,
}: {
  observations: MyObservation[];
}) {
  const [open, setOpen] = useState(false);
  const hasObs = observations.length > 0;

  return (
    <Card>
      <CardHeader
        className={hasObs ? "cursor-pointer" : undefined}
        onClick={hasObs ? () => setOpen((o) => !o) : undefined}
      >
        <CardTitle className="flex items-center gap-1.5">
          {hasObs && (
            <ChevronRight
              className={`size-4 transition-transform ${open ? "rotate-90" : ""}`}
            />
          )}
          Past Observations
          {hasObs && (
            <span className="text-xs font-normal text-muted-foreground">
              ({observations.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {hasObs && open ? (
        <CardContent>
          <div className="space-y-4">
            {observations.map((obs) => (
              <ObservationRow key={obs.id} obs={obs} />
            ))}
          </div>
        </CardContent>
      ) : (
        !hasObs && (
          <CardContent>
            <p className="text-xs text-muted-foreground">
              No past observations.
            </p>
          </CardContent>
        )
      )}
    </Card>
  );
}
