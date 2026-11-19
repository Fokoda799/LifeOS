import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Baloo_Bhaijaan_2, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { isRtl, routing } from "@/i18n/routing";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  display: "swap",
});

const arabic = Baloo_Bhaijaan_2({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeOS",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = routing.locales.includes(localeCookie as (typeof routing.locales)[number])
    ? localeCookie
    : routing.defaultLocale;

  return (
    <html
      lang={locale}
      dir={isRtl(locale ?? routing.defaultLocale) ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${nunito.variable} ${arabic.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
