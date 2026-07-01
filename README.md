# To-Do List — Frontend

Interface web para gerenciamento de tarefas individuais e em grupo (estilo Kanban) e hábitos diários recorrentes. Construída com **Next.js 16** (App Router), **tRPC** e **TanStack Query**. Consome a API FastAPI do backend através de uma camada tRPC server-side, com autenticação por cookies httpOnly e notificações em tempo real via WebSocket.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, output standalone) |
| API client | tRPC v11 + TanStack Query v5 |
| Formulários | React Hook Form + Zod |
| UI | Tailwind CSS 4 + shadcn/ui local (Radix UI) |
| Animações | Framer Motion |
| Toasts | Sonner |
| Tema | next-themes (claro/escuro/sistema) |
| Gerenciador de pacotes | pnpm |
| TypeScript | Strict mode |

---

## Funcionalidades

- **Autenticação completa** — cadastro com verificação de email por código, login, logout, recuperação e redefinição de senha, exclusão de conta.
- **Configurações** (`/settings`) — edição de username/avatar e **troca de email e de senha**, ambas em dois passos com confirmação por **código enviado por email** (a senha atual é exigida antes de disparar o código).
- **Onboarding** — modal de boas-vindas na primeira entrada.
- **Tarefas individuais** — board pessoal em `/dashboard`, organizado por categorias.
- **Grupos** — criação de grupos com chave de convite, aprovação/recusa de pedidos de entrada, papéis (membro/admin/dono), promoção de membros, remoção e saída.
- **Kanban** — categorias como colunas; tarefas com título, descrição, tags, datas de início/prazo, status, responsável e subtarefas. O status tem 3 estados (**Pendente** / **Em progresso** / **Finalizado**); tarefas finalizadas mostram um botão **Reabrir** (volta para Pendente) e só o criador/responsável podem finalizar ou reabrir. Cada tarefa/subtarefa pode ser marcada como **urgente** (sinalizador de prioridade) e exibe um selo vermelho **Atrasado** quando o prazo passou sem ter sido finalizada.
- **Subtarefas** — um nível, com os mesmos campos da tarefa e contador de progresso no card.
- **Categoria da tarefa** — a tarefa expõe `category_name`/`category_color` e pode ser **movida** para outra categoria (mesmo escopo) via `tasks.update` com `category_slug`.
- **Ordenação / arrastar** *(camada de dados pronta; UI de drag-and-drop a implementar)* — cada tarefa tem `position`; listas vêm ordenadas por posição e o reposicionamento é enviado via `tasks.update` com `position`. Ao mover de categoria, a tarefa vai para o fim da coluna destino.
- **Comentários e timeline de atividade** *(camada de dados pronta; UI a implementar)* — qualquer pessoa com acesso comenta em tarefas e subtarefas; além dos comentários, cada ação (criar, mudar status, entregar, mover de categoria, alocar responsável, etc.) vira um **evento** no log. O hook `useTimeline` traz o feed unificado (comentários + eventos, com durações já calculadas: quanto tempo ficou em cada status/categoria/com cada responsável).
- **Busca, filtros e ordenação** *(camada de dados pronta; UI a implementar)* — `use-task-filters` filtra em memória por texto, status, tags, categoria, responsável, **atribuídas a mim**, urgente e atrasado, com **alternância entre tarefas e subtarefas** (a listagem por categoria só traz tarefas) e ordenação (posição/prazo/criação/título/prioridade).
- **Hábitos diários (Diário)** — seção pessoal em `/diary` com hábitos recorrentes (todos os dias ou dias específicos da semana), status diário de 3 estados (pendente/em andamento/concluído) e cards de progresso diário e mensal.
- **Notificações em tempo real** — via WebSocket, com badge de não lidas e painel no topo.
- **Tema** — alternância claro/escuro/sistema.

---

## Arquitetura

O Next.js atua como **BFF (Backend for Frontend)**: o browser nunca fala direto com o FastAPI. Todo o tráfego passa pelo Next, que repassa o cookie bruto ao backend sem inspecionar os tokens.

```
componentes (client)
    ↓  hooks (TanStack Query via tRPC)
    ↓  routers tRPC (server-only)   ──►  http.ts (fetch com cookie)  ──►  FastAPI
```

Dois canais de comunicação com o backend:

1. **tRPC** (`/api/trpc`) — usado pela maioria das operações (queries e mutations tipadas).
2. **Bridge REST** (`/api/auth`) — usado pelos fluxos de autenticação que precisam repassar `Set-Cookie` ao browser (login, registro, logout, refresh, verificação de email, exclusão de conta), já que o `httpBatchLink` do tRPC não expõe `Set-Cookie`.

Além disso, há **rewrites** diretos (`/api-internal`, `/socket`) para casos que apontam para o backend sem passar pela camada tRPC.

---

## Estrutura de pastas

```
src/
├── app/                              # App Router
│   ├── dashboard/                    # Board individual (page + DashboardClient)
│   ├── diary/                        # Hábitos diários (page + DiaryClient)
│   ├── groups/                       # Lista de grupos
│   │   └── [id]/                     # Board do grupo (slug-based)
│   ├── settings/                     # Página de configurações (perfil, email, senha, conta)
│   ├── auth/                         # Tela única de autenticação
│   ├── api/
│   │   ├── auth/route.ts             # Bridge REST p/ cookies
│   │   └── trpc/[trpc]/route.ts      # Handler HTTP do tRPC
│   ├── layout.tsx                    # Root layout + providers
│   ├── page.tsx                      # Redirect → /dashboard
│   ├── not-found.tsx                 # 404
│   ├── error.tsx                     # Boundary de erro de rota
│   └── global-error.tsx              # Boundary de erro do layout raiz
├── components/
│   ├── auth/                         # AuthShell + steps (login, register, verify, forgot, reset)
│   ├── groups/                       # GroupMembersDialog
│   ├── tasks/                        # TaskBoard, CategoryColumn, TaskCard,
│   │   └── task-modal/               # ItemFields/FieldsBlock/SubtasksTab/CreateTaskModal/...
│   ├── habits/                       # HabitCard, HabitStatsCards, constants,
│   │   └── habit-modal/              # HabitFields/CreateHabitModal/EditHabitModal
│   ├── layout/                       # AppShell + app-shell/ (Sidebar, Topbar, ...)
│   └── ui/                           # shadcn/ui local (button, dialog, select, datetime-field, ...)
├── errors/
│   ├── codes.ts                      # Enum ErrorCode + getErrorMessage() (PT-BR)
│   └── toast.ts                      # showError() — toast de erro centralizado
├── hooks/                            # use-auth, use-tasks, use-subtasks, use-categories,
│                                     # use-comments, use-task-filters, use-groups, use-habits,
│                                     # use-notifications, use-profile
├── lib/
│   ├── api-error.ts                  # ApiError + parseApiError
│   ├── auth-client.ts                # authFetch() p/ a bridge REST
│   ├── logger.ts                     # logger estruturado (server-side)
│   └── trpc-client.ts                # createTRPCReact
├── providers/
│   ├── auth.tsx                      # AuthProvider + useAuth
│   ├── notifications.tsx             # NotificationsProvider
│   ├── theme.tsx                     # next-themes wrapper
│   └── trpc.tsx                      # TrpcProvider + QueryClient + Sonner
├── server/trpc/
│   ├── init.ts                       # Context, procedures, mapApiError
│   ├── root.ts                       # AppRouter
│   └── routers/                      # auth, users, tasks, subtasks, comments, categories, groups, habits, notifications
├── services/
│   ├── http.ts                       # Cliente fetch tipado
│   └── notificationService.ts        # WebSocket + reconexão
├── types/
│   ├── api.ts                        # Schemas Zod + tipos do backend
│   └── task-modal.ts                 # Tipos do modal de tarefa/subtarefa
└── utils/                            # cn, datetime, statuses

proxy.ts                              # Next 16 Proxy (ex-middleware)
next.config.ts                        # rewrites /api-internal, /socket
```

---

## Variáveis de ambiente

Crie um `.env` na raiz.

| Variável | Quem lê | Descrição |
|---|---|---|
| `API_URL` | Apenas server (BFF + proxy) | URL absoluta do backend FastAPI. **Nunca exposta ao browser** |
| `NEXT_PUBLIC_WS_URL` | Browser (embutida no build) | URL base do WebSocket. Mudá-la exige rebuild |
| `PORT` / `HOSTNAME` | Runtime (Dockerfile) | Porta/host do `next start` em produção |

| Variável | Dev local | docker-compose | Produção |
|---|---|---|---|
| `API_URL` | `http://localhost:8000` | `http://backend:8000` | URL pública do backend |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | `ws://localhost:8000` | `wss://seu-dominio.com` |

---

## Desenvolvimento local

**Pré-requisitos:** Node.js, pnpm e o backend rodando.

```bash
pnpm install          # dependências
pnpm dev              # servidor de dev (http://localhost:3000)
pnpm build            # build de produção (output: standalone)
pnpm start            # roda o build
pnpm lint             # ESLint
pnpm exec tsc --noEmit # typecheck
```

Ao abrir `http://localhost:3000`, o `proxy.ts` redireciona para `/auth` se não houver sessão e para `/dashboard` se houver.

---

## Autenticação

Gerenciada inteiramente pelo backend via cookies httpOnly (`tdl_access`, `tdl_refresh`). O frontend **nunca lê nem armazena tokens** — o browser os envia automaticamente em cada request.

### Fluxo de login

```
Browser POST /api/auth?action=login
    ↓  src/app/api/auth/route.ts
    ↓  Backend POST /auth/login → SessionInfo + Set-Cookie
    ↓  o route handler repassa Set-Cookie + body ao browser
    ↓  AuthProvider rebusca trpc.auth.session
```

### Bridge REST (`/api/auth?action=...`)

Endpoint único para fluxos que manipulam `Set-Cookie`. O cliente `authFetch` (em `lib/auth-client.ts`) normaliza os erros no mesmo formato consumido pelo resto do app.

| `?action=` | Backend |
|---|---|
| `login` / `register` / `logout` | `/auth/...` |
| `refresh` | `/auth/refresh` |
| `verify-email` | `/auth/verify-email` |
| `delete-account` | `/auth/account` |
| `change-email-request` / `change-email-confirm` | `/auth/change-email/...` |
| `change-password-request` / `change-password-confirm` | `/auth/change-password/...` |

Fluxos sem mutação de cookie (forgot/reset password, reenvio de código, sessão) usam tRPC normal. A troca de email/senha passa pela bridge porque o `change-password-confirm` **limpa os cookies** no backend (logout forçado) — os demais passos reusam o mesmo caminho por serem ações de conta autenticadas.

### Refresh automático

O `proxy.ts` detecta `tdl_refresh` sem `tdl_access`, chama `/auth/refresh` no backend e repassa os novos `Set-Cookie` — transparente para o usuário.

### Provider

```tsx
const { user, isLoading } = useAuth();
```

`AuthProvider` usa a query `trpc.auth.session` (cache compartilhado pelo QueryClient). Em transições que trocam de sessão e exigem estado limpo (login, logout, troca de senha — que desloga), a navegação usa `window.location.href` para descartar todo o cache do cliente. Já a **troca de email** não é logout: ela apenas invalida a query `auth.session` (`utils.auth.session.invalidate()`), atualizando o email no lugar sem recarregar a página.

---

## Proxy (Next.js 16)

No Next 16 o `middleware.ts` passou a se chamar `proxy.ts` (export nomeado `proxy`). Responsabilidades:

1. **Gate de autenticação** — sem `tdl_access`/`tdl_refresh`, redireciona para `/auth` (exceto rotas públicas).
2. **Refresh automático** — se há `tdl_refresh` mas não `tdl_access`, chama `/auth/refresh` e repassa `Set-Cookie`.
3. **Redirect inverso** — usuário autenticado tentando `/auth` vai para `/dashboard`.
4. **Cabeçalhos de segurança** — aplica em toda resposta: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` e `Permissions-Policy`.

---

## tRPC

### Contexto (`server/trpc/init.ts`)

A cada request, o `createContext` repassa o cookie bruto e chama `/auth/session` no backend para popular `ctx.user`:

```typescript
const fetch = createHttp(cookieHeader || undefined);
try {
  const session = await fetch.get<SessionInfo>("/auth/session");
  return { user: session.user, fetch };
} catch {
  return { user: null, fetch };
}
```

### Procedures

| Procedure | Requisito |
|---|---|
| `publicProcedure` | Qualquer request (`user` pode ser null) |
| `protectedProcedure` | `ctx.user !== null` (senão 401) |

### Routers

**auth** — `session`, `forgotPassword`, `resetPassword`, `resendVerification`
*(login, register, logout, verify-email e delete-account usam a bridge REST)*

**users** — `me`, `updateMe` (username / avatar_url / onboarded)
*(o backend tem o campo `timezone`; ainda não enviado pelo cliente — ver nota em Diário)*

**tasks** — `list`, `listGroup`, `create`, `update`, `delete`
*(em `update`, envie `assignee_username: ""` para desatribuir; `category_slug` para mover de categoria; `position` para reordenar)*

**subtasks** — `list`, `listGroup`, `listByTask`, `create`, `update`, `delete`
*(`list`/`listGroup` trazem todas as subtarefas do usuário/grupo — para a visão "só subtarefas")*

**comments** — `list`, `timeline`, `create`, `update`, `delete`
*(target-aware: `{ kind: "task" | "subtask", slug }`; `timeline` retorna o feed unificado de comentários + eventos de sistema)*

**categories** — `list`, `listGroup`, `create`, `update`, `delete`

**groups** — `list`, `get`, `create`, `rename`, `join`, `listMembers`, `listJoinRequests`, `acceptRequest`, `rejectRequest`, `removeMember`, `promoteMember`, `leaveGroup`, `deleteGroup`

**habits** — `list`, `listToday`, `stats`, `create`, `update`, `setStatus`, `delete`
*(seção pessoal; `days_of_week` usa `0`=domingo … `6`=sábado, espelhando o backend)*

**notifications** — `list`, `markRead`, `markAllRead`

---

## Papéis em grupos

```
member  →  cria/edita tarefas e subtarefas
admin   →  member + aceita/rejeita pedidos, remove members, promove member,
           edita categorias e nome/descrição do grupo
dono    →  admin (criador). Só ele deleta o grupo ou remove outro admin.
```

O backend é a fonte de verdade das permissões: ações não autorizadas retornam `FORBIDDEN` e viram toast.

---

## Telas e navegação

### `/auth`

Tela única com steps animados via Framer Motion (`AnimatePresence`):

```
login  →  register  →  verify-email
  ↓
forgot →  verify-reset  →  reset
```

A troca de step não muda a URL — é orquestrada pelo `AuthShell`.

### Kanban (`/dashboard` e `/groups/[id]`)

Ambas as rotas renderizam o mesmo `<TaskBoard />`, mudando apenas a fonte de dados:

| Rota | Hooks |
|---|---|
| `/dashboard` | `useTasks()` + `useCategories()` |
| `/groups/[id]` | `useGroupTasks(slug)` + `useGroupCategories(slug)` |

Componentes:
- **TaskBoard** — container horizontal, agrupa tarefas por categoria.
- **CategoryColumn** — coluna com cor e contador; o botão "Tarefa" abre o modal de criação.
- **TaskCard** — título (com ícone de bandeira quando **urgente**), tags, status, contador de subtarefas concluídas e avatar do responsável. O status aparece como `dropdown` (Pendente / Em progresso / Finalizado) enquanto a tarefa não está finalizada; finalizada, vira selo + botão **Reabrir** (apenas para criador/responsável). Quando atrasada, mostra um selo **Atrasado**.
- **TaskItemModal** — modal compartilhado por tarefa e subtarefa (detalhes + aba de subtarefas), com layout fullscreen no mobile. A criação de tarefa também usa um modal (`CreateTaskModal`), reaproveitando os mesmos campos.
- **Datas** — os campos de início/prazo usam um seletor próprio no formato `dd/mm/aaaa` + hora (independente do locale do browser).

> Tarefas de grupo são separadas das tarefas individuais — o board pessoal não mistura tarefas de grupos.

---

## Diário / Hábitos (`/diary`)

Seção **pessoal** (não compartilhável) para hábitos recorrentes. `DiaryClient` alterna entre duas visões — **Hoje** (`useTodayHabits`, só os agendados para hoje) e **Todos** (`useHabits`) — e exibe `HabitStatsCards` (progresso diário e mensal via `useHabitStats`).

- **HabitCard** — título, frequência (todos os dias ou dias da semana) e, na visão Hoje, um `select` de status de 3 estados (pendente/em andamento/concluído) colorido conforme o estado. Clicar no card abre a edição.
- **CreateHabitModal / EditHabitModal** — reusam `HabitFields` (título, descrição, checkbox "todos os dias" e seletor de dias Dom–Sáb). A validação Zod (`habitFormSchema`) espelha o backend: exige ≥1 dia quando "todos os dias" está desmarcado.
- **Progresso** — só `done` (concluído) conta nas porcentagens; "em andamento" é um estado próprio. Mudar a recorrência de um hábito recalcula a % do mês (o backend é a fonte de verdade).

> **Fuso horário (pendente de integração):** o backend calcula "hoje" pelo `User.timezone` (default `UTC`). Para o dia virar no horário local do usuário, o cliente precisa enviar `timezone` (ex.: `Intl.DateTimeFormat().resolvedOptions().timeZone`) via `users.updateMe` — ainda não implementado.

---

## Notificações em tempo real

```
browser  ──►  ${NEXT_PUBLIC_WS_URL}/ws/notifications
```

O `NotificationsProvider` abre/fecha a conexão conforme `useAuth().user`. O `NotificationService` autentica via cookie (`tdl_access`) — sem token na URL — e, em caso de queda, tenta reconectar com backoff progressivo (5s → 15s → 30s → 60s) por um número limitado de tentativas; esgotadas, oferece um botão **Reconectar** no painel de notificações.

Quando chega uma mensagem, o provider invalida `trpc.notifications.list` (o badge atualiza sozinho) e, em eventos de remoção/exclusão de grupo, invalida os caches do grupo e redireciona o usuário se ele estiver no board afetado.

---

## Formulários e validação

Todos usam **React Hook Form + Zod** via `zodResolver`. A regra de senha (`min(8)` + maiúscula/minúscula/dígito/símbolo) replica a do backend. A validação roda no cliente antes da chamada de rede; erros de campo aparecem inline e erros de servidor aparecem como toast.

---

## Tratamento de erros

- **`parseApiError`** (`lib/api-error.ts`) — converte a resposta do backend em `ApiError`, preservando o `code`.
- **`mapApiError`** (tRPC server) — converte `ApiError` em `TRPCError` mantendo o `code` em `data.code` (`400→BAD_REQUEST`, `401→UNAUTHORIZED`, `403→FORBIDDEN`, `404→NOT_FOUND`, `409→CONFLICT`, `429→TOO_MANY_REQUESTS`, `500→INTERNAL_SERVER_ERROR`).
- **`getErrorMessage(code)`** (`errors/codes.ts`) — mensagens em PT-BR espelhando o enum do backend.
- **`showError(err)`** (`errors/toast.ts`) — helper único de toast de erro usado pelas mutations.
- **Retry** — o `QueryClient` não retenta queries que retornam `UNAUTHORIZED`.
- **Páginas de erro** — `not-found.tsx`, `error.tsx` (boundary de rota) e `global-error.tsx` (boundary do layout raiz).
- **Logs** — registrados no server via `lib/logger.ts`; o cliente só exibe toasts.

---

## Tipos (`types/api.ts`)

Tipos derivados de schemas Zod, espelhando as respostas do backend:

```
User, Task, TaskStatus, Tag, Category,
Group, GroupCreated, GroupMember, GroupRole,
JoinRequest, JoinRequestStatus,
Habit, HabitStatus, HabitStats,
Notification, NotificationType, SessionInfo, Subtask,
Comment, TimelineItem, ActivityType,
ForgotPasswordResponse
```

Os routers tRPC usam esses tipos como genérico de `http.get<T>()`, de forma que os hooks do TanStack Query inferem o tipo automaticamente.

---

## Produção com Docker

O `docker-compose.yml` vive no repositório do **backend** e referencia este frontend via `context`. O Dockerfile usa `output: "standalone"` (imagem mínima): só `server.js` + `.next/static` + `public` vão para o runtime. O `.dockerignore` bloqueia `.env`, `node_modules`, `.next`, `.git` e afins. Plataformas que constroem do Dockerfile injetam `PORT` automaticamente.
