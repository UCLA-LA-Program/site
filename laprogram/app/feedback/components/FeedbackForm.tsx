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
import { ClosingSection } from "./sections/ClosingSection";
import { EndOfQuarterSection } from "./sections/EndOfQuarterSection";
import { MidQuarterSection } from "./sections/MidQuarterSection";
import { TASection } from "./sections/TASection";
import { LAHeadLASection } from "./sections/LAHeadLASection";
import { ObservationSection } from "./sections/ObservationSection";
import { LA_POSITION_MAP } from "../constants";

import { useAppForm } from "../form";
import { defaultValues, feedbackFormSchema } from "../schema";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
} from "@/components/ui/combobox";
import { LA } from "@/types/db";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { UserRound, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

type Option = { value: string; label: string };

type FeedbackFormProps = {
  roleOptions: Option[];
  feedbackTypeOptions: Option[];
  laFeedbackTypeOptions: Option[];
};

export function FeedbackForm({
  roleOptions,
  feedbackTypeOptions,
  laFeedbackTypeOptions,
}: FeedbackFormProps) {
  const { data: session } = authClient.useSession();
  const { data: las } = useSWR<LA[]>("/api/la", fetcher, {
    suspense: true,
    fallbackData: [],
  });

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: feedbackFormSchema,
    },
    onSubmit: async ({ value }) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify(value),
      });

      if (response.ok) {
        form.reset();
        toast.success("Feedback has been submitted!");
      } else {
        toast.error("Error submitting feedback. Try again later.");
      }
    },
    onSubmitInvalid() {
      const first_invalid = document.querySelector('[data-invalid="true"]');
      first_invalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please fix form errors.");
    },
  });

  if (!las) return <></>;


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
        <form.Field
          name="role"
          listeners={{
            onChange: () => {
              form.setFieldValue("course", "");
              form.setFieldValue("la", "");
            },
          }}
        >
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
                  {roleOptions.map(({ value, label }) => (
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
              </Field>
            );
          }}
        </form.Field>

        {/* Sign-in gate for LAs */}
        <form.Subscribe selector={(state) => state.values.role}>
          {(role) =>
            role === "la" &&
            !session && (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
                <LogIn className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  LAs must login to submit Head LA & Observation feedback.
                </p>
                <Button asChild size="sm">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            )
          }
        </form.Subscribe>

        {/* Course — hidden until role is selected; hidden for unauthenticated LAs */}
        <form.Subscribe selector={(state) => state.values.role}>
          {(role) =>
            role &&
            (role !== "la" || session) && (
              <form.Field
                name="course"
                listeners={{
                  onChange: () => {
                    form.setFieldValue("la", "");
                  },
                }}
              >
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
                        items={[...new Set(las.map((la) => la.course))]}
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
                    </Field>
                  );
                }}
              </form.Field>
            )
          }
        </form.Subscribe>

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
                        items={las.filter((la) => la.course === course)}
                      >
                        <ComboboxInput
                          id={field.name}
                          placeholder="Select an LA"
                          aria-invalid={isInvalid}
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No option found.</ComboboxEmpty>
                          <ComboboxList>
                            {(la: LA) => (
                              <ComboboxItem key={la.name} value={la.name}>
                                {la.image ? (
                                  <Image
                                    src={la.image}
                                    alt={la.name}
                                    width={300}
                                    height={300}
                                    className="h-24 w-24 rounded-sm"
                                  />
                                ) : (
                                  <UserRound
                                    className="size-24 rounded-sm"
                                    strokeWidth={1}
                                  />
                                )}
                                <div className="flex flex-col pl-3">
                                  <span className="text-sm">{la.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {LA_POSITION_MAP.get(la.position) ??
                                      la.position}
                                  </span>
                                </div>
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
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
                        {feedbackTypeOptions.map(({ value, label }) => (
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
                        {laFeedbackTypeOptions.map(({ value, label }) => (
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
            la: state.values.la,
            role: state.values.role,
            feedbackType: state.values.feedback_type,
          })}
        >
          {({ la, role, feedbackType }) =>
            la &&
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
            la: state.values.la,
            role: state.values.role,
            feedbackType: state.values.feedback_type,
          })}
        >
          {({ la, role, feedbackType }) =>
            la &&
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
