"use client";

import type { FeedbackFormValues } from "../schema";
import {
  AGREEMENT_OPTIONS,
  LA_HEAD_TYPE_OPTIONS,
  LA_LCC_QUESTIONS,
  LA_PED_QUESTIONS,
} from "../constants";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { withForm, defaultValues, feedbackFormSchema } from "../form";

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
              <FieldDescription>
                Please select both options if the Head LA serves as both an LCC
                and a Ped Head for your course.
              </FieldDescription>
              <FieldGroup className="gap-2.5">
                {LA_HEAD_TYPE_OPTIONS.map(({ value, label }) => (
                  <Field key={value} orientation="horizontal">
                    <Checkbox
                      id={value}
                      checked={field.state.value.includes(value)}
                      onCheckedChange={(checked) => {
                        const current = field.state.value;
                        field.handleChange(
                          checked
                            ? [...current, value]
                            : current.filter((v) => v !== value),
                        );
                      }}
                      aria-invalid={isInvalid}
                    />
                    <FieldLabel htmlFor={value}>{label}</FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.la_head_type}>
        {(la_head_type) => (
          <>
            {la_head_type.includes("ped_head") &&
              LA_PED_QUESTIONS.map(({ value, label }) => (
                <LikertField
                  key={value}
                  form={form}
                  fieldName={value as keyof FeedbackFormValues}
                  label={label}
                  options={AGREEMENT_OPTIONS}
                />
              ))}
            {la_head_type.includes("lcc") &&
              LA_LCC_QUESTIONS.map(({ value, label }) => (
                <LikertField
                  key={value}
                  form={form}
                  fieldName={value as keyof FeedbackFormValues}
                  label={label}
                  options={AGREEMENT_OPTIONS}
                />
              ))}
          </>
        )}
      </form.Subscribe>

      <TextareaFormField
        form={form}
        fieldName="la_strengths"
        label="What are some of your Head LA's strengths?"
        required
      />
      <TextareaFormField
        form={form}
        fieldName="la_improve"
        label="What can your Head LA improve upon or do differently to better support you?"
        required
      />
    </FieldGroup>
  ),
});
