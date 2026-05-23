"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGroup, useJoinGroup } from "@/src/hooks/use-groups";
import { getErrorMessage } from "@/src/errors/codes";
import type { GroupCreated } from "@/src/types/api";

type View = "home" | "create" | "join";

const createSchema = z.object({ name: z.string().min(1, "Nome obrigatório").max(120, "Máximo 120 caracteres") });
const joinSchema = z.object({ key: z.string().min(1, "Chave obrigatória") });

type CreateFields = z.infer<typeof createSchema>;
type JoinFields = z.infer<typeof joinSchema>;

export default function GroupsClient() {
  const [view, setView] = useState<View>("home");
  const [groupKey, setGroupKey] = useState<string | null>(null);

  const create = useCreateGroup();
  const join = useJoinGroup();

  const createForm = useForm<CreateFields>({ resolver: zodResolver(createSchema) });
  const joinForm = useForm<JoinFields>({ resolver: zodResolver(joinSchema) });

  const onCreateSubmit = (data: CreateFields) => {
    create.mutate(data, {
      onSuccess: (res: GroupCreated) => setGroupKey(res.key),
    });
  };

  const onJoinSubmit = (data: JoinFields) => {
    join.mutate(data);
  };

  if (view === "home") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Grupos</h1>
        <div className="flex gap-4">
          <button onClick={() => setView("create")} className="rounded bg-blue-600 px-6 py-3 text-white font-medium">
            Criar grupo
          </button>
          <button onClick={() => setView("join")} className="rounded border px-6 py-3 font-medium">
            Entrar em um grupo
          </button>
        </div>
        <a href="/dashboard" className="text-sm text-gray-500 underline">Voltar</a>
      </main>
    );
  }

  if (view === "create") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold">Criar grupo</h2>

          {groupKey ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700 font-medium">Grupo criado! Guarde a chave abaixo — ela só é exibida uma vez:</p>
              <code className="block w-full rounded bg-gray-100 px-4 py-3 text-sm break-all font-mono">{groupKey}</code>
              <button onClick={() => navigator.clipboard.writeText(groupKey)} className="text-sm text-blue-600 underline">
                Copiar chave
              </button>
              <a href="/dashboard" className="block text-center text-sm text-gray-500 underline">Ir para o dashboard</a>
            </div>
          ) : (
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              {create.error && (
                <p className="text-sm text-red-600">{getErrorMessage(create.error.data?.code ?? "")}</p>
              )}
              <div className="space-y-1">
                <label className="block text-sm font-medium">Nome do grupo</label>
                <input
                  {...createForm.register("name")}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                {createForm.formState.errors.name && (
                  <p className="text-xs text-red-600">{createForm.formState.errors.name.message}</p>
                )}
              </div>
              <button type="submit" disabled={create.isPending} className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60">
                {create.isPending ? "Criando..." : "Criar"}
              </button>
              <button type="button" onClick={() => setView("home")} className="w-full text-sm text-gray-500 underline">
                Voltar
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold">Entrar em grupo</h2>
        <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
          {join.error && (
            <p className="text-sm text-red-600">{getErrorMessage(join.error.data?.code ?? "")}</p>
          )}
          {join.isSuccess && (
            <p className="text-sm text-green-700">Solicitação enviada! Aguarde a aprovação do admin.</p>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Chave do grupo</label>
            <input
              {...joinForm.register("key")}
              placeholder="Cole a chave aqui"
              className="w-full rounded border px-3 py-2 text-sm font-mono"
            />
            {joinForm.formState.errors.key && (
              <p className="text-xs text-red-600">{joinForm.formState.errors.key.message}</p>
            )}
          </div>
          <button type="submit" disabled={join.isPending} className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60">
            {join.isPending ? "Enviando..." : "Solicitar entrada"}
          </button>
          <button type="button" onClick={() => setView("home")} className="w-full text-sm text-gray-500 underline">
            Voltar
          </button>
        </form>
      </div>
    </main>
  );
}
