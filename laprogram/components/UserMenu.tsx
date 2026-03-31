"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await authClient.signOut();
            router.push("/");
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
