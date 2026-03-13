import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ACTIVITIES, END_OF_QUARTER_QUESTIONS } from "./constants";

interface Props {
  likertAnswers: Record<string, string>;
  setLikert: (id: string, value: string) => void;
}

export function EndOfQuarterSection({ likertAnswers, setLikert }: Props) {
  return (
    <>
      {/* Activities attended */}
      <div className="flex flex-col gap-3">
        <Label>
          Which LA-supported activities have you attended for this course?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">Check all that apply.</p>
        <div className="flex flex-col gap-2.5">
          {ACTIVITIES.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-2">
              <Checkbox id={id} name={id} />
              <Label htmlFor={id} className="cursor-pointer font-normal">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Hours */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="hours">
          Approximately how many hours per week do you spend in LA-supported
          activities for this course?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>If you attend a 2-hour discussion section each week, you would put 2.</li>
          <li>If you don&apos;t attend an LA-supported section, you would put 0.</li>
          <li>
            If you attend a 1-hour discussion section each week AND an
            LA-supported office hour or review session every 2–3 weeks, you
            would put 1.5.
          </li>
        </ul>
        <Input
          id="hours"
          name="hours"
          type="number"
          min="0"
          step="0.5"
          required
        />
      </div>

      {/* Likert questions */}
      {END_OF_QUARTER_QUESTIONS.map(({ id, label, options }) => (
        <div key={id} className="flex flex-col gap-2">
          <Label>
            {label} <span className="text-destructive">*</span>
          </Label>
          <ToggleGroup
            variant="outline"

            className="w-full"
            value={likertAnswers[id] ? [likertAnswers[id]] : []}
            onValueChange={(values) => setLikert(id, values[0] ?? "")}
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
          <input type="hidden" name={id} value={likertAnswers[id] ?? ""} />
        </div>
      ))}

      {/* Final comments */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="comments">
          Are there any final comments you&apos;d like to share with your LA now
          that the quarter is coming to an end?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea id="comments" name="comments" rows={4} required />
      </div>
    </>
  );
}
