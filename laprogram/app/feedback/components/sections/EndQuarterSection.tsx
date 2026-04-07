"use client";

import type { FeedbackFormValues } from "../../schema";

import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import { ActivitiesField } from "../fields/ActivitiesField";
import { HoursField } from "../fields/HoursField";
import {
  EQ_NONSENSITIVE_QUESTIONS,
  EQ_SENSITIVE_QUESTIONS,
  EQ_NONSENSITIVE_TEXT_FIELDS,
} from "../../questions/end_quarter";

export const EndQuarterSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <ActivitiesField form={form} />
      <HoursField form={form} />
      {EQ_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options!}
        />
      ))}
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
