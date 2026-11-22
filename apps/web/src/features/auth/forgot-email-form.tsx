"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startVerificationSchema, type StartVerificationInput } from "@lifeos/shared";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "./auth-card";
import { apiErrorKey, validationKey } from "./errors";
import { FormField } from "./form-field";
import { useRegisterFlow } from "./register-flow";
import { usePasswordForgot } from "./use-password-reset";

const schema = startVerificationSchema.pick({ email: true });
type Values = { email: string };

export function ForgotEmailForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const locale = useLocale() as StartVerificationInput["locale"];
  const router = useRouter();
  const flow = useRegisterFlow();
  const forgot = usePasswordForgot();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: flow.email },
  });
  const emailKey = validationKey(errors.email);

  return (
    <AuthCard
      eyebrow={t("step", { current: 1, total: 3 })}
      title={t("forgotTitle")}
      description={t("forgotSubtitle")}
      footer={
        <Link href="/login" className="font-bold text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      }
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          forgot.mutate(
            { email: values.email, locale },
            {
              onSuccess: () => {
                flow.setEmail(values.email);
                flow.setToken(null);
                flow.setSentAt(Date.now());
                router.push("/forgot-password/verify");
              },
            },
          ),
        )}
      >
        <FormField
          id="email"
          label={t("email")}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={emailKey && tv(emailKey)}
          {...register("email")}
        />
        {forgot.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${apiErrorKey(forgot.error)}`)}
          </p>
        )}
        <Button type="submit" size="lg" disabled={forgot.isPending}>
          {forgot.isPending ? t("submitting") : t("continue")}
        </Button>
      </form>
    </AuthCard>
  );
}
