import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { Admin } from "./Admin";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    notFound();
  }

  return <Admin />;
}
