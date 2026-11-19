"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@lifeos/shared";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "./auth-card";
import { apiErrorKey, validationKey } from "./errors";
import { FormField } from "./form-field";
import { useRegister } from "./use-auth";

const formSchema = registerSchema.pick({ email: true, password: true, name: true });
type FormValues = Pick<RegisterInput, "email" | "password" | "name">;

export function RegisterForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const locale = useLocale() as RegisterInput["locale"];
  const router = useRouter();
  const signUp = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", name: undefined },
  });

  const nameKey = validationKey(errors.name);
  const emailKey = validationKey(errors.email);
  const passwordKey = validationKey(errors.password, { tooSmall: "passwordMin" });

  return (
    <AuthCard
      title={t("registerTitle")}
      description={t("registerSubtitle")}
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
          signUp.mutate(
            { ...values, locale, currency: "MAD" },
            { onSuccess: () => router.replace("/dashboard") },
          ),
        )}
      >
        <FormField
          id="name"
          label={t("name")}
          autoComplete="name"
          dir="auto"
          error={nameKey && tv(nameKey)}
          {...register("name", { setValueAs: (v: string) => (v === "" ? undefined : v) })}
        />
        <FormField
          id="email"
          label={t("email")}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={emailKey && tv(emailKey)}
          {...register("email")}
        />
        <FormField
          id="password"
          label={t("password")}
          type="password"
          dir="ltr"
          autoComplete="new-password"
          error={passwordKey && tv(passwordKey)}
          {...register("password")}
        />
        {signUp.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${apiErrorKey(signUp.error)}`)}
          </p>
        )}
        <Button type="submit" size="lg" disabled={signUp.isPending}>
          {signUp.isPending ? t("submitting") : t("signUp")}
        </Button>
      </form>
    </AuthCard>
  );
}
