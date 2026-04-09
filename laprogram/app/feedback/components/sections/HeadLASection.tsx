"use client";

import type { FeedbackFormValues } from "../../schema";
import { FieldGroup } from "@/components/ui/field";
import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";
import {
  LA_PED_NONSENSITIVE_QUESTIONS,
  LA_LCC_NONSENSITIVE_QUESTIONS,
  LA_HEAD_NONSENSITIVE_TEXT_FIELDS,
} from "../../questions/head_la";

export const HeadLASection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <form.Subscribe selector={(state) => state.values.la_head_type}>
        {(la_head_type) => (
          <>
            {(la_head_type === "ped_head" || la_head_type === "ped_lcc") &&
              LA_PED_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
                <LikertField
                  key={value}
                  form={form}
                  fieldName={value as keyof FeedbackFormValues}
                  label={label}
                  options={options!}
                />
              ))}
            {(la_head_type === "lcc" || la_head_type === "ped_lcc") &&
              LA_LCC_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
                <LikertField
                  key={value}
                  form={form}
                  fieldName={value as keyof FeedbackFormValues}
                  label={label}
                  options={options!}
                />
              ))}
          </>
        )}
      </form.Subscribe>

      {LA_HEAD_NONSENSITIVE_TEXT_FIELDS.map(({ value, label, required }) => (
        <TextareaFormField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          required={required}
        />
      ))}
    </FieldGroup>
  ),
});
