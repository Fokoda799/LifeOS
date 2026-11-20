"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerCompleteSchema, type RegisterCompleteInput } from "@lifeos/shared";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "./auth-card";
import { apiErrorKey, validationKey } from "./errors";
import { FormField } from "./form-field";
import { PasswordField } from "./password-field";
import { useRegisterFlow } from "./register-flow";
import { useRegisterComplete } from "./use-register-flow";

const schema = registerCompleteSchema.pick({ password: true, name: true });
type Values = Pick<RegisterCompleteInput, "password" | "name">;

export function RegisterCompleteForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const locale = useLocale() as RegisterCompleteInput["locale"];
  const router = useRouter();
  const flow = useRegisterFlow();
  const complete = useRegisterComplete();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", name: undefined },
  });

  // No verified token in memory (refresh, direct visit): go back to step 1.
  useEffect(() => {
    if (!flow.token) router.replace("/register");
  }, [flow.token, router]);
  if (!flow.token) return null;
  const token = flow.token;

  const nameKey = validationKey(errors.name);
  const passwordKey = validationKey(errors.password, { tooSmall: "passwordMin" });
  const errorKey = complete.isError ? apiErrorKey(complete.error, "sessionExpired") : null;

  return (
    <AuthCard
      eyebrow={t("step", { current: 3, total: 3 })}
      title={t("completeTitle")}
      description={t("completeSubtitle")}
      footer={null}
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          complete.mutate(
            { ...values, token, locale },
            { onSuccess: () => router.replace("/dashboard") },
          ),
        )}
      >
        <FormField
          id="name"
          label={t("name")}
          dir="auto"
          autoComplete="name"
          error={nameKey && tv(nameKey)}
          {...register("name", { setValueAs: (v: string) => (v.trim() === "" ? undefined : v) })}
        />
        <PasswordField
          id="password"
          label={t("password")}
          autoComplete="new-password"
          error={passwordKey && tv(passwordKey)}
          {...register("password")}
        />
        {errorKey && (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${errorKey}`)}{" "}
            {errorKey === "sessionExpired" && (
              <Link href="/register" className="font-bold text-primary hover:underline">
                {t("startOver")}
              </Link>
            )}
          </p>
        )}
        <Button type="submit" size="lg" disabled={complete.isPending}>
          {complete.isPending ? t("submitting") : t("signUp")}
        </Button>
      </form>
    </AuthCard>
  );
}
