"use client";

import type { FeedbackFormValues } from "../schema";
import { END_OF_QUARTER_QUESTIONS } from "../constants";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";


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

export function EndOfQuarterSection() {
  return (
    <FieldGroup>
      <ActivitiesField />
      <HoursField />
      {END_OF_QUARTER_QUESTIONS.map(({ id, label, options }) => (
        <LikertField
          key={id}
          fieldName={EQ_FIELD_MAP[id]}
          label={label}
          options={options}
        />
      ))}
      <TextareaFormField
        fieldName="eqComments"
        label="Are there any final comments you'd like to share with your LA now that the quarter is coming to an end?"
        required
      />
    </FieldGroup>
  );
}
