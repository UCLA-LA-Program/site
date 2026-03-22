"use client";

import type { FeedbackFormValues } from "../../schema";
import { AGREEMENT_OPTIONS, TA_QUESTIONS, TA_TEXT_FIELDS } from "../../constants";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const TASection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      {TA_QUESTIONS.map(({ value, label }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={AGREEMENT_OPTIONS}
        />
      ))}
      {TA_TEXT_FIELDS.map(({ value, label }) => (
        <TextareaFormField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          required={value === "ta_strengths" || value === "ta_improve"}
        />
      ))}
    </FieldGroup>
  ),
});
