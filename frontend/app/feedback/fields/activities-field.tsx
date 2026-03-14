"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { ACTIVITIES } from "../constants";
import { useFormContext } from "../form";

export function ActivitiesField() {
  const form = useFormContext();
  return (
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
            <div className="flex flex-col gap-2.5">
              {ACTIVITIES.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={field.state.value.includes(id)}
                    onCheckedChange={(checked) => {
                      const current = field.state.value;
                      field.handleChange(
                        checked
                          ? [...current, id]
                          : current.filter((v) => v !== id),
                      );
                    }}
                    aria-invalid={isInvalid}
                  />
                  <Label htmlFor={id} className="cursor-pointer font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
