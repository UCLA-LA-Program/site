"use client";

import type { FeedbackFormValues } from "../../schema";
import {
  END_OF_QUARTER_NONSENSITIVE_QUESTIONS,
  EQ_SENSITIVE_QUESTIONS,
  EQ_NONSENSITIVE_TEXT_FIELDS,
} from "../../constants";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";

export const EndOfQuarterSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <ActivitiesField form={form} />
      <HoursField form={form} />
      {END_OF_QUARTER_NONSENSITIVE_QUESTIONS.map(
        ({ value, label, options }) => (
          <LikertField
            key={value}
            form={form}
            fieldName={value as keyof FeedbackFormValues}
            label={label}
            options={options!}
          />
        ),
      )}
      {EQ_SENSITIVE_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options!}
        />
      ))}
      {EQ_NONSENSITIVE_TEXT_FIELDS.map(({ value, label, required }) => (
        <TextareaFormField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          required={required}
        />
      ))}
    </FieldGroup>
  ),
});
