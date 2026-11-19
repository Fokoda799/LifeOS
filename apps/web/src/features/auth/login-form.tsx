"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@lifeos/shared";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthCard } from "./auth-card";
import { apiErrorKey, validationKey } from "./errors";
import { FormField } from "./form-field";
import { useLogin } from "./use-auth";

export function LoginForm() {
  const t = useTranslations("Auth");
  const tv = useTranslations("Validation");
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailKey = validationKey(errors.email);
  const passwordKey = validationKey(errors.password);

  return (
    <AuthCard
      title={t("loginTitle")}
      description={t("loginSubtitle")}
      footer={
        <>
          {t("noAccount")}
          <Link href="/register" className="font-bold text-primary hover:underline">
            {t("signUp")}
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit((values) =>
          login.mutate(values, { onSuccess: () => router.replace("/dashboard") }),
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
        <FormField
          id="password"
          label={t("password")}
          type="password"
          dir="ltr"
          autoComplete="current-password"
          error={passwordKey && tv(passwordKey)}
          {...register("password")}
        />
        {login.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${apiErrorKey(login.error)}`)}
          </p>
        )}
        <Button type="submit" size="lg" disabled={login.isPending}>
          {login.isPending ? t("submitting") : t("signIn")}
        </Button>
      </form>
    </AuthCard>
  );
}
