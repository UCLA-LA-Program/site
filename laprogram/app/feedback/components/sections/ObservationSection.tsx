"use client";

import type { FeedbackFormValues } from "../../schema";
import {
  OBSERVATION_NONSENSITIVE_QUESTIONS,
  OBSERVATION_ROUND_OPTIONS,
  LA_POSITION_OPTIONS,
  OBS_NONSENSITIVE_TEXT_FIELDS,
  OBS_SENSITIVE_TEXT_FIELDS,
} from "../../constants";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LikertField } from "../fields/LikertField";
import { TextareaFormField } from "../fields/TextareaFormField";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const ObservationSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => (
    <FieldGroup>
      {/* Round of Observation */}
      <form.Field name="obs_round">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                Round of Observation <span className="text-destructive">*</span>
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
              >
                <FieldGroup className="gap-2.5">
                  {OBSERVATION_ROUND_OPTIONS.map(({ value, label }) => (
                    <Field key={value} orientation="horizontal">
                      <RadioGroupItem value={value} id={`round-${value}`} />
                      <FieldLabel htmlFor={`round-${value}`}>
                        {label}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </RadioGroup>
            </Field>
          );
        }}
      </form.Field>

      {/* Observed Section */}
      <form.Field name="obs_section">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Observed Section <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>
                Please list the section you observed (e.g., &ldquo;1A&rdquo;)
                and the 30-minute timeframe of your observation (e.g.,
                &ldquo;1:20-1:50pm&rdquo;). Recall that we ask you to observe
                for at least half-an-hour so that you may witness as many LA
                practices as possible.
              </FieldDescription>
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
            </Field>
          );
        }}
      </form.Field>

      {/* LA Position */}
      <form.Field name="obs_la_position">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                LA Position <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>
                Position of the LA you&apos;re observing, <em>not</em> your own
                position!
              </FieldDescription>
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
              >
                <FieldGroup className="gap-2.5">
                  {LA_POSITION_OPTIONS.map(({ value, label }) => (
                    <Field key={value} orientation="horizontal">
                      <RadioGroupItem value={value} id={`position-${value}`} />
                      <FieldLabel htmlFor={`position-${value}`}>
                        {label}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </RadioGroup>
            </Field>
          );
        }}
      </form.Field>

      {/* Likert questions */}
      {OBSERVATION_NONSENSITIVE_QUESTIONS.map(({ value, label, options }) => (
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
          />
        ),
      )}
    </FieldGroup>
  ),
});
