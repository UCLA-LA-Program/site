"use client";

import useSWRImmutable from "swr/immutable";
import { ContactUs } from "@/components/ContactUs";
import { fetcher } from "@/lib/utils";
import { Section } from "@/types/db";
import { ScheduleCard } from "./ScheduleCard";

export function Schedule({ currentWeek }: { currentWeek: number }) {
  const { data: sections } = useSWRImmutable<Section[]>(
    "/api/sections",
    fetcher,
  );

  if (!sections) {
    return <></>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10 animate-fade-up">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Schedule Observations</h1>
          <p className="mb-2 text-sm">Instructions:</p>
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              Check/uncheck your availability per week and edit your available
              timeslot per section using the slider. Any changes will apply to
              all future weeks. You can edit in 10 minute increments with a
              required minimum of 30 minutes.
            </li>
            <li>Press &ldquo;Save Changes&rdquo; to save your availability.</li>
          </ul>
          <p className="mb-2 text-sm">Notes:</p>
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              You will be unable to change your available timeslot if anyone has
              signed up to observe you for the present week or a future week.
            </li>
            <li>
              You will be unable to check/uncheck future weeks if anyone has
              signed up to observe that week.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            If you run into any issues, please refer to the syllabus and/or{" "}
            <ContactUs /> for technical problems.
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You have no section assignments. If this is an error, please{" "}
          <ContactUs />.
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <ScheduleCard
              section={section}
              currentWeek={currentWeek}
              key={section.section_id}
            ></ScheduleCard>
          ))}
        </div>
      )}
    </div>
  );
}
