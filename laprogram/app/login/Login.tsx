"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, RotateCw, Mail } from "lucide-react";
import { PageBackground } from "@/components/PageBackground";
import { useState, useEffect, useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export function Login({
  callbackURL,
  sitekey,
}: {
  callbackURL?: string;
  sitekey: string;
}) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function resetTurnstile() {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  function sendLink(email: string, token: string) {
    startTransition(async () => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token,
          callbackURL: callbackURL ?? "/",
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        toast.error(message || "Something went wrong. Please try again.");
        resetTurnstile();
        return;
      }
      startTransition(() => {
        setSubmittedEmail(email);
        setCooldown(15);
        resetTurnstile();
      });
    });
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <PageBackground />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        {submittedEmail ? (
          <Card className="animate-fade-up w-full max-w-sm shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-center text-2xl">
                Check your email
              </CardTitle>
              <CardDescription className="text-center">
                We sent a login link to{" "}
                <span className="font-medium text-foreground">
                  {submittedEmail}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {cooldown === 0 && (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={sitekey}
                  options={{ size: "flexible" }}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (turnstileToken) sendLink(submittedEmail, turnstileToken);
                }}
                disabled={pending || cooldown > 0 || !turnstileToken}
                className="gap-2"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4" />
                )}
                {cooldown > 0 ? `Resend link (${cooldown}s)` : "Resend link"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSubmittedEmail(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Use a different email
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-fade-up w-full max-w-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you a login link.
                <p className="mt-2 text-xs text-muted-foreground">
                  If you are a S&apos;26 LA, we&apos;ve created an account for
                  you using the email you used to apply to the LA Program!
                  Don&apos;t remember which email that is? Check the{" "}
                  <a
                    href="https://airtable.com/appboW9PSW85WiaBG/shri8amfLacrzmO1u/tblIB5cYh8jdQinds"
                    className="underline-offset-2 hover:underline text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LA Roster
                  </a>
                  .
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={(formData) => {
                  const email = formData.get("email")?.toString();
                  if (email && turnstileToken) sendLink(email, turnstileToken);
                }}
                className="flex flex-col gap-3"
              >
                <Input
                  type="email"
                  name="email"
                  placeholder="openquestion@g.ucla.edu"
                  required
                  autoFocus
                />
                <Turnstile
                  ref={turnstileRef}
                  siteKey={sitekey}
                  options={{ size: "flexible" }}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
                <Button
                  type="submit"
                  disabled={pending || !turnstileToken}
                  className="gap-2"
                >
                  Continue
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
