"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { BECOME_LA_OPTIONS, GENDER_OPTIONS, GROUP_OPTIONS } from "../../constants";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { TextareaFormField } from "../fields/textarea-form-field";
import { withForm, defaultValues, feedbackFormSchema } from "../../form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

export const ClosingSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: ({ form }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const anchor = useComboboxAnchor();

    return (
      <FieldGroup>
        <TextareaFormField
          form={form}
          fieldName="courses_without_las"
          label="Which courses without LAs would you like the LA Program to support?"
        />

        <form.Field name="become_la">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  Are you interested in becoming an LA in the future?{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldDescription>
                  You can sign up for our mailing list{" "}
                  <a
                    href="https://www.laprogramucla.com"
                    className="underline-offset-4 hover:underline"
                  >
                    here
                  </a>
                  . And you can learn more about the LA Program{" "}
                  <a
                    href="https://www.laprogramucla.com"
                    className="underline-offset-4 hover:underline"
                  >
                    here
                  </a>
                  !
                </FieldDescription>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v)}
                  onBlur={field.handleBlur}
                >
                  {BECOME_LA_OPTIONS.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`become-la-${value}`}
                        value={value}
                        aria-invalid={isInvalid}
                      />
                      <Label
                        htmlFor={`become-la-${value}`}
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

        <form.Field name="uid">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  If your instructor is offering credit for this, please enter
                  your 9-digit UID (without dashes or spaces):
                </FieldLabel>
                <FieldDescription>
                  When results are shared with LAs or instructors, they will be
                  independent of UIDs.
                </FieldDescription>
                <Input
                  id={field.name}
                  type="text"
                  maxLength={9}
                  placeholder="123456789"
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

        <form.Field name="gender">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                What gender do you identify with?
              </FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="gender_other">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                If the gender you identify with was not listed above, please use
                the space below to specify.
              </FieldLabel>
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="groups">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="groups">
                What group(s) do you identify with?
              </FieldLabel>
              <Combobox
                multiple
                autoHighlight
                items={GROUP_OPTIONS}
                onValueChange={(v) => field.handleChange(v as string[])}
              >
                <ComboboxChips ref={anchor}>
                  <ComboboxValue>
                    {(values) => (
                      <>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>
                            {GROUP_OPTIONS.find((v) => v.value == value)
                              ?.label ?? ""}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          id="groups"
                          placeholder={
                            values.length ? "" : "Select any that apply"
                          }
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No option found.</ComboboxEmpty>
                  <ComboboxList>
                    {(opt) => (
                      <ComboboxItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          )}
        </form.Field>

        <form.Field name="group_other">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                If the group(s) you identify with were not listed above, please
                use the space below to specify.
              </FieldLabel>
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>

        <TextareaFormField
          form={form}
          fieldName="la_program_comments"
          label="Any additional comments for the LA Program?"
        />
      </FieldGroup>
    );
  },
});
