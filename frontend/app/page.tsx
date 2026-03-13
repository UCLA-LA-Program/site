import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.75 0.01 242) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -top-48 right-0 h-[700px] w-[700px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 -left-48 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[100px]" />
      </div>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col justify-center">
        <section className="mx-auto w-full max-w-5xl px-8 py-16 md:py-24">
          <div
            className="animate-fade-up mb-7 flex items-center gap-3"
            style={{ animationDelay: "0ms" }}
          ></div>

          <h1
            className="animate-fade-up mb-8 max-w-2xl text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-[1.06] tracking-tight"
            style={{ animationDelay: "70ms" }}
          >
            Help LAs grow.
            <br />
            <span className="text-primary">One observation</span>
            <br />
            at a time.
          </h1>

          <p
            className="animate-fade-up mb-11 max-w-sm text-base leading-relaxed text-muted-foreground"
            style={{ animationDelay: "140ms" }}
          >
            Submit feedback for any LA, or sign in to manage observations and
            view your feedback.
          </p>

          <div
            className="animate-fade-up flex flex-wrap items-center gap-3"
            style={{ animationDelay: "210ms" }}
          >
            <Button
              render={<Link href="/feedback" />}
              size="lg"
              className="gap-2 px-7"
            >
              Give Feedback
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              render={<Link href="/login" />}
              variant="outline"
              size="lg"
              className="px-7"
            >
              LA Portal
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs text-muted-foreground/50">
            Made with &lt;3 by PDT
          </p>
        </div>
      </footer>
    </div>
  );
}
