import { Geist_Mono, Geist, Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        fontMono.variable,
        inter.variable,
        "font-sans",
        "antialiased",
      )}
    >
      <body className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-8 py-5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/" className="text-base font-semibold tracking-tight">
              UCLA LA Program
            </Link>
            <Button render={<Link href="/login" />} variant="outline">
              Sign In
            </Button>
          </div>
        </header>
        {children}
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
