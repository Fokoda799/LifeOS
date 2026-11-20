import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
// import { GuestRedirect } from "@/features/auth/guest-redirect";
import { ToolShowcase } from "@/features/tools/tool-showcase";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-[96rem] gap-6 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12 lg:p-6">
      <main className="flex flex-col gap-8 ">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold text-primary">
            LifeOS
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
      <ToolShowcase />
    </div>
  );
}
