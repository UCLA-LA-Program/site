import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance",
};

export default function MaintenancePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8">
      <h1 className="text-2xl font-bold tracking-tight">Under Maintenance</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;re currently performing maintenance. Please check back shortly.
      </p>
    </main>
  );
}
