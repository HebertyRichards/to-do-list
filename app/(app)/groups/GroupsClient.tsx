"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMyGroups, useCreateGroup, useJoinGroup } from "@/src/hooks/use-groups";
import { getErrorMessage } from "@/src/errors/codes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ChevronLeft, Users, Plus, Key, Copy, Check, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/src/components/layout/ThemeToggle";
import type { GroupCreated } from "@/src/types/api";

const createSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120, "Máximo 120 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
});
const joinSchema = z.object({
  key: z.string().min(1, "Chave obrigatória"),
});

type CreateFields = z.infer<typeof createSchema>;
type JoinFields = z.infer<typeof joinSchema>;

export default function GroupsClient() {
  const [activeTab, setActiveTab] = useState("my-groups");
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const [groupSlug, setGroupSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: groups = [], isLoading, refetch } = useMyGroups();
  const create = useCreateGroup();
  const join = useJoinGroup();

  const createForm = useForm<CreateFields>({ resolver: zodResolver(createSchema) });
  const joinForm = useForm<JoinFields>({ resolver: zodResolver(joinSchema) });

  const onCreateSubmit = (data: CreateFields) => {
    create.mutate(data, {
      onSuccess: (res: GroupCreated) => {
        setGroupKey(res.key);
        setGroupSlug(res.slug);
        toast.success("Grupo criado com sucesso!");
        refetch();
      },
    });
  };

  const onJoinSubmit = (data: JoinFields) => {
    join.mutate(data, {
      onSuccess: () => {
        joinForm.reset();
        toast.success("Solicitação de entrada enviada!");
      },
    });
  };

  const copyToClipboard = () => {
    if (!groupKey) return;
    navigator.clipboard.writeText(groupKey);
    setCopied(true);
    toast.success("Chave copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val !== "create") {
      setGroupKey(null);
      setGroupSlug(null);
      createForm.reset();
    }
    if (val !== "join") {
      joinForm.reset();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-surface px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Painel
            </Link>
          </Button>
          <span className="font-semibold text-lg">Grupos</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="my-groups">Meus Grupos</TabsTrigger>
              <TabsTrigger value="create">Criar Grupo</TabsTrigger>
              <TabsTrigger value="join">Entrar</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-groups" className="outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg bg-surface min-h-[350px] space-y-4">
                <div className="rounded-full bg-surface-secondary p-4">
                  <Users className="h-8 w-8 text-foreground-subtle" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-semibold">Nenhum grupo encontrado</h3>
                  <p className="text-sm text-foreground-muted">
                    Você ainda não faz parte de nenhum grupo de tarefas. Crie um novo grupo para gerenciar tarefas com sua equipe, ou entre em um existente utilizando uma chave.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setActiveTab("create")} variant="default">
                    <Plus className="h-4 w-4 mr-1" />
                    Criar Grupo
                  </Button>
                  <Button onClick={() => setActiveTab("join")} variant="secondary">
                    <Key className="h-4 w-4 mr-1" />
                    Usar Chave
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <Link key={group.slug} href={`/groups/${group.slug}`} className="block group">
                    <Card className="h-full border border-border bg-surface hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors truncate">
                          {group.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-foreground-muted line-clamp-3">
                          {group.description || <span className="italic text-foreground-subtle">Sem descrição</span>}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="flex items-center gap-1.5 text-xs text-foreground-muted">
                            <Users className="h-3.5 w-3.5" />
                            {group.member_count} {group.member_count === 1 ? "membro" : "membros"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Acessar <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="outline-none">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Criar Novo Grupo</CardTitle>
              </CardHeader>
              <CardContent>
                {groupKey ? (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-success font-medium text-sm">
                        <Check className="h-4 w-4" />
                        Grupo criado com sucesso!
                      </div>
                      <p className="text-xs text-foreground-muted">
                        Guarde a chave de acesso abaixo. Você precisará dela para que outros usuários possam entrar no grupo. <strong className="text-foreground">Esta chave não será exibida novamente!</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-foreground-muted">Chave de Acesso</label>
                      <div className="flex gap-2">
                        <code className="flex-1 block rounded border bg-surface-secondary px-3 py-2.5 text-xs font-mono break-all select-all">
                          {groupKey}
                        </code>
                        <Button type="button" onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0 h-10 w-10">
                          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button asChild className="w-full">
                        <Link href={`/groups/${groupSlug}`}>
                          Acessar Quadro do Grupo
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Link>
                      </Button>
                      <Button type="button" onClick={() => handleTabChange("create")} variant="ghost" className="w-full">
                        Criar Outro Grupo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    {create.error && (
                      <p className="text-sm text-destructive">{getErrorMessage(create.error.data?.code ?? "")}</p>
                    )}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Nome do Grupo</label>
                      <input
                        {...createForm.register("name")}
                        placeholder="Ex: Time de Desenvolvimento"
                        className="w-full rounded border px-3 py-2 text-sm bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {createForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Descrição (opcional)</label>
                      <textarea
                        {...createForm.register("description")}
                        placeholder="Descreva o propósito deste grupo..."
                        rows={3}
                        className="w-full rounded border px-3 py-2 text-sm bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                      {createForm.formState.errors.description && (
                        <p className="text-xs text-destructive">{createForm.formState.errors.description.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={create.isPending} className="w-full">
                      {create.isPending ? "Criando..." : "Criar Grupo"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="outline-none">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Entrar em um Grupo</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                  {join.error && (
                    <p className="text-sm text-destructive">{getErrorMessage(join.error.data?.code ?? "")}</p>
                  )}
                  {join.isSuccess && (
                    <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex gap-2.5 text-sm text-success">
                      <Check className="h-5 w-5 shrink-0" />
                      <span>Solicitação de entrada enviada! O administrador do grupo foi notificado para aprovar o seu acesso.</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">Chave do Grupo</label>
                    <input
                      {...joinForm.register("key")}
                      placeholder="Cole a chave do grupo aqui"
                      className="w-full rounded border px-3 py-2 text-sm font-mono bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {joinForm.formState.errors.key && (
                      <p className="text-xs text-destructive">{joinForm.formState.errors.key.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={join.isPending} className="w-full">
                    {join.isPending ? "Enviando solicitação..." : "Solicitar Entrada"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
