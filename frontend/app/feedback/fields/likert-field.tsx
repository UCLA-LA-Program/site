"use client";

import type { FeedbackFormValues } from "../schema";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useFormContext } from "../form";

type Props = {
  fieldName: keyof FeedbackFormValues;
  label: string;
  options: string[];
};

export function LikertField({ fieldName, label, options }: Props) {
  const form = useFormContext();
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
                  ? (field.state.value as string[])[0]
                  : (field.state.value as string)
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
