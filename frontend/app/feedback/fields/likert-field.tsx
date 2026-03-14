"use client";

import type { FeedbackFormValues } from "../schema";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { withForm, defaultValues, feedbackFormSchema } from "../form";

export const LikertField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    fieldName: keyof FeedbackFormValues;
    label: string;
    options: string[];
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
              value={field.state.value as string}
              onValueChange={(value) => {
                field.handleChange(value ?? "");
                field.handleBlur();
              }}
            >
              {options.map((opt) => (
                <ToggleGroupItem
                  key={opt}
                  value={opt}
                  className="h-auto flex-1 whitespace-normal py-2 text-xs"
                >
                  {opt}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  ),
});
