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
import { useRegisterStart } from "./use-register-flow";

const schema = startVerificationSchema.pick({ email: true });
type Values = { email: string };

export function RegisterEmailForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const locale = useLocale() as StartVerificationInput["locale"];
  const router = useRouter();
  const flow = useRegisterFlow();
  const start = useRegisterStart();
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
      title={t("registerTitle")}
      description={t("emailStepSubtitle")}
      footer={
        <>
          {t("haveAccount")}
          <Link href="/login" className="font-bold text-primary hover:underline">
            {t("signIn")}
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          start.mutate(
            { email: values.email, locale },
            {
              onSuccess: () => {
                flow.setEmail(values.email);
                flow.setToken(null);
                flow.setSentAt(Date.now());
                router.push("/register/verify");
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
        {start.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${apiErrorKey(start.error)}`)}
          </p>
        )}
        <Button type="submit" size="lg" disabled={start.isPending}>
          {start.isPending ? t("submitting") : t("continue")}
        </Button>
      </form>
    </AuthCard>
  );
}
