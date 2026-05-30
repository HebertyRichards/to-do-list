import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { TrpcProvider } from "@/providers/trpc";
import { AuthProvider } from "@/providers/auth";
import { NotificationsProvider } from "@/providers/notifications";
import { ThemeProvider } from "@/providers/theme";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "To-Do List",
  description: "Gerencie suas tarefas individuais e em grupo",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col">
        <ThemeProvider nonce={nonce} attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TrpcProvider>
            <AuthProvider>
              <NotificationsProvider>
                {children}
              </NotificationsProvider>
            </AuthProvider>
          </TrpcProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
