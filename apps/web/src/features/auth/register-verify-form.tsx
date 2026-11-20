"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { verifyCodeSchema, type StartVerificationInput } from "@lifeos/shared";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "./auth-card";
import { apiErrorKey, validationKey } from "./errors";
import { useRegisterFlow } from "./register-flow";
import { useRegisterStart, useRegisterVerify } from "./use-register-flow";

const schema = verifyCodeSchema.pick({ code: true });
type Values = { code: string };
const COOLDOWN_SECONDS = 60;

function useCooldown(startedAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return startedAt ? Math.max(0, COOLDOWN_SECONDS - Math.floor((now - startedAt) / 1000)) : 0;
}

export function RegisterVerifyForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const locale = useLocale() as StartVerificationInput["locale"];
  const router = useRouter();
  const params = useSearchParams();
  const flow = useRegisterFlow();
  const verify = useRegisterVerify();
  const start = useRegisterStart();

  // The email link carries ?email=…&code=…; coming from step 1 the email is in memory.
  const email = params.get("email") ?? flow.email;
  const cooldown = useCooldown(flow.sentAt);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: params.get("code") ?? "" },
  });

  const submit = handleSubmit(({ code }) =>
    verify.mutate(
      { email, code },
      {
        onSuccess: ({ token }) => {
          flow.setEmail(email);
          flow.setToken(token);
          router.replace("/register/complete");
        },
      },
    ),
  );

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  // Submit automatically once all 6 digits are there (typed, pasted or from the link), once per value.
  const code = watch("code");
  const submitted = useRef<string | null>(null);
  useEffect(() => {
    if (code.length < 6) submitted.current = null;
    if (email && /^\d{6}$/.test(code) && submitted.current !== code && !verify.isPending) {
      submitted.current = code;
      void submit();
    }
  }, [code, email, submit, verify.isPending]);

  if (!email) return null;
  const codeKey = validationKey(errors.code, { tooSmall: "code", invalidFormat: "code" });

  return (
    <AuthCard
      eyebrow={t("step", { current: 2, total: 3 })}
      title={t("verifyTitle")}
      description={t.rich("verifySubtitle", {
        address: email,
        email: (chunks) => (
          <bdi dir="ltr" className="font-bold text-foreground">
            {chunks}
          </bdi>
        ),
      })}
      footer={
        <Link href="/register" className="font-bold text-primary hover:underline">
          {t("changeEmail")}
        </Link>
      }
    >
      <form noValidate className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="code">{t("code")}</Label>
          <Input
            id="code"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            autoFocus
            aria-invalid={!!codeKey || verify.isError}
            aria-describedby="code-error"
            className="h-14 text-center text-2xl font-extrabold tracking-[0.5em]"
            {...register("code", {
              setValueAs: (v: string) => v.replace(/\D/g, "").slice(0, 6),
            })}
          />
          {(codeKey || verify.isError) && (
            <p id="code-error" role="alert" className="text-sm text-destructive">
              {codeKey ? tv(codeKey) : t(`errors.${apiErrorKey(verify.error, "invalidCode")}`)}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" disabled={verify.isPending}>
          {verify.isPending ? t("verifying") : t("verify")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={cooldown > 0 || start.isPending}
          onClick={() =>
            start.mutate(
              { email, locale },
              {
                onSuccess: () => {
                  flow.setSentAt(Date.now());
                  toast.success(t("codeResent"));
                },
              },
            )
          }
        >
          {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resend")}
        </Button>
      </form>
    </AuthCard>
  );
}
