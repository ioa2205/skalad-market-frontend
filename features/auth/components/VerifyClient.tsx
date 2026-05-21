"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthStatus } from "@/components/feedback";
import { Button } from "@/components/ui/button";

import { useVerify } from "../hooks/useVerify";

const REDIRECT_DELAY_SECONDS = 3;

export interface VerifyClientProps {
  token: string;
}

export function VerifyClient({ token }: VerifyClientProps) {
  const t = useTranslations("auth.verify");
  const tCorrelation = useTranslations("auth");
  const router = useRouter();
  const verify = useVerify();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);

  // Trigger the verification request once on mount.
  useEffect(() => {
    if (!token) return;
    verify.mutate(token);
    // verify is stable from useMutation — exhaustive-deps won't cause a re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // On success, count down then push to /login?verified=1.
  useEffect(() => {
    if (!verify.isSuccess) return;
    setSecondsLeft(REDIRECT_DELAY_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(interval);
          router.push("/login?verified=1");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [verify.isSuccess, router]);

  if (verify.isPending || verify.isIdle) {
    return <AuthStatus variant="pending" title={t("pendingTitle")} />;
  }

  if (verify.isSuccess) {
    return (
      <AuthStatus
        variant="success"
        title={t("successTitle")}
        body={
          <>
            {t("successBody")}{" "}
            <span aria-live="polite">
              {t("redirectingIn", { seconds: secondsLeft })}
            </span>
          </>
        }
        footer={
          <Button asChild variant="outline">
            <Link href="/login?verified=1">{t("backToLogin")}</Link>
          </Button>
        }
      />
    );
  }

  const correlationId = verify.error?.correlationId;
  return (
    <AuthStatus
      variant="error"
      title={t("errorTitle")}
      body={t("errorBody")}
      correlationId={
        correlationId
          ? tCorrelation("correlationId", { id: correlationId })
          : undefined
      }
      footer={
        <Button asChild>
          <Link href="/login">{t("backToLogin")}</Link>
        </Button>
      }
    />
  );
}
