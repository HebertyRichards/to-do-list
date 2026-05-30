"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useDeleteAccount } from "@/hooks/use-auth";

export default function SettingsClient() {
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
    <AppShell title="Configurações">
      <div className="mx-auto max-w-xl space-y-8 p-6">
        <ProfileSection
          key={user.username}
          username={user.username}
          avatarUrl={user.avatar_url ?? ""}
        />
        <DangerZone />
      </div>
    </AppShell>
  );
}

function ProfileSection({ username, avatarUrl }: { username: string; avatarUrl: string }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(username);
  const [avatar, setAvatar] = useState(avatarUrl);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    update.mutate(
      { username: name.trim() || undefined, avatar_url: avatar.trim() || null },
      { onSuccess: () => toast.success("Perfil atualizado.") },
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Perfil</h1>
        <p className="text-sm text-foreground-muted">
          Atualize seu nome de usuário e avatar.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {avatar.trim() && <AvatarImage src={avatar} alt={name} />}
          <AvatarFallback className="text-lg uppercase">{name[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-foreground-muted">@{name}</span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="set-username">Nome de usuário</Label>
          <Input
            id="set-username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={60}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="set-avatar">URL do avatar (opcional)</Label>
          <Input
            id="set-avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </section>
  );
}

function DangerZone() {
  const del = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;
    del.mutate({ password });
  };

  return (
    <section className="space-y-3 rounded-lg border border-destructive/30 p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Zona de perigo
      </div>
      <p className="text-sm text-foreground-muted">
        Excluir sua conta é permanente. Grupos que você criou também serão removidos.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Excluir minha conta
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setPassword("");
            setOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir conta</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. Confirme sua senha para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="del-pwd">Senha atual</Label>
              <Input
                id="del-pwd"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={del.isPending}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={del.isPending || !password}>
                {del.isPending ? "Excluindo..." : "Excluir conta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
