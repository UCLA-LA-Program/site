import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ACTIVITIES,
  AGREEMENT_OPTIONS,
  MID_QUARTER_QUESTIONS,
} from "./constants";

interface Props {
  likertAnswers: Record<string, string>;
  setLikert: (id: string, value: string) => void;
}

export function MidQuarterSection({ likertAnswers, setLikert }: Props) {
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
        <Label htmlFor="mq-hours">
          Approximately how many hours per week do you spend in LA-supported
          activities for this course?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>
            If you attend a 2-hour discussion section each week, you would put
            2.
          </li>
          <li>
            If you don&apos;t attend an LA-supported section, you would put 0.
          </li>
          <li>
            If you attend a 1-hour discussion section each week AND an
            LA-supported office hour or review session every 2–3 weeks, you
            would put 1.5.
          </li>
        </ul>
        <Input
          id="mq-hours"
          name="mq-hours"
          type="number"
          min="0"
          step="0.5"
          required
        />
      </div>

      {/* Likert questions */}
      {MID_QUARTER_QUESTIONS.map(({ id, label }) => (
        <div key={id} className="flex flex-col gap-2">
          <Label>
            {label} <span className="text-destructive">*</span>
          </Label>
          <ToggleGroup
            variant="outline"
            className="w-full items-stretch"
            value={likertAnswers[id] ? [likertAnswers[id]] : []}
            onValueChange={(values) => setLikert(id, values[0] ?? "")}
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
          <input type="hidden" name={id} value={likertAnswers[id] ?? ""} />
        </div>
      ))}

      {/* Open-ended */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="mq-strengths">
          What are your LA&apos;s strengths?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea id="mq-strengths" name="mq-strengths" rows={4} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="mq-improve">
          How can your LA improve to help you learn more?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea id="mq-improve" name="mq-improve" rows={4} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="mq-course-change">
          What would you change about this course to improve how LAs help you
          learn? <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          For example, what would help you be more comfortable participating in
          discussion/lab sections?
        </p>
        <Textarea
          id="mq-course-change"
          name="mq-course-change"
          rows={4}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="study-habits">
          Is there anything you want to change about your own learning or study
          habits to improve your learning in this course?
        </Label>
        <p className="text-sm text-muted-foreground">
          This is helpful for you to think about, and LAs can help you make a
          plan to adjust your approach to learning.
        </p>
        <Textarea id="study-habits" name="study-habits" rows={3} />
      </div>
    </>
  );
}
