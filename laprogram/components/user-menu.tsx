"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <CircleUser />
          {name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-0">
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await authClient.signOut();
            router.refresh();
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
