"use client";

import type { FeedbackFormInstance, FeedbackFormValues } from "../schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  ACTIVITIES,
  AGREEMENT_OPTIONS,
  MID_QUARTER_QUESTIONS,
} from "../constants";
type Props = {
  form: FeedbackFormInstance;
};

const MQ_FIELD_MAP: Record<string, keyof FeedbackFormValues> = {
  "mq-approachable": "mqApproachable",
  "mq-helpful": "mqHelpful",
  "mq-familiar": "mqFamiliar",
  "mq-engagement": "mqEngagement",
  "mq-questioning": "mqQuestioning",
  "mq-supportive": "mqSupportive",
  "mq-name": "mqName",
  "mq-belonging": "mqBelonging",
  "mq-checkin": "mqCheckin",
  "mq-small-groups": "mqSmallGroups",
};

export function MidQuarterSection({ form }: Props) {
  return (
    <>
      {/* Activities attended */}
      <form.Field name="mqActivities">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                Which LA-supported activities have you attended for this course?{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>Check all that apply.</FieldDescription>
              <div className="flex flex-col gap-2.5">
                {ACTIVITIES.map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={`mq-${id}`}
                      checked={field.state.value.includes(id)}
                      onCheckedChange={(checked) => {
                        field.handleChange(
                          checked
                            ? [...field.state.value, id]
                            : field.state.value.filter((v) => v !== id),
                        );
                      }}
                      aria-invalid={isInvalid}
                    />
                    <Label
                      htmlFor={`mq-${id}`}
                      className="cursor-pointer font-normal"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {/* Hours */}
      <form.Field name="mqHours">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Approximately how many hours per week do you spend in
                LA-supported activities for this course?{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>
                If you attend a 2-hour discussion section each week, put 2. If
                you don&apos;t attend an LA-supported section, put 0. If you
                attend a 1-hour discussion section AND an LA-supported office
                hour every 2–3 weeks, put 1.5.
              </FieldDescription>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.5"
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

      {/* Likert questions */}
      {MID_QUARTER_QUESTIONS.map(({ id, label }) => {
        const fieldName = MQ_FIELD_MAP[id] as keyof FeedbackFormValues;
        return (
          <form.Field key={id} name={fieldName}>
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>
                    {label} <span className="text-destructive">*</span>
                  </FieldLabel>
                  <ToggleGroup
                    variant="outline"
                    className="w-full items-stretch"
                    value={
                      field.state.value ? [field.state.value as string] : []
                    }
                    onValueChange={(values) => {
                      field.handleChange(values[0] ?? "");
                      field.handleBlur();
                    }}
                  >
                    {AGREEMENT_OPTIONS.map((opt) => (
                      <ToggleGroupItem
                        key={opt}
                        value={opt}
                        className="h-auto flex-1 whitespace-normal py-2 text-xs"
                      >
                        {opt}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        );
      })}

      {/* Open-ended questions */}
      <form.Field name="mqStrengths">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                What are your LA&apos;s strengths?{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id={field.name}
                rows={4}
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

      <form.Field name="mqImprove">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                How can your LA improve to help you learn more?{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id={field.name}
                rows={4}
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

      <form.Field name="mqCourseChange">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                What would you change about this course to improve how LAs help
                you learn? <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>
                For example, what would help you be more comfortable
                participating in discussion/lab sections?
              </FieldDescription>
              <Textarea
                id={field.name}
                rows={4}
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

      <form.Field name="mqStudyHabits">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Is there anything you want to change about your own learning or
              study habits to improve your learning in this course?
            </FieldLabel>
            <FieldDescription>
              This is helpful for you to think about, and LAs can help you make
              a plan to adjust your approach to learning.
            </FieldDescription>
            <Textarea
              id={field.name}
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>
    </>
  );
}
