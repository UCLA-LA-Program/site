"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const LAFeedbackTypeField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    laFeedbackTypeOptions: { value: string; label: string }[];
  },
  render: ({ form, laFeedbackTypeOptions }) => (
    <form.Field
      name="feedback_type"
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
              What kind of feedback are you providing?{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <RadioGroup
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
            >
              {laFeedbackTypeOptions.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem
                    id={`type-${value}`}
                    value={value}
                    aria-invalid={isInvalid}
                    type="button"
                  />
                  <Label
                    htmlFor={`type-${value}`}
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
