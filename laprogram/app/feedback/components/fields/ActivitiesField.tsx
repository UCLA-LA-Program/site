"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import { ACTIVITY_OPTIONS } from "../../questions/options";

export const ActivitiesField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <form.Field name="activities">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel>
              Which LA-supported activities have you attended for this course?{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldDescription>Check all that apply.</FieldDescription>
            <FieldGroup className="gap-2.5">
              {ACTIVITY_OPTIONS.map(({ value, label }) => (
                <Field key={value} orientation="horizontal">
                  <Checkbox
                    id={value}
                    checked={field.state.value.includes(value)}
                    onCheckedChange={(checked) => {
                      const current = field.state.value;
                      field.handleChange(
                        checked
                          ? [...current, value]
                          : current.filter((v) => v !== value),
                      );
                    }}
                    aria-invalid={isInvalid}
                  />
                  <FieldLabel htmlFor={value}>{label}</FieldLabel>
                </Field>
              ))}
            </FieldGroup>
          </Field>
        );
      }}
    </form.Field>
  ),
});
