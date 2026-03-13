import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { PageBackground } from "@/components/page-background";

export default function LoginPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const email = formData.get("email");
    // TODO: trigger OTP send for email
    console.log(email);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <PageBackground />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <Card className="animate-fade-up w-full max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a one-time code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                name="email"
                placeholder="openquestion@g.ucla.edu"
                required
                autoFocus
              />
              <Button type="submit" className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
