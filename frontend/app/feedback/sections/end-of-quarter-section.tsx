"use client";

import type { FeedbackFormValues } from "../schema";
import { END_OF_QUARTER_QUESTIONS } from "../constants";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm, defaultValues, feedbackFormSchema } from "../form";

export const EndOfQuarterSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
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
