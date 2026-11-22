"use client";

import { useTranslations } from "next-intl";
import { useRegisterStart, useRegisterVerify } from "./use-register-flow";
import { VerifyStep } from "./verify-step";

export function RegisterVerifyForm() {
  const t = useTranslations("Auth");
  const start = useRegisterStart();
  const verify = useRegisterVerify();
  return (
    <VerifyStep
      step={2}
      total={3}
      title={t("verifyTitle")}
      backHref="/register"
      nextHref="/register/complete"
      start={start}
      verify={verify}
    />
  );
}
