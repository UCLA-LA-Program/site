"use client";

import type { ReactNode } from "react";
import type { FeedbackFormInstance, FeedbackFormValues } from "../schema";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type Props = {
  form: FeedbackFormInstance;
  fieldName: keyof FeedbackFormValues;
  label: ReactNode;
  required?: boolean;
  description?: ReactNode;
  rows?: number;
};

export function TextareaFormField({
  form,
  fieldName,
  label,
  required,
  description,
  rows = 3,
}: Props) {
  return (
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
              value={field.state.value as string}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => field.handleChange(e.target.value as any)}
              onBlur={field.handleBlur}
              aria-invalid={isInvalid || undefined}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
