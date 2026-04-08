"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const StudentFeedbackTypeField = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  props: {} as {
    feedbackTypeOptions: { value: string; label: string }[];
  },
  render: ({ form, feedbackTypeOptions }) => (
    <form.Field name="feedback_type">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel>
              What kind of feedback are you providing?{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldDescription>
              Students provide LAs with feedback in the middle of the quarter
              (Weeks 5–6) and at the end of the quarter (Weeks 9–10).
            </FieldDescription>
            <RadioGroup
              value={field.state.value}
              onValueChange={(v) => {
                field.handleChange(v);
              }}
              onBlur={field.handleBlur}
            >
              {feedbackTypeOptions.map(({ value, label }) => (
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
