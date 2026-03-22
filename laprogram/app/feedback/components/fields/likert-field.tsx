"use client";

import type { FeedbackFormValues } from "../../schema";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const LikertField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    fieldName: keyof FeedbackFormValues;
    label: string;
    options: { value: string; label: string }[];
  },
  render: ({ form, fieldName, label, options }) => (
    <form.Field name={fieldName}>
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel>
              {label} <span className="text-destructive">*</span>
            </FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              className="w-full items-stretch"
              value={
                typeof field.state.value === "object"
                  ? field.state.value[0]
                  : field.state.value
              }
              onValueChange={(value) => {
                field.handleChange(value ?? "");
                field.handleBlur();
              }}
            >
              {options.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="h-auto flex-1 whitespace-normal py-2 text-xs"
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        );
      }}
    </form.Field>
  ),
});
