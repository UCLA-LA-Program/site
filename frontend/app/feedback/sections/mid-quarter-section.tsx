"use client";

import type { FeedbackFormValues } from "../schema";
import { AGREEMENT_OPTIONS, MID_QUARTER_QUESTIONS } from "../constants";
import { ActivitiesField } from "../fields/activities-field";
import { HoursField } from "../fields/hours-field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm, defaultValues, feedbackFormSchema } from "../form";

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
      <TextareaFormField
        form={form}
        fieldName="mq_strengths"
        label="What are your LA's strengths?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="mq_improve"
        label="How can your LA improve to help you learn more?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="mq_course_change"
        label="What would you change about this course to improve how LAs help you learn?"
        description="For example, what would help you be more comfortable participating in discussion/lab sections?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="mq_study_habits"
        label="Is there anything you want to change about your own learning or study habits to improve your learning in this course?"
        description="This is helpful for you to think about, and LAs can help you make a plan to adjust your approach to learning."
      />
    </FieldGroup>
  ),
});
