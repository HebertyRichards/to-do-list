"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/use-profile";

export default function OnboardingModal() {
  const [open, setOpen] = useState(true);
  const update = useUpdateProfile();

  const finish = () => {
    if (update.isPending) return;
    update.mutate({ onboarded: true }, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bem-vindo ao To-Do List!</DialogTitle>
          <DialogDescription>Um resumo rápido de como tudo funciona.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-foreground-muted">
          <section>
            <p className="font-semibold mb-1">📋 Modo Individual</p>
            <p>Crie categorias (ex: Trabalho, Pessoal), organize tarefas dentro delas com subtarefas, tags e datas de início/prazo.</p>
          </section>

          <section>
            <p className="font-semibold mb-1">👥 Modo Grupo</p>
            <p>Crie um grupo — você será o admin e receberá uma <strong>chave única</strong> para compartilhar. Outros usuários entram com a chave; você aprova ou recusa. Membros criam tarefas, e ao sair, suas tarefas são removidas.</p>
          </section>

          <section>
            <p className="font-semibold mb-1">🔔 Notificações</p>
            <p>Você recebe notificações em tempo real sobre solicitações de entrada, atribuições de tarefas e ações do grupo.</p>
          </section>

          <section>
            <p className="font-semibold mb-1">📁 Categorias → Tarefas → Subtarefas</p>
            <p>Cada tarefa e subtarefa tem data de início e prazo obrigatórios. Subtarefas podem ser atribuídas a membros específicos do grupo.</p>
          </section>
        </div>

        <Button onClick={finish} disabled={update.isPending} className="w-full">
          {update.isPending ? "Salvando..." : "Entendi, vamos começar!"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
