"use client";

import { useAuth } from "@/src/providers/auth";
import { useTasks } from "@/src/hooks/use-tasks";
import { useCategories } from "@/src/hooks/use-categories";
import { useLogout } from "@/src/hooks/use-auth";
import OnboardingModal from "@/src/components/layout/OnboardingModal";
import { useNotifications } from "@/src/providers/notifications";
import type { Task, Category } from "@/src/types/api";

export default function DashboardClient() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: categories = [] } = useCategories();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {!user.onboarded && <OnboardingModal />}

      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">To-Do List</span>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {unreadCount} nova{unreadCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-sm text-gray-600">Olá, {user.username}</span>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-red-600 underline"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex flex-1 gap-6 p-6">
        <aside className="w-52 shrink-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Categorias</p>
          {categories.map((cat: Category) => (
            <div key={cat.id} className="rounded px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
              {cat.name}
            </div>
          ))}
        </aside>

        <section className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Minhas Tarefas</h2>
            <a href="/groups" className="text-sm text-blue-600 underline">Grupos</a>
          </div>

          {loadingTasks ? (
            <p className="text-sm text-gray-400">Carregando...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma tarefa ainda.</p>
          ) : (
            tasks.map((task: Task) => (
              <div key={task.id} className="rounded border px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{task.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === "done" ? "bg-green-100 text-green-700" :
                    task.status === "in_progress" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{task.status}</span>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(task.start_date).toLocaleDateString("pt-BR")} →{" "}
                  {new Date(task.due_date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
