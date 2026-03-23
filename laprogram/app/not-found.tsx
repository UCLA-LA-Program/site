import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-20">
      <p className="mb-4 text-sm font-mediumuppercase">404</p>
      <h1 className="mb-3 text-4xl">Page not found</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild variant="outline">
        <Link href="/">
          Go home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </main>
  );
}
