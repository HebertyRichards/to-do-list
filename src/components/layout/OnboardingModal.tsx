"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth";

export default function OnboardingModal() {
  const [open, setOpen] = useState(true);
  const { refetch } = useAuth();

  const handleClose = async () => {
    try {
      await fetch("/api-internal/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ onboarded: true }),
      });
      refetch();
    } finally {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold">Bem-vindo ao To-Do List!</h2>

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

        <button
          onClick={handleClose}
          className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Entendi, vamos começar!
        </button>
      </div>
    </div>
  );
}
