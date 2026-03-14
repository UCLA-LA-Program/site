"use client";

import type { FeedbackFormInstance, FeedbackFormValues } from "../schema";
import { END_OF_QUARTER_QUESTIONS } from "../constants";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";

type Props = {
  form: FeedbackFormInstance;
};

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

export function EndOfQuarterSection({ form }: Props) {
  return (
    <FieldGroup>
      <ActivitiesField form={form} />
      <HoursField form={form} />
      {END_OF_QUARTER_QUESTIONS.map(({ id, label, options }) => (
        <LikertField
          key={id}
          form={form}
          fieldName={EQ_FIELD_MAP[id]}
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
  );
}
