"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { ClosingSection } from "./sections/ClosingSection";
import { EndQuarterSection } from "./sections/EndQuarterSection";
import { MidQuarterSection } from "./sections/MidQuarterSection";
import { TASection } from "./sections/TASection";
import { HeadLASection } from "./sections/HeadLASection";
import { ObservationSection } from "./sections/ObservationSection";
import { RoleField } from "./sections/RoleField";
import { SignInGate } from "./sections/SignInGate";
import { LAFeedbackTypeField } from "./sections/LAFeedbackTypeField";
import { ObservationPicker } from "./sections/ObservationPicker";
import { HeadLAPicker } from "./sections/HeadLAPicker";
import { CourseField } from "./sections/CourseField";
import { LAField } from "./sections/LAField";
import { StudentFeedbackTypeField } from "./sections/StudentFeedbackTypeField";

import { useAppForm } from "../form";
import { defaultValues, feedbackFormSchema } from "../schema";
import type { LA, Position } from "@/types/db";
import { useState } from "react";
import useSWRImmutable from "swr";
import { fetcher } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { hydrateDates } from "@/lib/utils";
import { MyObservation } from "@/app/observations/signup/types";
import { CheckCircle2 } from "lucide-react";
import { InfoSection } from "./sections/InfoSection";

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
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = authClient.useSession();
  const { data: las } = useSWRImmutable<LA[]>("/api/la", fetcher, {
    suspense: true,
    fallbackData: [],
  });
  const { data: myPositions } = useSWRImmutable<Position[]>(
    session ? "/api/la/self" : null,
    fetcher,
    {
      suspense: true,
      fallbackData: [],
    },
  );
  const { data: myObservations } = useSWRImmutable(
    session ? "/api/observation" : null,
    (url: string) => fetcher(url).then(hydrateDates<MyObservation>),
    {
      suspense: true,
      fallbackData: [],
    },
  );

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
        setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-semibold">Your feedback was received!</h2>
        <p className="text-muted-foreground">
          Thank you for taking the time to share your thoughts.
        </p>
        <Button onClick={() => setSubmitted(false)}>Submit Another</Button>
      </div>
    );
  }

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
        <RoleField form={form} roleOptions={roleOptions} />

        {/* LA Feedback selector */}
        <form.Subscribe selector={(state) => state.values.role}>
          {(role) =>
            role === "la" &&
            (session ? (
              <LAFeedbackTypeField
                form={form}
                laFeedbackTypeOptions={laFeedbackTypeOptions}
              />
            ) : (
              <SignInGate />
            ))
          }
        </form.Subscribe>

        {/* LA Observation picker */}
        <form.Subscribe
          selector={(state) => ({
            role: state.values.role,
            feedbackType: state.values.feedback_type,
          })}
        >
          {({ role, feedbackType }) =>
            role === "la" &&
            feedbackType === "la_observation" &&
            myObservations && (
              <ObservationPicker form={form} observations={myObservations} />
            )
          }
        </form.Subscribe>

        {/* LA Head LA picker */}
        <form.Subscribe
          selector={(state) => ({
            role: state.values.role,
            feedbackType: state.values.feedback_type,
          })}
        >
          {({ role, feedbackType }) =>
            role === "la" &&
            feedbackType === "la_head_la" &&
            myPositions && (
              <HeadLAPicker
                form={form}
                las={las}
                myPositions={myPositions}
                name={session?.user.name ?? ""}
              />
            )
          }
        </form.Subscribe>

        {/* Course — hidden for LA role */}
        <form.Subscribe selector={(state) => state.values.role}>
          {(role) =>
            role && role !== "la" && <CourseField form={form} las={las} />
          }
        </form.Subscribe>

        {/* LA — hidden for LA role */}
        <form.Subscribe
          selector={(state) => ({
            course: state.values.course,
            role: state.values.role,
          })}
        >
          {({ course, role }) =>
            course &&
            role !== "la" && <LAField form={form} las={las} course={course} />
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
              <StudentFeedbackTypeField
                form={form}
                feedbackTypeOptions={feedbackTypeOptions}
              />
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
                {feedbackType === "la_head_la" && <HeadLASection form={form} />}
              </>
            )
          }
        </form.Subscribe>

        <InfoSection form={form} />

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
                  <EndQuarterSection form={form} />
                )}
                {(feedbackType === "mid_quarter" ||
                  feedbackType === "end_of_quarter") && (
                  <>
                    <FieldSeparator />
                    <ClosingSection form={form} />
                  </>
                )}
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
