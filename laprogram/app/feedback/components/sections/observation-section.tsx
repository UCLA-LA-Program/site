"use client";

import type { FeedbackFormValues } from "../../schema";
import {
  OBSERVATION_OPTIONS,
  OBSERVATION_QUESTIONS,
  OBSERVATION_ROUND_OPTIONS,
  LA_POSITION_OPTIONS,
} from "../../constants";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LikertField } from "../fields/likert-field";
import { TextareaFormField } from "../fields/textarea-form-field";
import { withForm, defaultValues, feedbackFormSchema } from "../../form";

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
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {/* Likert questions */}
      {OBSERVATION_QUESTIONS.map(({ value, label }) => (
        <LikertField
          key={value}
          form={form}
          fieldName={value as keyof FeedbackFormValues}
          label={label}
          options={OBSERVATION_OPTIONS}
        />
      ))}

      {/* Strengths */}
      <TextareaFormField
        form={form}
        fieldName="obs_strengths"
        label="What are the LA's strengths at the moment?"
        description="Please give specific examples, if possible."
        required
      />

      {/* Improve */}
      <TextareaFormField
        form={form}
        fieldName="obs_improve"
        label="What can the LA improve at the moment?"
        description="Please give specific examples, if possible."
        required
      />

      {/* Pedagogy techniques */}
      <TextareaFormField
        form={form}
        fieldName="obs_pedagogy_techniques"
        label="Did you notice your peer implementing pedagogy techniques in a way similar to you, different from you, and/or in a way you want to try?"
        description={
          <>
            You may fill this out <strong>once</strong>, not for every LA you
            observe. Your response to this question is not sent to LAs and can
            be used to complete your final project.
          </>
        }
      />

      {/* Additional comments */}
      <TextareaFormField
        form={form}
        fieldName="obs_comments"
        label="Additional Comments"
        description="Feel free to elaborate on anything indicated above or to explain something not yet mentioned."
      />
    </FieldGroup>
  ),
});
