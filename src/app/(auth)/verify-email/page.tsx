"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VerifyStatus = "idle" | "loading" | "success" | "invalid" | "expired";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const mode = params.get("mode");
  const emailFromQuery = params.get("email") || "";

  const [status, setStatus] = useState<VerifyStatus>(token ? "loading" : "idle");
  const [email, setEmail] = useState(emailFromQuery);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function verify() {
      setStatus("loading");

      const response = await fetch("/api/email-verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (cancelled) return;

      if (response.ok) {
        setStatus("success");
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { status?: VerifyStatus }
        | null;

      if (payload?.status === "expired") {
        setStatus("expired");
        return;
      }

      setStatus("invalid");
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Redirect after successful verification
  useEffect(() => {
    if (status !== "success") return;

    toast.success("Email verified successfully!");

    const redirectTimer = setTimeout(() => {
      if (mode === "pending") {
        // User came from signup flow, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User verified email independently, redirect to signin
        router.push("/signin");
      }
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [status, mode, router]);

  const description = useMemo(() => {
    if (status === "loading") return "We are validating your verification token.";
    if (status === "success") return "Your email is verified. You can now sign in.";
    if (status === "invalid") return "This verification link is invalid or has already been used.";
    if (status === "expired") return "This verification link expired. Request a new one below.";

    if (mode === "pending") {
      return "Check your inbox and click the verification link to activate your account.";
    }

    return "Use the email link you received to verify your account.";
  }, [mode, status]);

  const onResend = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    setResending(true);

    const response = await fetch("/api/email-verification/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setResending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      toast.error(payload?.message || "Could not send verification email.");
      return;
    }

    toast.success("Verification email sent. Please check your inbox.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border border-primary border-t-transparent rounded-full" />
            </div>
          )}
          {status === "success" && (
            <div className="flex justify-center py-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Redirecting to {mode === "pending" ? "dashboard" : "sign in"}...</p>
              </div>
            </div>
          )}
          {(status === "idle" || status === "invalid" || status === "expired" || mode === "pending") && (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button
                type="button"
                className="w-full"
                onClick={onResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between text-sm">
          <Link href="/signin" className="text-primary underline">
            Go to Sign In
          </Link>
          <Link href="/signup" className="text-primary underline">
            Create another account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
