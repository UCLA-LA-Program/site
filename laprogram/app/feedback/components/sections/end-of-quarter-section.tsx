"use client";

import type { FeedbackFormValues } from "../../schema";
import { END_OF_QUARTER_QUESTIONS } from "../../constants";
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
      {END_OF_QUARTER_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options}
        />
      ))}
      <TextareaFormField
        form={form}
        fieldName="eq_comments"
        label="Are there any final comments you'd like to share with your LA now that the quarter is coming to an end?"
        required
      />
    </FieldGroup>
  ),
});
