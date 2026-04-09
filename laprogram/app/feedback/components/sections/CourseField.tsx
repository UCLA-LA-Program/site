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
import type { LA } from "@/types/db";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const CourseField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    las: LA[];
  },
  render: ({ form, las }) => (
    <form.Field
      name="course"
      listeners={{
        onChange: () => {
          form.setFieldValue("la", "");
        },
      }}
    >
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>
              Course of LA being given feedback{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Combobox
              autoHighlight
              onValueChange={(v) => field.handleChange(v as string)}
              value={field.state.value}
              items={[...new Set(las.map((la) => la.course))].sort()}
            >
              <ComboboxInput
                id={field.name}
                placeholder="Select a course"
                aria-invalid={isInvalid}
              />
              <ComboboxContent>
                <ComboboxEmpty>No option found.</ComboboxEmpty>
                <ComboboxList>
                  {(c) => (
                    <ComboboxItem key={c} value={c}>
                      {c}
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
