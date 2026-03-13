import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BECOME_LA_OPTIONS, GENDER_OPTIONS, GROUP_OPTIONS } from "./constants";
import {
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Combobox,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

export function ClosingSection() {
  const anchor = useComboboxAnchor();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="courses-without-las">
          Which courses without LAs would you like the LA Program to support?
        </Label>
        <Textarea
          id="courses-without-las"
          name="courses-without-las"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>
          Are you interested in becoming an LA in the future?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          You can sign up for our mailing list{" "}
          <a
            href="https://www.laprogramucla.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            here
          </a>
          . And you can learn more about the LA Program{" "}
          <a
            href="https://www.laprogramucla.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            here
          </a>
          !
        </p>
        <RadioGroup name="become-la" required>
          {BECOME_LA_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem id={`become-la-${value}`} value={value} />
              <Label
                htmlFor={`become-la-${value}`}
                className="cursor-pointer font-normal"
              >
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="uid">
          If your instructor is offering credit for this, please enter your
          9-digit UID (without dashes or spaces):
        </Label>
        <p className="text-sm text-muted-foreground">
          When results are shared with LAs or instructors, they will be
          independent of UIDs.
        </p>
        <p className="text-sm text-muted-foreground italic">
          If you would like a second way to confirm your submission of this
          form, you may print your submission (Ctrl + P on Windows/Linux or
          Command + P on Macs) and save it as a PDF.
        </p>
        <Input
          id="uid"
          name="uid"
          type="text"
          maxLength={9}
          pattern="\d{9}"
          placeholder="123456789"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gender">What gender do you identify with?</Label>
        <Combobox autoHighlight name="gender" items={GENDER_OPTIONS}>
          <ComboboxInput id="gender" placeholder="Select an option" />
          <ComboboxContent>
            <ComboboxEmpty>No option found.</ComboboxEmpty>
            <ComboboxList>
              {(opt) => (
                <ComboboxItem key={opt} value={opt}>
                  {opt}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gender-other">
          If the gender you identify with was not listed above, please use the
          space below to specify.
        </Label>
        <Input id="gender-other" name="gender-other" type="text" />
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="group">What group(s) do you identify with?</Label>
        <Combobox multiple autoHighlight name="group" items={GROUP_OPTIONS}>
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(values) => (
                <>
                  {values.map((value: string) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="group"
                    placeholder={values.length ? "" : "Select any that apply"}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No option found.</ComboboxEmpty>
            <ComboboxList>
              {(opt) => (
                <ComboboxItem key={opt.id} value={opt.label}>
                  {opt.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="group-other">
          If the group(s) you identify with were not listed above, please use
          the space below to specify.
        </Label>
        <Input id="group-other" name="group-other" type="text" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="la-program-comments">
          Any additional comments for the LA Program?
        </Label>
        <Textarea
          id="la-program-comments"
          name="la-program-comments"
          rows={3}
        />
      </div>
    </>
  );
}
