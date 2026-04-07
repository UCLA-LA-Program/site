"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import type { MyObservation } from "../types";
import { ObservationRow } from "./ObservationRow";
import { OBSERVATION_CHANGE_DAYS_LIMIT } from "@/lib/constants";

export function FutureObservationsCard({
  futureObservations,
  upcomingObservations,
  onRemove,
}: {
  futureObservations: MyObservation[];
  upcomingObservations: MyObservation[];
  onRemove: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Upcoming Observations
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            next {OBSERVATION_CHANGE_DAYS_LIMIT} days, not reschedulable
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UpcomingObservations observations={upcomingObservations} />
      </CardContent>
      <CardHeader>
        <CardTitle>Confirmed Observations</CardTitle>
      </CardHeader>
      <CardContent>
        <ConfirmedObservations
          observations={futureObservations}
          onRemove={onRemove}
        />
      </CardContent>
    </Card>
  );
}

function ConfirmedObservations({
  observations,
  onRemove,
}: {
  observations: MyObservation[];
  onRemove: (id: string) => void;
}) {
  return observations.length === 0 ? (
    <p className="text-xs text-muted-foreground">
      No other confirmed observations yet.
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
  );
}

function UpcomingObservations({
  observations,
}: {
  observations: MyObservation[];
}) {
  return observations.length === 0 ? (
    <p className="text-xs text-muted-foreground">
      No upcoming observations within {OBSERVATION_CHANGE_DAYS_LIMIT} days.
    </p>
  ) : (
    <div className="space-y-4">
      {observations.map((obs) => (
        <ObservationRow key={obs.id} obs={obs} />
      ))}
    </div>
  );
}

export function PastObservations({
  observations,
}: {
  observations: MyObservation[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader
        className={"cursor-pointer"}
        onClick={() => setOpen((o) => !o)}
      >
        <CardTitle className="flex items-center gap-1.5">
          <ChevronRight
            className={`size-4 transition-transform ${open ? "rotate-90" : ""}`}
          />
          Past Observations
          <span className="text-xs font-normal text-muted-foreground">
            ({observations.length})
          </span>
        </CardTitle>
      </CardHeader>
      {open &&
        (observations.length > 0 ? (
          <CardContent>
            <div className="space-y-4">
              {observations.map((obs) => (
                <ObservationRow key={obs.id} obs={obs} />
              ))}
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-xs text-muted-foreground">
              No past observations yet.
            </p>
          </CardContent>
        ))}
    </Card>
  );
}
