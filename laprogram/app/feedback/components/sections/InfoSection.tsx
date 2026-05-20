"use client";

import { FieldSeparator } from "@/components/ui/field";
import { withForm } from "../../form";
import { defaultValues, feedbackFormSchema } from "../../schema";

export const InfoSection = withForm({
  defaultValues,
  validators: { onSubmit: feedbackFormSchema },
  render: function Render({ form }) {
    return (
      <form.Subscribe
        selector={(state) => ({
          la: state.values.la,
          role: state.values.role,
          feedbackType: state.values.feedback_type,
          course: state.values.course,
        })}
      >
        {({ la, role, feedbackType, course }) =>
          la &&
          role === "student" &&
          (feedbackType === "mid_quarter" ||
            feedbackType === "end_of_quarter") &&
          course.includes("CS 118") && (
            <>
              <FieldSeparator />
              <p className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-mono text-primary">
                CTF Code:{" "}
                {feedbackType === "mid_quarter"
                  ? "cs118{1/2way_f33dbACK}"
                  : "cs118{thanks!-joy_and_arnav}"}
              </p>
            </>
          )
        }
      </form.Subscribe>
    );
  },
});
