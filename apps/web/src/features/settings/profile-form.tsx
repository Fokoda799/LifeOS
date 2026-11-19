"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@lifeos/shared";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validationKey } from "@/features/auth/errors";
import { FormField } from "@/features/auth/form-field";
import { useMe } from "@/features/auth/use-auth";
import { useUpdateProfile } from "./use-update-profile";

const schema = updateProfileSchema.pick({ name: true });
type Values = Pick<UpdateProfileInput, "name">;

export function ProfileForm() {
  const t = useTranslations("Settings");
  const tv = useTranslations("Validation");
  const ta = useTranslations("Auth");
  const { data: user } = useMe();
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? "" },
  });
  const nameKey = validationKey(errors.name);

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={handleSubmit((values) =>
        update.mutate(values, {
          onSuccess: () => toast.success(t("saved")),
          onError: () => toast.error(t("saveError")),
        }),
      )}
    >
      <FormField
        id="name"
        label={t("name")}
        dir="auto"
        autoComplete="name"
        error={nameKey && tv(nameKey)}
        {...register("name", {
          setValueAs: (v: string) => (v.trim() === "" ? null : v),
        })}
      />
      <FormField
        id="email"
        label={ta("email")}
        value={user?.email ?? ""}
        dir="ltr"
        readOnly
        className="text-muted-foreground"
      />
      <Button type="submit" disabled={!isDirty || update.isPending} className="justify-self-start">
        {update.isPending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
