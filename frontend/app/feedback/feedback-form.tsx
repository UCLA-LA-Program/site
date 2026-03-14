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
import { COURSES, FEEDBACK_TYPE_OPTIONS, LAS, ROLE_OPTIONS } from "./constants";
import { useAppForm, defaultValues, feedbackFormSchema } from "./form";
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
    <form.AppForm>
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
                          feedback to{" "}
                          <span className="text-destructive">*</span>
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

          {/* Feedback Type */}
          <form.Subscribe selector={(state) => state.values.la}>
            {(la) =>
              la && (
                <form.Field name="feedbackType">
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
                          Students provide LAs with feedback in the middle of
                          the quarter (Weeks 5–6) and at theend of the quarter
                          (Weeks 9–10).
                        </FieldDescription>
                        <RadioGroup
                          value={field.state.value}
                          onValueChange={(v) => {
                            field.handleChange(v);
                          }}
                          onBlur={field.handleBlur}
                        >
                          {FEEDBACK_TYPE_OPTIONS.map(({ value, label }) => (
                            <div
                              key={value}
                              className="flex items-center gap-2"
                            >
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

          <form.Subscribe selector={(state) => state.values.feedbackType}>
            {(feedbackType) =>
              feedbackType && (
                <>
                  <FieldSeparator />
                  {feedbackType === "mid-quarter" && <MidQuarterSection />}
                  {feedbackType === "end-of-quarter" && <EndOfQuarterSection />}
                  <FieldSeparator />
                  <ClosingSection />
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
    </form.AppForm>
  );
}
