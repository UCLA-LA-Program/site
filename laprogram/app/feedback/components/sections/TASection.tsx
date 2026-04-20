"use client";

import type { ReactNode } from "react";
import type { FeedbackFormValues } from "../../schema";
import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { FieldGroup } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import {
  TA_NONSENSITIVE_QUESTIONS,
  TA_NONSENSITIVE_TEXT_FIELDS,
} from "../../questions/ta";

const TA_TEXT_DESCRIPTIONS: Record<string, ReactNode> = {
  ta_strengths:
    'For example, you can write: "______ is especially great at supportively encouraging everyone in the group to participate".',
  ta_improve: `For example, you can write: "Sometimes, ______ doesn't seem as comfortable with the material, which makes it hard for them to support student learning. I encourage them to ask me during section if they're feeling uncertain about anything!"
        The LA will see your raw feedback, so please phrase this carefully and
        constructively!`,
};

export const TASection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      {TA_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options!}
        />
      ))}
      {TA_NONSENSITIVE_TEXT_FIELDS.map(({ value, label, required }) => (
        <TextareaFormField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          required={required}
          description={TA_TEXT_DESCRIPTIONS[value]}
        />
      ))}
    </FieldGroup>
  ),
});
