"use client";

import type { ReactNode } from "react";
import type { FeedbackFormValues } from "../../schema";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { withForm, defaultValues, feedbackFormSchema } from "../../form";

export const TextareaFormField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    fieldName: keyof FeedbackFormValues;
    label: ReactNode;
    required?: boolean;
    description?: ReactNode;
    rows?: number;
  },
  render: ({ form, fieldName, label, required, description, rows = 3 }) => (
    <form.Field name={fieldName}>
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>
              {label}
              {required && (
                <>
                  {" "}
                  <span className="text-destructive">*</span>
                </>
              )}
            </FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <Textarea
              id={field.name}
              rows={rows}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={isInvalid || undefined}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  ),
});
