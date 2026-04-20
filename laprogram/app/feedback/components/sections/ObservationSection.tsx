"use client";

import type { ReactNode } from "react";
import type { FeedbackFormValues } from "../../schema";
import { FieldGroup } from "@/components/ui/field";
import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import {
  OBS_NONSENSITIVE_QUESTIONS,
  OBS_NONSENSITIVE_TEXT_FIELDS,
  OBS_SENSITIVE_TEXT_FIELDS,
} from "../../questions/observation";

const OBS_TEXT_DESCRIPTIONS: Record<string, ReactNode> = {
  obs_strengths: "Please give specific examples, if possible.",
  obs_improve: "Please give specific examples, if possible.",
  obs_pedagogy_techniques: `You may fill this out once, not for every LA you observe. Your response to
      this question is not sent to LAs and can be used to complete your final
      project.`,
  obs_comments:
    "Feel free to elaborate on anything indicated above or to explain something not yet mentioned.",
};

export const ObservationSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      {/* Likert questions */}
      {OBS_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={options!}
        />
      ))}

      {[...OBS_NONSENSITIVE_TEXT_FIELDS, ...OBS_SENSITIVE_TEXT_FIELDS].map(
        ({ value, label, required }) => (
          <TextareaFormField
            key={value}
            form={form}
            fieldName={value as keyof FeedbackFormValues}
            label={label}
            required={required}
            description={OBS_TEXT_DESCRIPTIONS[value]}
          />
        ),
      )}
    </FieldGroup>
  ),
});
