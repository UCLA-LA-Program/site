"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel } from "@/components/ui/field";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { IMAGE_SIZE, LA_POSITION_MAP } from "@/lib/constants";
import type { LA, Position } from "@/types/db";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const HeadLAPicker = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    las: LA[];
    myPositions: Position[];
  },
  render: function Render({ form, las, myPositions }) {
    const myCourses = myPositions.map((p) => p.course_name);
    const headLAs = las
      .filter(
        (la) =>
          myCourses.includes(la.course) &&
          (la.position.includes("ped") || la.position.includes("lcc")),
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <Field>
        <FieldLabel>
          Select the Head LA you are providing feedback to{" "}
          <span className="text-destructive">*</span>
        </FieldLabel>
        {headLAs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Head LAs found for your courses.
          </p>
        ) : (
          <RadioGroup
            value={form.getFieldValue("la")}
            onValueChange={(v) => {
              const la = headLAs.find((h) => h.name === v);
              if (la) {
                form.setFieldValue("course", la.course);
                form.setFieldValue("la", la.name);
                const headType =
                  la.position.includes("ped") && la.position.includes("lcc")
                    ? "ped_lcc"
                    : la.position.includes("ped")
                      ? "ped_head"
                      : "lcc";
                form.setFieldValue("la_head_type", headType);
              }
            }}
          >
            <div className="space-y-2">
              {headLAs.map((la) => (
                <label
                  key={`${la.name}|${la.course}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 has-checked:border-primary has-checked:bg-primary/5"
                >
                  <RadioGroupItem value={la.name} type="button" />
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="size-20 shrink-0 overflow-hidden rounded-sm border bg-muted">
                      {la.image ? (
                        <Image
                          src={la.image}
                          alt={la.name}
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
                      <p className="font-medium">{la.name}</p>
                      <p className="text-muted-foreground">
                        {LA_POSITION_MAP.get(la.position) ?? la.position}{" "}
                        &middot; {la.course}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        )}
      </Field>
    );
  },
});
