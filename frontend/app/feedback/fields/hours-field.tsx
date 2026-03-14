"use client";

import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useFormContext } from "../form";

export function HoursField() {
  const form = useFormContext();
  return (
    <form.Field name="hours">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>
              Approximately how many hours per week do you spend in LA-supported
              activities for this course?{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldDescription>
              If you attend a 2-hour discussion section each week, put 2. If you
              don&apos;t attend an LA-supported section, put 0. If you attend a
              1-hour discussion section AND an LA-supported office hour every
              2–3 weeks, put 1.5.
            </FieldDescription>
            <Input
              id={field.name}
              type="number"
              min="0"
              step="0.5"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={isInvalid}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
