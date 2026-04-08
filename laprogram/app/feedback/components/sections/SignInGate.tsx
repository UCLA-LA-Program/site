"use client";

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

export function SignInGate() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
      <LogIn className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        LAs must login to submit Head LA & Observation feedback.
      </p>
      <Button asChild size="sm">
        <Link href="/login?redirect=/feedback">Login</Link>
      </Button>
    </div>
  );
}
