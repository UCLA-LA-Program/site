"use client";

import type { FeedbackFormValues } from "../schema";
import { AGREEMENT_OPTIONS, MID_QUARTER_QUESTIONS } from "../constants";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm, defaultValues, feedbackFormSchema } from "../form";

const MQ_FIELD_MAP: Record<string, keyof FeedbackFormValues> = {
  "mq-approachable": "mqApproachable",
  "mq-helpful": "mqHelpful",
  "mq-familiar": "mqFamiliar",
  "mq-engagement": "mqEngagement",
  "mq-questioning": "mqQuestioning",
  "mq-supportive": "mqSupportive",
  "mq-name": "mqName",
  "mq-belonging": "mqBelonging",
  "mq-checkin": "mqCheckin",
  "mq-small-groups": "mqSmallGroups",
};

export const MidQuarterSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <ActivitiesField form={form} />
      <HoursField form={form} />
      {MID_QUARTER_QUESTIONS.map(({ id, label }) => (
        <LikertField
          key={id}
          form={form}
          fieldName={MQ_FIELD_MAP[id]}
          label={label}
          options={AGREEMENT_OPTIONS}
        />
      ))}
      <TextareaFormField
        form={form}
        fieldName="mqStrengths"
        label="What are your LA's strengths?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="mqImprove"
        label="How can your LA improve to help you learn more?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="mqCourseChange"
        label="What would you change about this course to improve how LAs help you learn?"
        description="For example, what would help you be more comfortable participating in discussion/lab sections?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="mqStudyHabits"
        label="Is there anything you want to change about your own learning or study habits to improve your learning in this course?"
        description="This is helpful for you to think about, and LAs can help you make a plan to adjust your approach to learning."
      />
    </FieldGroup>
  ),
});
