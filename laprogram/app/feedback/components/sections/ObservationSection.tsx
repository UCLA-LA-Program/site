"use client";

import type { FeedbackFormValues } from "../../schema";
import { FieldGroup } from "@/components/ui/field";
import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import {
  OBS_NONSENSITIVE_QUESTIONS,
  OBS_NONSENSITIVE_TEXT_FIELDS,
  OBS_SENSITIVE_TEXT_FIELDS,
} from "../../questions/observation";

export const ObservationSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      {/* Likert questions */}
      {OBS_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options!}
        />
      ))}

      {[...OBS_NONSENSITIVE_TEXT_FIELDS, ...OBS_SENSITIVE_TEXT_FIELDS].map(
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
