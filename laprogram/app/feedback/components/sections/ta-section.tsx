"use client";

import type { FeedbackFormValues } from "../../schema";
import { AGREEMENT_OPTIONS, TA_QUESTIONS } from "../../constants";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const TASection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      {TA_QUESTIONS.map(({ value, label }) => (
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
        fieldName="ta_strengths"
        label="What are the LA's strengths currently?"
        description='For example, you can write: "_____ is especially great at supportively encouraging everyone in the group to participate."'
        required
      />
      <TextareaFormField
        form={form}
        fieldName="ta_improve"
        label="What can the LA improve currently?"
        description={
          <>
            For example, you can write: &ldquo;Sometimes, _____ doesn&apos;t
            seem as comfortable with the material, which makes it hard for them
            to support student learning. I encourage them to ask me during
            section if they&apos;re feeling uncertain about anything!&rdquo;
            <br />
            <br />
            <em>
              The LA will see your raw feedback, so please phrase this carefully
              and constructively!
            </em>
          </>
        }
        required
      />
      <TextareaFormField
        form={form}
        fieldName="ta_comments"
        label="Any additional comments?"
      />
    </FieldGroup>
  ),
});
