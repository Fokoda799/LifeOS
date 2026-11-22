"use client";

import { useTranslations } from "next-intl";
import { usePasswordForgot, usePasswordVerify } from "./use-password-reset";
import { VerifyStep } from "./verify-step";

export function ForgotVerifyForm() {
  const t = useTranslations("Auth");
  const start = usePasswordForgot();
  const verify = usePasswordVerify();
  return (
    <VerifyStep
      step={2}
      total={3}
      title={t("verifyTitle")}
      backHref="/forgot-password"
      nextHref="/forgot-password/reset"
      start={start}
      verify={verify}
    />
  );
}
