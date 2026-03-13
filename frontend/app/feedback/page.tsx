"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
const COURSES = [
  "CS 31 – Introduction to Computer Science I",
  "CS 32 – Object-Oriented Programming",
  "CS 33 – Introduction to Computer Organization",
  "CS 35L – Software Construction Laboratory",
  "MATH 31A – Differential and Integral Calculus",
  "MATH 31B – Integration and Infinite Series",
  "MATH 32A – Calculus of Several Variables",
  "PHYSICS 1A – Physics for Scientists and Engineers",
  "PHYSICS 1B – Physics for Scientists and Engineers",
  "CHEM 14A – Atomic and Molecular Structure",
  "CHEM 14B – Thermodynamics and Kinetics",
  "No LA",
];

const LAS = ["AAAA", "BBBB", "CCCC", "No LA"];

const IMPROVEMENT_OPTIONS = [
  "N/A",
  "No change",
  "A little improvement",
  "Some improvement",
  "A lot of improvement",
];

const AGREEMENT_OPTIONS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

const END_OF_QUARTER_QUESTIONS = [
  {
    id: "approachability",
    label: "How much improvement have you seen in your LA's approachability?",
  },
  {
    id: "helpfulness",
    label:
      "How much improvement have you seen in your LA's helpfulness to your learning in this course?",
  },
  {
    id: "familiarity",
    label:
      "How much improvement have you seen in your LA's familiarity with the course material?",
  },
  {
    id: "engagement",
    label:
      "How much improvement have you seen in your LA's ability to engage everyone in your group?",
  },
  {
    id: "questioning",
    label:
      "How much improvement have you seen in your LA's focus on asking questions before explaining?",
  },
  {
    id: "supportiveness",
    label:
      "How much improvement have you seen in your LA's supportiveness when you are struggling and/or frustrated?",
  },
  {
    id: "name-use",
    label:
      "How much improvement have you seen in your LA's use of your name when interacting with you?",
  },
  {
    id: "belonging-stem",
    label:
      "How much improvement have you seen in your LA's support of you feeling more like you belong in STEM?",
  },
  {
    id: "group-belonging",
    label:
      "My group in discussion section helped me feel more like I belong in this class.",
  },
  {
    id: "group-reliance",
    label:
      "My group in discussion section helped me feel more like I can rely on other students for academic support.",
  },
];

const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Nonbinary",
  "Prefer to self-describe",
  "Prefer not to say",
];

const GROUP_OPTIONS = [
  { id: "grp-african", label: "African" },
  { id: "grp-african-american-black", label: "African American / Black" },
  { id: "grp-other-black", label: "Other Black" },
  { id: "grp-caribbean", label: "Caribbean" },
  { id: "grp-mexican", label: "Mexican / Mexican American" },
  { id: "grp-central-american", label: "Central American" },
  { id: "grp-south-american", label: "South American" },
  { id: "grp-puerto-rican", label: "Puerto Rican" },
  { id: "grp-other-hispanic", label: "Other Hispanic or Latine/o/a" },
  { id: "grp-chicane", label: "Chicane/o/a" },
  {
    id: "grp-native-american",
    label: "Native American: American Indian or Alaskan Native",
  },
  {
    id: "grp-pacific-islander",
    label: "Native Hawaiian or Other Pacific Islander",
  },
  {
    id: "grp-east-asian",
    label: "East Asian (e.g., Chinese, Japanese, Korean, Taiwanese)",
  },
  { id: "grp-mena-central-asian", label: "MENA / Central Asian" },
  {
    id: "grp-south-asian",
    label: "South Asian (e.g., Pakistani, Indian, Nepalese, Sri Lankan)",
  },
  {
    id: "grp-southeast-asian",
    label: "Southeast Asian (e.g., Filipino, Indonesian, Vietnamese)",
  },
  { id: "grp-european", label: "European / European American" },
  { id: "grp-other-white", label: "Other White" },
  { id: "grp-other", label: "Other (specify below)" },
  { id: "grp-prefer-not-to-say", label: "Prefer not to say" },
];

const MID_QUARTER_QUESTIONS = [
  { id: "mq-approachable", label: "My LA is approachable." },
  {
    id: "mq-helpful",
    label: "My LA is helpful to my learning in this course.",
  },
  {
    id: "mq-familiar",
    label:
      "My LA is familiar with the course material (and/or asks the TA when needed).",
  },
  {
    id: "mq-engagement",
    label:
      "My LA helps create an environment in which every student in my group engages.",
  },
  {
    id: "mq-questioning",
    label:
      "My LA asks me why something is true more often than they explain to me why.",
  },
  {
    id: "mq-supportive",
    label: "My LA supports me if I am struggling and/or frustrated.",
  },
  { id: "mq-name", label: "My LA uses my name when interacting with me." },
  {
    id: "mq-belonging",
    label: "My LA helps me feel more like I belong in STEM.",
  },
  {
    id: "mq-checkin",
    label:
      "An LA checks in on my understanding in every section, especially if I am struggling.",
  },
  {
    id: "mq-small-groups",
    label:
      "This course allows LAs to facilitate learning by having students work in small groups.",
  },
];

const ACTIVITIES = [
  { id: "discussion", label: "Discussion or lab section" },
  {
    id: "lecture",
    label: "Lecture (if you have interacted with LAs during lecture)",
  },
  { id: "office-hours", label: "Office hours" },
  { id: "study-session", label: "Review / study session" },
];

export default function FeedbackPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLA, setSelectedLA] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

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

          <form className="flex flex-col gap-6">
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
                {[
                  { value: "la", label: "an LA." },
                  {
                    value: "student",
                    label: "a student in an LA-supported course.",
                  },
                  { value: "ta", label: "a TA who interacts with an LA." },
                ].map(({ value, label }) => (
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
                  setSelectedCourse(v);
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
                  {selectedCourse ? (
                    <span className="font-semibold">{selectedCourse}</span>
                  ) : (
                    "course"
                  )}{" "}
                  LA you are providing feedback to{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select name="la" required onValueChange={setSelectedLA}>
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
                    onValueChange={setFeedbackType}
                  >
                    {[
                      {
                        value: "mid-quarter",
                        label: "Student to LA Mid-Quarter Feedback",
                      },
                      {
                        value: "end-of-quarter",
                        label: "Student to LA End-of-Quarter Feedback",
                      },
                    ].map(({ value, label }) => (
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

                {/* Mid-quarter questions */}
                {feedbackType === "mid-quarter" && (
                  <>
                    {/* Activities attended */}
                    <div className="flex flex-col gap-3">
                      <Label>
                        Which LA-supported activities have you attended for this
                        course? <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Check all that apply.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {ACTIVITIES.map(({ id, label }) => (
                          <div key={id} className="flex items-center gap-2">
                            <Checkbox id={id} name={id} />
                            <Label
                              htmlFor={id}
                              className="cursor-pointer font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mq-hours">
                        Approximately how many hours per week do you spend in
                        LA-supported activities for this course?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>
                          If you attend a 2-hour discussion section each week,
                          you would put 2.
                        </li>
                        <li>
                          If you don&apos;t attend an LA-supported section, you
                          would put 0.
                        </li>
                        <li>
                          If you attend a 1-hour discussion section each week
                          AND an LA-supported office hour or review session
                          every 2–3 weeks, you would put 1.5.
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
                    {MID_QUARTER_QUESTIONS.map(({ id, label }) => (
                      <div key={id} className="flex flex-col gap-2">
                        <Label htmlFor={id}>
                          {label} <span className="text-destructive">*</span>
                        </Label>
                        <Select name={id} required>
                          <SelectTrigger id={id}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="w-[var(--radix-select-trigger-width)]">
                            {AGREEMENT_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mq-strengths">
                        What are your LA&apos;s strengths?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="mq-strengths"
                        name="mq-strengths"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mq-improve">
                        How can your LA improve to help you learn more?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="mq-improve"
                        name="mq-improve"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mq-course-change">
                        What would you change about this course to improve how
                        LAs help you learn?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        For example, what would help you be more comfortable
                        participating in discussion/lab sections?
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
                        Is there anything you want to change about your own
                        learning or study habits to improve your learning in
                        this course?
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        This is helpful for you to think about, and LAs can help
                        you make a plan to adjust your approach to learning.
                      </p>
                      <Textarea
                        id="study-habits"
                        name="study-habits"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* End-of-quarter questions */}
                {feedbackType === "end-of-quarter" && (
                  <>
                    {/* Activities attended */}
                    <div className="flex flex-col gap-3">
                      <Label>
                        Which LA-supported activities have you attended for this
                        course? <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Check all that apply.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {ACTIVITIES.map(({ id, label }) => (
                          <div key={id} className="flex items-center gap-2">
                            <Checkbox id={id} name={id} />
                            <Label
                              htmlFor={id}
                              className="cursor-pointer font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="hours">
                        Approximately how many hours per week do you spend in
                        LA-supported activities for this course?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>
                          If you attend a 2-hour discussion section each week,
                          you would put 2.
                        </li>
                        <li>
                          If you don&apos;t attend an LA-supported section, you
                          would put 0.
                        </li>
                        <li>
                          If you attend a 1-hour discussion section each week
                          AND an LA-supported office hour or review session
                          every 2–3 weeks, you would put 1.5.
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
                    {END_OF_QUARTER_QUESTIONS.map(({ id, label }, i) => {
                      const options =
                        i < 8 ? IMPROVEMENT_OPTIONS : AGREEMENT_OPTIONS;
                      return (
                        <div key={id} className="flex flex-col gap-2">
                          <Label htmlFor={id}>
                            {label} <span className="text-destructive">*</span>
                          </Label>
                          <Select name={id} required>
                            <SelectTrigger id={id}>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                              {options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="comments">
                        Are there any final comments you&apos;d like to share
                        with your LA now that the quarter is coming to an end?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="comments"
                        name="comments"
                        rows={4}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Shared closing questions — shown once feedback type is chosen */}
                {feedbackType && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="courses-without-las">
                        Which courses without LAs would you like the LA Program
                        to support?
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
                        {[
                          { value: "yes-this", label: "Yes, for this course." },
                          {
                            value: "yes-other",
                            label: "Yes, for another course.",
                          },
                          { value: "maybe", label: "Maybe." },
                          {
                            value: "no-graduating",
                            label: "No, because I am graduating.",
                          },
                          {
                            value: "no-uninterested",
                            label: "No, because I am not interested.",
                          },
                          {
                            value: "na-already",
                            label: "N/A – I am/was already an LA.",
                          },
                        ].map(({ value, label }) => (
                          <div key={value} className="flex items-center gap-2">
                            <RadioGroupItem
                              id={`become-la-${value}`}
                              value={value}
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
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="uid">
                        If your instructor is offering credit for this, please
                        enter your 9-digit UID (without dashes or spaces):
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When results are shared with LAs or instructors, they
                        will be independent of UIDs.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        If you would like a second way to confirm your
                        submission of this form, you may print your submission
                        (Ctrl + P on Windows/Linux or Command + P on Macs) and
                        save it as a PDF.
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
                      <Label htmlFor="gender">
                        What gender do you identify with?
                      </Label>
                      <Select name="gender">
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]">
                          {GENDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="gender-other">
                        If the gender you identify with was not listed above,
                        please use the space below to specify.
                      </Label>
                      <Input
                        id="gender-other"
                        name="gender-other"
                        type="text"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label>What group(s) do you identify with?</Label>
                      <p className="text-sm text-muted-foreground">
                        Select any that apply.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {GROUP_OPTIONS.map(({ id, label }) => (
                          <div key={id} className="flex items-center gap-2">
                            <Checkbox id={id} name={id} />
                            <Label
                              htmlFor={id}
                              className="cursor-pointer font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="group-other">
                        If the group(s) you identify with were not listed above,
                        please use the space below to specify.
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
                )}
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
