"use client";

import Link from "next/link";
import { CalendarClock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ObservationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">Observations</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href="/observations/schedule">
            <CalendarClock />
            Schedule Observations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/observations/signup">
            <UserPlus />
            Observation Sign-ups
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
