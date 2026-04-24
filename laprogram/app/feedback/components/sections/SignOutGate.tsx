"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutGate() {
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
      <LogOut className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        LAs can not submit feedback as a TA. Log out to continue.
      </p>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await authClient.signOut();
          window.location.reload();
        }}
      >
        {pending ? "Logging out…" : "Log out"}
      </Button>
    </div>
  );
}
