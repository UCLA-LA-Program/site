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
import { PageBackground } from "@/components/page-background";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email")?.toString();
    if (!email) return;

    setLoading(true);
    await authClient.signIn.magicLink({ email });
    setLoading(false);
    setSubmittedEmail(email);
    setCooldown(15);
  }

  async function handleResend() {
    if (!submittedEmail) return;
    setLoading(true);
    await authClient.signIn.magicLink({ email: submittedEmail });
    setLoading(false);
    setCooldown(15);
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
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className="gap-2"
              >
                {loading ? (
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
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="flex flex-col gap-3">
                <Input
                  type="email"
                  name="email"
                  placeholder="openquestion@g.ucla.edu"
                  required
                  autoFocus
                />
                <Button type="submit" disabled={loading} className="gap-2">
                  Continue
                  {loading ? (
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
