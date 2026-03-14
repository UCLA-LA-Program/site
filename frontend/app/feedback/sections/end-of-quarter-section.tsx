"use client";

import type { FeedbackFormValues } from "../schema";
import { END_OF_QUARTER_QUESTIONS } from "../constants";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm, defaultValues, feedbackFormSchema } from "../form";

const EQ_FIELD_MAP: Record<string, keyof FeedbackFormValues> = {
  approachability: "eqApproachability",
  helpfulness: "eqHelpfulness",
  familiarity: "eqFamiliarity",
  engagement: "eqEngagement",
  questioning: "eqQuestioning",
  supportiveness: "eqSupportiveness",
  "name-use": "eqNameUse",
  "belonging-stem": "eqBelongingStem",
  "group-belonging": "eqGroupBelonging",
  "group-reliance": "eqGroupReliance",
};

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
          fieldName={EQ_FIELD_MAP[value]}
          label={label}
          options={options}
        />
      ))}
      <TextareaFormField
        form={form}
        fieldName="eqComments"
        label="Are there any final comments you'd like to share with your LA now that the quarter is coming to an end?"
        required
      />
    </FieldGroup>
  ),
});
