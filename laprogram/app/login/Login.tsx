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
import { authClient } from "@/lib/auth-client";
import { useState, useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const LAST_EMAIL_KEY = "magic-link-last-email";

async function fetchWaitSeconds(email: string): Promise<number> {
  try {
    const res = await fetch(
      `/api/magic-link/status?email=${encodeURIComponent(email)}`,
    );
    if (!res.ok) return 0;
    const data = (await res.json()) as { waitSeconds?: number };
    return data.waitSeconds ?? 0;
  } catch {
    return 0;
  }
}

function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function Login({ callbackURL }: { callbackURL?: string }) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  // On mount, ask the server about the last email used in this browser. If
  // the server still has an active cooldown, restore the confirmation screen.
  useEffect(() => {
    const lastEmail = window.localStorage.getItem(LAST_EMAIL_KEY);
    if (!lastEmail) return;
    fetchWaitSeconds(lastEmail).then((wait) => {
      if (wait > 0) {
        setSubmittedEmail(lastEmail);
        setCooldown(wait);
      } else {
        window.localStorage.removeItem(LAST_EMAIL_KEY);
      }
    });
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function sendLink(email: string) {
    const normalized = email.trim().toLowerCase();
    startTransition(async () => {
      // Pre-check: if the email is currently rate-limited, show the cooldown
      // without falsely claiming we just sent a new link.
      const preWait = await fetchWaitSeconds(normalized);
      if (preWait > 0) {
        window.localStorage.setItem(LAST_EMAIL_KEY, normalized);
        setSubmittedEmail(email);
        setCooldown(preWait);
        return;
      }

      const { error } = await authClient.signIn.magicLink({
        email: normalized,
        callbackURL: callbackURL ?? "/",
      });
      if (error) {
        toast.error(error.message ?? "Something went wrong. Please try again.");
        return;
      }

      // After the send, the server now holds the next cooldown. Read it back
      // so the button reflects the true wait.
      const postWait = await fetchWaitSeconds(normalized);
      window.localStorage.setItem(LAST_EMAIL_KEY, normalized);
      setSubmittedEmail(email);
      setCooldown(postWait);
    });
  }

  function resetEmail() {
    setSubmittedEmail(null);
    setCooldown(0);
    window.localStorage.removeItem(LAST_EMAIL_KEY);
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
              <Button
                variant="outline"
                onClick={() => sendLink(submittedEmail ?? "")}
                disabled={pending || cooldown > 0}
                className="gap-2"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4" />
                )}
                {cooldown > 0
                  ? `Resend link (${formatCooldown(cooldown)})`
                  : "Resend link"}
              </Button>
              <Button variant="ghost" onClick={resetEmail} className="gap-2">
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
                  if (email) sendLink(email);
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
                <Button type="submit" disabled={pending} className="gap-2">
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
