import type { Metadata } from "next";
import { BookOpen, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-20">
      <h1 className="mb-8 text-2xl font-bold">Contact Us</h1>
      <div className="flex w-full max-w-2xl flex-col gap-6 sm:flex-row">
        <div className="flex flex-1 flex-col items-center rounded-lg border p-6 text-center">
          <BookOpen className="mb-3 h-6 w-6 text-muted-foreground" />
          <h2 className="mb-2 text-sm font-medium">LA Program Concerns</h2>
          <p className="text-sm text-muted-foreground">
            If you are an LA with concerns not related to the website, please
            refer to the{" "}
            <a
              className="underline-offset-2 text-primary hover:underline"
              href="https://docs.google.com/document/d/1ynJSRhLkGigDWusufc7HGjG-T-gWBAreWKcoyhlA9Sc/edit?usp=sharing"
            >
              syllabus
            </a>{" "}
            to find the appropriate email.
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-lg border p-6 text-center">
          <Mail className="mb-3 h-6 w-6 text-muted-foreground" />
          <h2 className="mb-2 text-sm font-medium">Website/Other Concerns</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            If you have website-related concerns or are not an LA, please email
            us at:
          </p>
          <a
            href="mailto:pdt.laprogram@gmail.com"
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            pdt.laprogram@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
