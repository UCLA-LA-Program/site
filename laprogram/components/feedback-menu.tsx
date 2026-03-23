"use client";

import Link from "next/link";
import { MessageSquarePlus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FeedbackMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">Feedback</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href="/feedback">
            <MessageSquarePlus />
            Give Feedback
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/feedback/view">
            <Eye />
            View Feedback
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
