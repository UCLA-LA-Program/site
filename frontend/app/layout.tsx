import { Geist_Mono, Geist } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
        fontSans.variable,
        "font-sans",
        "antialiased",
      )}
    >
      <body>{children}</body>
    </html>
  );
}
