"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { IMAGE_SIZE, LA_POSITION_MAP } from "@/lib/constants";
import type { LA } from "@/types/db";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const LAField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    las: LA[];
    course: string;
  },
  render: ({ form, las, course }) => (
    <form.Field name="la">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>
              Please select the name of the LA you are providing feedback to{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Combobox
              autoHighlight
              onValueChange={(v) => field.handleChange(v as string)}
              value={field.state.value}
              items={[
                ...las
                  .filter((la) => la.course === course)
                  .sort((a, b) => a.name.localeCompare(b.name)),
              ]}
            >
              <ComboboxInput
                id={field.name}
                placeholder="Select an LA"
                aria-invalid={isInvalid}
              />
              <ComboboxContent>
                <ComboboxEmpty>No option found.</ComboboxEmpty>
                <ComboboxList>
                  {(la: LA) => (
                    <ComboboxItem key={la.name} value={la.name}>
                      {la.image ? (
                        <Image
                          src={la.image}
                          alt={la.name}
                          width={IMAGE_SIZE}
                          height={IMAGE_SIZE}
                          className="h-24 w-24 rounded-sm"
                        />
                      ) : (
                        <UserRound
                          className="size-24 rounded-sm"
                          strokeWidth={1}
                        />
                      )}
                      <div className="flex flex-col pl-3">
                        <span className="text-sm">{la.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {LA_POSITION_MAP.get(la.position) ?? la.position}
                        </span>
                      </div>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        );
      }}
    </form.Field>
  ),
});
