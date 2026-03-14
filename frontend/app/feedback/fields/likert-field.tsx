"use client";

import type { FeedbackFormInstance, FeedbackFormValues } from "../schema";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type Props = {
  form: FeedbackFormInstance;
  fieldName: keyof FeedbackFormValues;
  label: string;
  options: string[];
};

export function LikertField({ form, fieldName, label, options }: Props) {
  return (
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
  );
}
