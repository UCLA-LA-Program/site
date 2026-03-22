"use client";

import type { FeedbackFormValues } from "../../schema";
import { AGREEMENT_OPTIONS, MID_QUARTER_QUESTIONS, MQ_TEXT_FIELDS, MQ_SENSITIVE_TEXT_FIELDS } from "../../constants";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const MidQuarterSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <ActivitiesField form={form} />
      <HoursField form={form} />
      {MID_QUARTER_QUESTIONS.map(({ value, label }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={AGREEMENT_OPTIONS}
        />
      ))}
      {MQ_TEXT_FIELDS.map(({ value, label }) => (
        <TextareaFormField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          required
        />
      ))}
      {MQ_SENSITIVE_TEXT_FIELDS.map(({ value, label }) => (
        <TextareaFormField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          required={value === "mq_course_change"}
        />
      ))}
    </FieldGroup>
  ),
});
