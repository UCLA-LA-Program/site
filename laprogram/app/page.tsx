import Link from "next/link";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/page-background";

export default function Page() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <PageBackground />

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col justify-center">
        <section className="mx-auto w-full max-w-5xl px-8 py-16 md:py-24">
          <h1
            className="animate-fade-up mb-8 max-w-2xl text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-[1.06] tracking-tight"
            style={{ animationDelay: "0ms" }}
          >
            Help LAs grow.
            <br />
            <span className="text-primary">One observation</span>
            <br />
            at a time.
          </h1>

          <p
            className="animate-fade-up mb-11 max-w-sm text-base leading-relaxed text-muted-foreground"
            style={{ animationDelay: "70ms" }}
          >
            Submit feedback for any LA, or sign in to manage observations and
            view your feedback.
          </p>

          <div
            className="animate-fade-up flex flex-wrap items-center gap-3"
            style={{ animationDelay: "140ms" }}
          >
            <Button asChild size="lg" className="px-7">
              <Link href="/feedback">
                Give Feedback
                <ArrowRight />{" "}
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
