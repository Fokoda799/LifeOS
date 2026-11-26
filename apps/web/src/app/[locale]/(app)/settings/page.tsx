import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { PreferencesForm } from "@/features/settings/preferences-form";
import { ProfileForm } from "@/features/settings/profile-form";
import { SettingsSection } from "@/features/settings/settings-section";
import { DataSection } from "@/features/settings/data-section";

export default function SettingsPage() {
  const t = useTranslations("Settings");

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <SettingsSection title={t("profileTitle")} description={t("profileDescription")}>
        <ProfileForm />
      </SettingsSection>
      <SettingsSection title={t("preferencesTitle")} description={t("preferencesDescription")}>
        <PreferencesForm />
      </SettingsSection>
      <SettingsSection title={t("appearanceTitle")} description={t("appearanceDescription")}>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </SettingsSection>
      <DataSection />
    </div>
  );
}
