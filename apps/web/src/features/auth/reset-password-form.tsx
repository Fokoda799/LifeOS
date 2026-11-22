"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@lifeos/shared";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "./auth-card";
import { apiErrorKey, validationKey } from "./errors";
import { PasswordField } from "./password-field";
import { useRegisterFlow } from "./register-flow";
import { usePasswordReset } from "./use-password-reset";

const schema = resetPasswordSchema.pick({ password: true });
type Values = { password: string };

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const router = useRouter();
  const flow = useRegisterFlow();
  const reset = usePasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  // No verified token in memory (refresh, direct visit): go back to step 1.
  useEffect(() => {
    if (!flow.token) router.replace("/forgot-password");
  }, [flow.token, router]);
  if (!flow.token) return null;
  const token = flow.token;

  const passwordKey = validationKey(errors.password, { tooSmall: "passwordMin" });
  const errorKey = reset.isError ? apiErrorKey(reset.error, "sessionExpired") : null;

  return (
    <AuthCard
      eyebrow={t("step", { current: 3, total: 3 })}
      title={t("resetTitle")}
      description={t("resetSubtitle")}
      footer={null}
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          reset.mutate(
            { ...values, token },
            {
              onSuccess: () => {
                toast.success(t("resetDone"));
                window.location.replace(`/${locale}/login`);
              },
            },
          ),
        )}
      >
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
              <Link href="/forgot-password" className="font-bold text-primary hover:underline">
                {t("startOver")}
              </Link>
            )}
          </p>
        )}
        <Button type="submit" size="lg" disabled={reset.isPending}>
          {reset.isPending ? t("submitting") : t("resetSubmit")}
        </Button>
      </form>
    </AuthCard>
  );
}
