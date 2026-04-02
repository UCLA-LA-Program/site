"use client";

import type { FeedbackFormValues } from "../../schema";
import { ActivitiesField } from "../fields/ActivitiesField";
import { HoursField } from "../fields/HoursField";
import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import {
  MQ_NONSENSITIVE_QUESTIONS,
  MQ_NONSENSITIVE_TEXT_FIELDS,
  MQ_SENSITIVE_TEXT_FIELDS,
} from "../../questions/mid_quarter";

export const MidQuarterSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <ActivitiesField form={form} />
      <HoursField form={form} />
      {MQ_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options!}
        />
      ))}
      {[...MQ_NONSENSITIVE_TEXT_FIELDS, ...MQ_SENSITIVE_TEXT_FIELDS].map(
        ({ value, label, required }) => (
          <TextareaFormField
            key={value}
            form={form}
            fieldName={value as keyof FeedbackFormValues}
            label={label}
            required={required}
          />
        ),
      )}
    </FieldGroup>
  ),
});
