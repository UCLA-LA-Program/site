import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import SignUp from "./SignUp";

export const metadata: Metadata = {
  title: "Observation Sign-Ups",
};

export default async function ObservationsPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <SignUp />;
}
