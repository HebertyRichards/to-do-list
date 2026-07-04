import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { TrpcProvider } from "@/providers/trpc";
import { AuthProvider } from "@/providers/auth";
import { NotificationsProvider } from "@/providers/notifications";
import { ThemeProvider } from "@/providers/theme";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("title"), description: t("description") };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <ThemeProvider nonce={nonce} attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TrpcProvider>
              <AuthProvider>
                <NotificationsProvider>
                  {children}
                </NotificationsProvider>
              </AuthProvider>
            </TrpcProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
