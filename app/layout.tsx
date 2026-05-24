import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TrpcProvider } from "@/src/providers/trpc";
import { AuthProvider } from "@/src/providers/auth";
import { NotificationsProvider } from "@/src/providers/notifications";
import { ThemeProvider } from "@/src/providers/theme";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "To-Do List",
  description: "Gerencie suas tarefas individuais e em grupo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
