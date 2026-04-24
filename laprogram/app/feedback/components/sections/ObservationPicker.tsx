"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel } from "@/components/ui/field";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { IMAGE_SIZE, LA_POSITION_MAP } from "@/lib/constants";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import { formatDateLA, MyObservation } from "@/app/observations/signup/types";

export const ObservationPicker = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    observations: MyObservation[];
  },
  render: ({ form, observations }) => (
    <Field>
      <FieldLabel>
        Select the observation you are providing feedback for{" "}
        <span className="text-destructive">*</span>
      </FieldLabel>
      {observations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You have no observations to give feedback for.
        </p>
      ) : (
        <RadioGroup
          value={form.getFieldValue("la")}
          onValueChange={(v) => {
            const obs = observations.find((o) => o.la_name === v);
            if (obs) {
              form.setFieldValue("course", obs.course_name);
              form.setFieldValue("la", obs.la_name);
              form.setFieldValue(
                "obs_section",
                `${obs.section_name} — ${formatDateLA(obs.time_start)}`,
              );
              form.setFieldValue("obs_la_position", obs.la_position);
            }
          }}
        >
          <div className="space-y-2">
            {observations
              .sort((a, b) => a.time_start.getTime() - b.time_start.getTime())
              .map((obs) => (
                <label
                  key={obs.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 has-checked:border-primary has-checked:bg-primary/5"
                >
                  <RadioGroupItem value={obs.la_name} type="button" />
                  <div className="flex min-w-0 items-center gap-3">
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
                      <p className="font-medium">{obs.la_name}</p>
                      <p className="text-muted-foreground">
                        {LA_POSITION_MAP.get(obs.la_position) ??
                          obs.la_position}{" "}
                        &middot; {obs.course_name} {obs.section_name} &middot;{" "}
                        {formatDateLA(obs.time_start)}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
          </div>
        </RadioGroup>
      )}
    </Field>
  ),
});
