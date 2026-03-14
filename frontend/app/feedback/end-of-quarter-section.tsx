"use client";

import type { FeedbackFormInstance, FeedbackFormValues } from "./schema";
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
import { ACTIVITIES, END_OF_QUARTER_QUESTIONS } from "./constants";
type Props = {
  form: FeedbackFormInstance;
};

const EQ_FIELD_MAP: Record<string, keyof FeedbackFormValues> = {
  approachability: "eqApproachability",
  helpfulness: "eqHelpfulness",
  familiarity: "eqFamiliarity",
  engagement: "eqEngagement",
  questioning: "eqQuestioning",
  supportiveness: "eqSupportiveness",
  "name-use": "eqNameUse",
  "belonging-stem": "eqBelongingStem",
  "group-belonging": "eqGroupBelonging",
  "group-reliance": "eqGroupReliance",
};

export function EndOfQuarterSection({ form }: Props) {
  return (
    <>
      {/* Activities attended */}
      <form.Field name="eqActivities">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
                      id={`eq-${id}`}
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
                    <Label htmlFor={`eq-${id}`} className="cursor-pointer font-normal">
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
      <form.Field name="eqHours">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Approximately how many hours per week do you spend in LA-supported
                activities for this course?{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>
                If you attend a 2-hour discussion section each week, put 2. If you don&apos;t
                attend an LA-supported section, put 0. If you attend a 1-hour discussion section
                AND an LA-supported office hour every 2–3 weeks, put 1.5.
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
      {END_OF_QUARTER_QUESTIONS.map(({ id, label, options }) => {
        const fieldName = EQ_FIELD_MAP[id] as keyof FeedbackFormValues;
        return (
          <form.Field key={id} name={fieldName}>
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>
                    {label} <span className="text-destructive">*</span>
                  </FieldLabel>
                  <ToggleGroup
                    variant="outline"
                    className="w-full items-stretch"
                    value={field.state.value ? [field.state.value as string] : []}
                    onValueChange={(values) => {
                      field.handleChange(values[0] ?? "");
                      field.handleBlur();
                    }}
                  >
                    {options.map((opt) => (
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

      {/* Final comments */}
      <form.Field name="eqComments">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Are there any final comments you&apos;d like to share with your LA now that the
                quarter is coming to an end?{" "}
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
    </>
  );
}
