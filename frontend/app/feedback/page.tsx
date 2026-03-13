"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClosingSection } from "./closing-section";
import { EndOfQuarterSection } from "./end-of-quarter-section";
import { MidQuarterSection } from "./mid-quarter-section";
import { COURSES, FEEDBACK_TYPE_OPTIONS, LAS, ROLE_OPTIONS } from "./constants";
import { Input } from "@/components/ui/input";

export default function FeedbackPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLA, setSelectedLA] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [likertAnswers, setLikertAnswers] = useState<Record<string, string>>(
    {},
  );

  function setLikert(id: string, value: string) {
    setLikertAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-start px-8 py-12">
        <div className="animate-fade-up w-full max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
              General LA Feedback Form
            </h1>
            <p className="text-sm text-muted-foreground">
              Thanks for providing feedback to LAs! If you have any issues with
              this form, please contact{" "}
              <a
                href="mailto:pdt.laprogram@gmail.com"
                className="text-primary underline-offset-4 hover:underline"
              >
                pdt.laprogram@gmail.com
              </a>
              .
            </p>
            <p className="mt-2 text-sm text-muted-foreground italic">
              If you do not have an LA (or if your LA is a volunteer), but you
              still want to receive credit from your instructor for filling out
              this form, you can select &quot;No LA&quot; as the LA you are
              providing feedback to. Then indicate &quot;N/A&quot; for any
              questions asking about your LA and input your UID at the bottom of
              the form.
            </p>
          </div>

          <form
            className="flex flex-col gap-6"
            onReset={() => {
              setSelectedCourse("");
              setSelectedLA("");
              setFeedbackType("");
              setLikertAnswers({});
            }}
          >
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" name="name" type="text" required />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@ucla.edu"
                required
              />
            </div>

            {/* I am... */}
            <div className="flex flex-col gap-3">
              <Label>
                I am&hellip; <span className="text-destructive">*</span>
              </Label>
              <RadioGroup name="role" required>
                {ROLE_OPTIONS.map(({ value, label }) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem id={`role-${value}`} value={value} />
                    <Label
                      htmlFor={`role-${value}`}
                      className="cursor-pointer font-normal"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Course */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="course">
                Course of LA being given feedback{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                name="course"
                required
                onValueChange={(v) => {
                  setSelectedCourse(v as string);
                  setSelectedLA("");
                }}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {COURSES.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LA selection */}
            {selectedCourse && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="la">
                  Please select the name of the{" "}
                  <span className="font-semibold">{selectedCourse}</span> LA you
                  are providing feedback to{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select name="la" required onValueChange={(v) => setSelectedLA(v as string)}>
                  <SelectTrigger id="la">
                    <SelectValue placeholder="Select an LA" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    {LAS.map((la) => (
                      <SelectItem key={la} value={la}>
                        {la}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedLA && (
              <>
                {/* Feedback type */}
                <div className="flex flex-col gap-3">
                  <Label>
                    What kind of feedback are you providing?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Students provide LAs with feedback in the{" "}
                    <strong>middle</strong> of the quarter (Weeks 5–6) and at
                    the <strong>end</strong> of the quarter (Weeks 9–10).
                  </p>
                  <RadioGroup
                    name="feedback-type"
                    required
                    onValueChange={(v) => setFeedbackType(v as string)}
                  >
                    {FEEDBACK_TYPE_OPTIONS.map(({ value, label }) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem id={`type-${value}`} value={value} />
                        <Label
                          htmlFor={`type-${value}`}
                          className="cursor-pointer font-normal"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {feedbackType === "mid-quarter" && (
                  <MidQuarterSection
                    likertAnswers={likertAnswers}
                    setLikert={setLikert}
                  />
                )}

                {feedbackType === "end-of-quarter" && (
                  <EndOfQuarterSection
                    likertAnswers={likertAnswers}
                    setLikert={setLikert}
                  />
                )}

                {/* Shared closing questions */}
                {feedbackType && <ClosingSection />}
              </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button type="reset" variant="ghost" size="sm">
                Clear form
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
