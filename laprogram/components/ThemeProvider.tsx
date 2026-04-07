"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={[
        "light",
        "dark",
        "system",
        "pink",
        "blue",
        "emerald",
        "pastel",
        "purple",
        "amber",
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
