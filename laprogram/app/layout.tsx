import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: {
    default: "LA Program",
    template: "%s | LA Program",
  },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="en" className={cn(inter.variable, "font-sans", "antialiased")}>
      <body className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-8 py-5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/" className="text-base font-semibold tracking-tight">
              UCLA LA Program
            </Link>
            {session ? (
              session.user.name
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </header>
        {children}
        <Toaster position="top-center" offset="16px" mobileOffset="16px" />
        <footer className="relative z-10 px-8 py-6">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs text-muted-foreground/50">
              Made with &lt;3 by the LA Program PDT
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
