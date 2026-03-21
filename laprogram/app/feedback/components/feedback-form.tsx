"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { ClosingSection } from "./sections/closing-section";
import { EndOfQuarterSection } from "./sections/end-of-quarter-section";
import { MidQuarterSection } from "./sections/mid-quarter-section";
import { TASection } from "./sections/ta-section";
import { LAHeadLASection } from "./sections/la-head-la-section";
import { ObservationSection } from "./sections/observation-section";
import {
  COURSES,
  FEEDBACK_TYPE_OPTIONS,
  LA_FEEDBACK_TYPE_OPTIONS,
  LAS,
  ROLE_OPTIONS,
} from "../constants";
import { useAppForm, defaultValues, feedbackFormSchema } from "../form";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
} from "@/components/ui/combobox";

export function FeedbackForm() {
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: feedbackFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
    },
    onSubmitInvalid({ value }) {
      console.log("Form submitted invalid:", value);
    },
  });

  return (
    <form
      noValidate
      id="feedback-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      onReset={() => {
        form.reset();
      }}
    >
      <FieldGroup>
        {/* Name */}
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
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

        {/* Email */}
        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="openquestion@g.ucla.edu"
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

        {/* Role */}
        <form.Field name="role">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  I am&hellip; <span className="text-destructive">*</span>
                </FieldLabel>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v)}
                  onBlur={field.handleBlur}
                >
                  {ROLE_OPTIONS.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`role-${value}`}
                        value={value}
                        aria-invalid={isInvalid}
                      />
                      <Label
                        htmlFor={`role-${value}`}
                        className="cursor-pointer font-normal"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {/* Course */}
        <form.Field name="course">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Course of LA being given feedback{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Combobox
                  autoHighlight
                  onValueChange={(v) => field.handleChange(v as string)}
                  value={field.state.value}
                  items={COURSES}
                >
                  <ComboboxInput
                    id={field.name}
                    placeholder="Select a course"
                    aria-invalid={isInvalid}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No option found.</ComboboxEmpty>
                    <ComboboxList>
                      {(c) => (
                        <ComboboxItem key={c} value={c}>
                          {c}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {/* LA */}
        <form.Subscribe selector={(state) => state.values.course}>
          {(course) =>
            course && (
              <form.Field name="la">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Please select the name of the LA you are providing
                        feedback to <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Combobox
                        autoHighlight
                        onValueChange={(v) => field.handleChange(v as string)}
                        value={field.state.value}
                        items={LAS}
                      >
                        <ComboboxInput
                          id={field.name}
                          placeholder="Select an LA"
                          aria-invalid={isInvalid}
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No option found.</ComboboxEmpty>
                          <ComboboxList>
                            {(laName) => (
                              <ComboboxItem key={laName} value={laName}>
                                {laName}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            )
          }
        </form.Subscribe>

        {/* Feedback Type — student only */}
        <form.Subscribe
          selector={(state) => ({
            la: state.values.la,
            role: state.values.role,
          })}
        >
          {({ la, role }) =>
            la &&
            role === "student" && (
              <form.Field name="feedback_type">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>
                        What kind of feedback are you providing?{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldDescription>
                        Students provide LAs with feedback in the middle of the
                        quarter (Weeks 5–6) and at the end of the quarter (Weeks
                        9–10).
                      </FieldDescription>
                      <RadioGroup
                        value={field.state.value}
                        onValueChange={(v) => {
                          field.handleChange(v);
                        }}
                        onBlur={field.handleBlur}
                      >
                        {FEEDBACK_TYPE_OPTIONS.map(({ value, label }) => (
                          <div key={value} className="flex items-center gap-2">
                            <RadioGroupItem
                              id={`type-${value}`}
                              value={value}
                              aria-invalid={isInvalid}
                              type="button"
                            />
                            <Label
                              htmlFor={`type-${value}`}
                              className="cursor-pointer font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            )
          }
        </form.Subscribe>

        {/* Feedback Type — LA only */}
        <form.Subscribe
          selector={(state) => ({
            la: state.values.la,
            role: state.values.role,
          })}
        >
          {({ la, role }) =>
            la &&
            role === "la" && (
              <form.Field name="feedback_type">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>
                        LAs: What kind of feedback are you providing?{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <RadioGroup
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                        onBlur={field.handleBlur}
                      >
                        {LA_FEEDBACK_TYPE_OPTIONS.map(({ value, label }) => (
                          <div key={value} className="flex items-center gap-2">
                            <RadioGroupItem
                              id={`type-${value}`}
                              value={value}
                              aria-invalid={isInvalid}
                              type="button"
                            />
                            <Label
                              htmlFor={`type-${value}`}
                              className="cursor-pointer font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            )
          }
        </form.Subscribe>

        {/* LA sections */}
        <form.Subscribe
          selector={(state) => ({
            role: state.values.role,
            feedbackType: state.values.feedback_type,
          })}
        >
          {({ role, feedbackType }) =>
            role === "la" &&
            feedbackType && (
              <>
                <FieldSeparator />
                {feedbackType === "la_observation" && (
                  <ObservationSection form={form} />
                )}
                {feedbackType === "la_head_la" && (
                  <LAHeadLASection form={form} />
                )}
              </>
            )
          }
        </form.Subscribe>

        {/* Student sections */}
        <form.Subscribe
          selector={(state) => ({
            role: state.values.role,
            feedbackType: state.values.feedback_type,
          })}
        >
          {({ role, feedbackType }) =>
            role === "student" &&
            feedbackType && (
              <>
                <FieldSeparator />
                {feedbackType === "mid_quarter" && (
                  <MidQuarterSection form={form} />
                )}
                {feedbackType === "end_of_quarter" && (
                  <EndOfQuarterSection form={form} />
                )}
                <FieldSeparator />
                <ClosingSection form={form} />
              </>
            )
          }
        </form.Subscribe>

        {/* TA section */}
        <form.Subscribe
          selector={(state) => ({
            la: state.values.la,
            role: state.values.role,
          })}
        >
          {({ la, role }) =>
            la &&
            role === "ta" && (
              <>
                <FieldSeparator />
                <TASection form={form} />
              </>
            )
          }
        </form.Subscribe>
        <FieldSeparator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="reset"
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              form.reset();
            }}
          >
            Clear Form
          </Button>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </FieldGroup>
    </form>
  );
}
