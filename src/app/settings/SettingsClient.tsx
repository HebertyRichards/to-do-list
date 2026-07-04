"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { DangerZone } from "@/components/settings/DangerZone";
import { useTranslations } from "next-intl";

export default function SettingsClient() {
  const t = useTranslations("pages");
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth");
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell title={t("settings")}>
      <div className="mx-auto max-w-xl space-y-8 p-6">
        <ProfileSection key={user.username} username={user.username} avatarUrl={user.avatar_url ?? ""} />
        <EmailSection key={user.email} email={user.email} />
        <PasswordSection />
        <DangerZone />
      </div>
    </AppShell>
  );
}
