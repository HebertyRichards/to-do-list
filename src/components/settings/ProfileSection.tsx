"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/use-profile";
import { SettingsSection, LabeledInput } from "./primitives";

type Fields = { username: string; avatar_url: string };

export function ProfileSection({ username, avatarUrl }: { username: string; avatarUrl: string }) {
  const t = useTranslations("settings");
  const update = useUpdateProfile();

  const schema = useMemo(
    () =>
      z.object({
        username: z.string().min(3, t("usernameMin")).max(60),
        avatar_url: z.string().max(500),
      }),
    [t],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { username, avatar_url: avatarUrl },
  });

  const name = useWatch({ control, name: "username" });
  const avatar = useWatch({ control, name: "avatar_url" });

  const onSubmit = handleSubmit((data) =>
    update.mutate(
      { username: data.username.trim() || undefined, avatar_url: data.avatar_url.trim() || null },
      { onSuccess: () => toast.success(t("profileUpdated")) },
    ),
  );

  return (
    <SettingsSection title={t("profileTitle")} description={t("profileDescription")}>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {avatar.trim() && <AvatarImage src={avatar} alt={name} />}
          <AvatarFallback className="text-lg uppercase">{name[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-foreground-muted">@{name}</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <LabeledInput label={t("username")} error={errors.username?.message} {...register("username")} />
        <LabeledInput
          label={t("avatarUrl")}
          placeholder="https://..."
          error={errors.avatar_url?.message}
          {...register("avatar_url")}
        />
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </SettingsSection>
  );
}
