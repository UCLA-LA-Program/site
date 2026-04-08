"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const RoleField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    roleOptions: { value: string; label: string }[];
  },
  render: ({ form, roleOptions }) => (
    <form.Field
      name="role"
      listeners={{
        onChange: () => {
          form.setFieldValue("course", "");
          form.setFieldValue("la", "");
        },
      }}
    >
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel>
              I am&hellip; <span className="text-destructive">*</span>
            </FieldLabel>
            <RadioGroup
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            >
              {roleOptions.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem
                    id={`role-${value}`}
                    value={value}
                    aria-invalid={isInvalid}
                  />
                  <Label
                    htmlFor={`role-${value}`}
                    className="cursor-pointer font-normal"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Field>
        );
      }}
    </form.Field>
  ),
});
