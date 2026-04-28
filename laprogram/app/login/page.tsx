import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { Login } from "./Login";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let { redirect: redirectTo } = await searchParams;
  if (redirectTo && redirectTo[0] !== "/") {
    redirectTo = "/";
  }

  if (session) {
    redirect(redirectTo ?? "/");
  }

  return (
    <Login
      callbackURL={redirectTo}
      sitekey={process.env.TURNSTILE_SITE_KEY ?? ""}
    />
  );
}
