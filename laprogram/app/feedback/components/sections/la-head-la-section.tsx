"use client";

import type { FeedbackFormValues } from "../../schema";
import {
  LA_HEAD_TYPE_OPTIONS,
  LA_LCC_QUESTIONS,
  LA_PED_QUESTIONS,
  LA_HEAD_TEXT_FIELDS,
} from "../../constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const LAHeadLASection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      <form.Field name="la_head_type">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                The Head LA I am providing feedback to is a(n)&hellip;{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
              >
                <FieldGroup className="gap-2.5">
                  {LA_HEAD_TYPE_OPTIONS.map(({ value, label }) => (
                    <Field key={value} orientation="horizontal">
                      <RadioGroupItem value={value} id={value} />
                      <FieldLabel htmlFor={value}>{label}</FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </RadioGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.la_head_type}>
        {(la_head_type) => (
          <>
            {(la_head_type === "ped_head" || la_head_type === "ped_lcc") &&
              LA_PED_QUESTIONS.map(({ value, label, options }) => (
                <LikertField
                  key={value}
                  form={form}
                  fieldName={value as keyof FeedbackFormValues}
                  label={label}
                  options={options!}
                />
              ))}
            {(la_head_type === "lcc" || la_head_type === "ped_lcc") &&
              LA_LCC_QUESTIONS.map(({ value, label, options }) => (
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

      {LA_HEAD_TEXT_FIELDS.map(({ value, label, required }) => (
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
