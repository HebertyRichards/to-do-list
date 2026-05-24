# To-Do List — Frontend

Interface web construída com **Next.js 16**, **tRPC** e **TanStack Query**. Consome a API FastAPI do backend via camada tRPC server-side, com autenticação por cookies httpOnly e notificações em tempo real via WebSocket.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| API client | tRPC v11 + TanStack Query v5 (+ Devtools em dev) |
| Formulários | React Hook Form + Zod |
| UI | Tailwind CSS 4 + shadcn/ui local (Radix UI) |
| Animações | Framer Motion |
| Toasts | Sonner |
| Runtime | Node.js 22 |
| Gerenciador de pacotes | pnpm |
| TypeScript | Strict mode |

---

## Arquitetura

```
componentes (client)
    ↓
hooks (TanStack Query via tRPC)
    ↓
tRPC routers (server-only)
    ↓
http.ts (fetch com credentials)
    ↓
FastAPI backend
```

O Next.js funciona como **BFF (Backend for Frontend)**: o browser chama `/api/trpc`, o tRPC server repassa para o FastAPI com o header `cookie` bruto — sem manipular o conteúdo dos tokens.

---

## Estrutura de pastas

```
to-do-list/
├── app/                              # Next.js App Router
│   ├── (app)/                        # Grupo de rotas autenticadas
│   │   ├── dashboard/                # Board individual
│   │   │   ├── page.tsx
│   │   │   └── DashboardClient.tsx
│   │   └── groups/
│   │       ├── page.tsx              # Lista de grupos / criar / entrar
│   │       ├── GroupsClient.tsx
│   │       └── [id]/                 # Board do grupo (slug-based)
│   │           ├── page.tsx
│   │           └── GroupBoardClient.tsx
│   ├── (auth)/                       # Rotas públicas
│   │   └── auth/
│   │       └── page.tsx              # Renderiza <AuthShell />

│   ├── api/
│   │   └── trpc/[trpc]/route.ts      # Handler HTTP do tRPC
│   ├── layout.tsx                    # Root layout com providers
│   └── page.tsx                      # Redirect → /dashboard
│
├── src/
│   ├── components/
│   │   ├── auth/                     # Fluxo de autenticação com transições
│   │   │   ├── AuthShell.tsx         # Orquestra os 4 forms com AnimatePresence
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordEmailForm.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   ├── tasks/                    # Kanban estilo RunRunIt
│   │   │   ├── TaskBoard.tsx         # Container com colunas
│   │   │   ├── CategoryColumn.tsx    # Uma coluna = uma categoria
│   │   │   ├── TaskCard.tsx          # Card com contador done/total
│   │   │   └── TaskModal.tsx         # Modal com tabs (Detalhes / Subtarefas)
│   │   ├── layout/
│   │   │   └── OnboardingModal.tsx
│   │   └── ui/                       # shadcn/ui local
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── dialog.tsx
│   │       ├── tabs.tsx
│   │       ├── checkbox.tsx
│   │       ├── avatar.tsx
│   │       ├── card.tsx
│   │       └── skeleton.tsx
│   ├── errors/
│   │   └── codes.ts                  # Enum ErrorCode + getErrorMessage()
│   ├── hooks/                        # Wrappers sobre trpc.*.useQuery/useMutation
│   │   ├── use-auth.ts               # Inclui useForgotPassword / useResetPassword
│   │   ├── use-categories.ts
│   │   ├── use-groups.ts
│   │   ├── use-tasks.ts
│   │   └── use-subtasks.ts
│   ├── lib/
│   │   ├── api-error.ts              # ApiError + parseApiError (type guard)
│   │   └── trpc-client.ts            # createTRPCReact
│   ├── providers/
│   │   ├── auth.tsx                  # AuthProvider + useAuth
│   │   ├── notifications.tsx         # NotificationsProvider + useNotifications
│   │   └── trpc.tsx                  # TrpcProvider + Sonner Toaster + Devtools
│   ├── server/
│   │   └── trpc/
│   │       ├── init.ts               # Context, createContext, procedures
│   │       ├── root.ts               # AppRouter (agrega todos os routers)
│   │       └── routers/
│   │           ├── auth.ts
│   │           ├── categories.ts
│   │           ├── groups.ts
│   │           ├── notifications.ts
│   │           ├── tasks.ts
│   │           └── subtasks.ts
│   ├── services/
│   │   ├── http.ts                   # Cliente fetch tipado (get/post/patch/delete)
│   │   └── notificationService.ts   # NotificationService (WebSocket + reconnect)
│   ├── types/
│   │   └── api.ts                    # Interfaces TypeScript (User, Task, Subtask…)
│   └── utils/
│       └── cn.ts                     # Helper twMerge + clsx
│
├── proxy.ts                          # Next.js 16 Proxy (ex-middleware)
├── next.config.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do frontend.

### Desenvolvimento local

```env
API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Produção (Docker)

```env
API_URL=http://backend:8000
NEXT_PUBLIC_WS_URL=wss://seu-dominio.com
```

`API_URL` é usada apenas pelo servidor Next.js (nunca exposta ao browser). `NEXT_PUBLIC_WS_URL` é embutida no bundle do cliente em build time — defina antes do `docker compose build`, pois mudá-la depois exige rebuild.

---

## Desenvolvimento local

### Pré-requisitos

- Node.js 22+
- pnpm
- Backend rodando (ver README do backend)

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Criar `.env`

Crie o arquivo `.env` na raiz do frontend com os valores da seção **Variáveis de ambiente — Desenvolvimento local** acima.

### 3. Iniciar

```bash
pnpm dev
```

Acesse `http://localhost:3000` — o proxy redireciona automaticamente para `/auth` se não houver sessão.

### Comandos

```bash
pnpm dev            # Servidor de desenvolvimento
pnpm build          # Build de produção (output: standalone)
pnpm start          # Iniciar build de produção
pnpm lint           # ESLint
pnpm tsc --noEmit   # Typecheck
```

---

## Produção com Docker

O `docker-compose.yml` está no repositório do **backend**. O Dockerfile do frontend usa `output: "standalone"` do Next.js (imagem mínima sem `node_modules`).

```bash
# Na pasta do backend
docker compose up -d --build
```

### Variáveis de produção

Use os valores da seção **Variáveis de ambiente — Produção** acima. Defina-as antes do `docker compose build` — `NEXT_PUBLIC_WS_URL` é embutida em build time e mudá-la depois exige rebuild.

### Reverse proxy

Em produção real, coloque Nginx / Caddy / Traefik na frente para terminar TLS e rotear `/api/*` e `/ws/*` para o backend e o restante para o frontend. Exemplo no README do backend.

---

## Autenticação

A autenticação é gerenciada inteiramente pelo backend via cookies httpOnly (`tdl_access`, `tdl_refresh`). O frontend **nunca lê nem armazena tokens** — eles são enviados automaticamente pelo browser com cada request.

### Fluxo

```
1. Login → POST /api/trpc/auth.login (tRPC mutation)
2. Backend seta cookies httpOnly no response
3. AuthProvider chama trpc.auth.session.useQuery()
4. createContext() repassa o header cookie bruto para GET /auth/session
5. Backend valida o JWT e retorna SessionInfo
6. useAuth() expõe { user, isLoading }
```

### Provider de auth

```tsx
// Qualquer componente client
const { user, isLoading } = useAuth();
```

O `AuthProvider` usa `trpc.auth.session` com `staleTime: 5 min`. Ao fazer logout, a mutation invalida o cache e o provider atualiza para `user: null`.

---

## tRPC

### Contexto (`src/server/trpc/init.ts`)

A cada request tRPC, o `createContext` recebe o `Request` original do Next.js e repassa o header `cookie` bruto para o backend:

```typescript
export async function createContext({ req }: { req: Request }): Promise<Context> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (!cookieHeader) return { user: null };

  const session = await http.get<SessionInfo>("/auth/session", {
    headers: { cookie: cookieHeader },
  });
  return { user: session.user };
}
```

Não há `cookies()` do `next/headers` — o header vai intacto do browser → Next.js → FastAPI.

### Procedures

| Procedure | Requisito |
|---|---|
| `publicProcedure` | Qualquer request (user pode ser null) |
| `protectedProcedure` | `ctx.user !== null` (retorna 401 caso contrário) |

### Routers

#### `auth`
| Procedure | Tipo | Descrição |
|---|---|---|
| `session` | query | Sessão atual (`User \| null`) |
| `login` | mutation | Login (email, password) |
| `register` | mutation | Cadastro (email, username, password, full_name?) |
| `logout` | mutation | Logout |
| `forgotPassword` | mutation | Gera token de redefinição (TTL 1h) |
| `resetPassword` | mutation | Redefine senha com token |

#### `tasks`
| Procedure | Tipo | Descrição |
|---|---|---|
| `list` | query | Tarefas do usuário (`Task[]`) |
| `listGroup` | query | Tarefas de um grupo (`Task[]`) |
| `create` | mutation | Criar tarefa |
| `update` | mutation | Atualizar tarefa |
| `delete` | mutation | Deletar tarefa |

#### `subtasks`
| Procedure | Tipo | Descrição |
|---|---|---|
| `listByTask` | query | Subtarefas de uma tarefa (`Subtask[]`) |
| `create` | mutation | Criar subtarefa |
| `update` | mutation | Atualizar subtarefa |
| `delete` | mutation | Deletar subtarefa |

#### `categories`
| Procedure | Tipo | Descrição |
|---|---|---|
| `list` | query | Categorias do usuário (`Category[]`) |
| `listGroup` | query | Categorias de um grupo (`Category[]`) |
| `create` | mutation | Criar categoria |
| `update` | mutation | Atualizar categoria |
| `delete` | mutation | Deletar categoria |

#### `groups`
| Procedure | Tipo | Descrição |
|---|---|---|
| `create` | mutation | Criar grupo (retorna `GroupCreated` com chave única) |
| `join` | mutation | Solicitar entrada com chave |
| `listMembers` | query | Membros do grupo (`GroupMember[]`) |
| `listJoinRequests` | query | Pedidos pendentes (`JoinRequest[]`) |
| `acceptRequest` | mutation | Aceitar pedido |
| `rejectRequest` | mutation | Rejeitar pedido |
| `removeMember` | mutation | Remover membro |
| `leaveGroup` | mutation | Sair do grupo |
| `deleteGroup` | mutation | Deletar grupo |

#### `notifications`
| Procedure | Tipo | Descrição |
|---|---|---|
| `list` | query | Notificações (`Notification[]`) |
| `markRead` | mutation | Marcar notificação como lida |
| `markAllRead` | mutation | Marcar todas como lidas |

---

## Fluxo de autenticação

Rota única `/auth` com 4 formulários animados via Framer Motion (`AnimatePresence` + `mode="wait"`). O usuário troca entre eles sem mudar de URL:

```
LoginForm  →  RegisterForm
    ↓
ForgotPasswordEmailForm  →  ResetPasswordForm
    (recebe token)
```

Animação: o novo formulário entra pela direita (`x: 80 → 0`), o antigo sai pela esquerda (`x: 0 → -80`), com fade simultâneo. Controlado pelo componente `AuthShell` em `src/components/auth/AuthShell.tsx`.

O `proxy.ts` redireciona não-autenticados para `/auth` e autenticados que tentam acessar `/auth` para `/dashboard`.

---

## Kanban

Tanto `/dashboard` quanto `/groups/[id]` renderizam o mesmo `<TaskBoard />`, diferindo apenas na fonte de dados:

| Rota | Dados |
|---|---|
| `/dashboard` | `useTasks()` + `useCategories()` |
| `/groups/[id]` | `useGroupTasks(id)` + `useGroupCategories(id)` |

**Componentes:**

- **`TaskBoard`** — container horizontal com scroll, agrupa tarefas por `category_id`
- **`CategoryColumn`** — uma coluna por categoria, com header colorido e contador de tarefas
- **`TaskCard`** — título, tags, contador `done/total` de subtarefas, avatar do assignee. Card inteiro é clicável
- **`TaskModal`** — abre ao clicar no card, com 2 tabs:
  - **Detalhes** — descrição + tags + checkbox para marcar a tarefa inteira como done
  - **Subtarefas** — lista com checkboxes interativos + botão de deletar

A subtarefa não tem sub-subtarefa (1 nível só), seguindo a regra do backend.

---

## Formulários

Todos os formulários usam **React Hook Form** com **Zod** via `zodResolver`:

```tsx
const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

Validação acontece no cliente antes de qualquer chamada de rede. Erros de validação aparecem abaixo de cada campo. Erros do servidor aparecem como toast (Sonner).

---

## Toasts e feedback

`Sonner` é montado no `TrpcProvider` (posição `top-right`, `richColors`). Cada hook de mutation chama `toast.success` no sucesso e `toast.error(getErrorMessage(code))` no erro:

```tsx
return trpc.tasks.create.useMutation({
  onSuccess: () => {
    toast.success("Tarefa criada.");
    utils.tasks.list.invalidate();
  },
  onError: (err) => toast.error(getErrorMessage(err.data?.code ?? "", err.message)),
});
```

Sem `if (mutation.error) render(...)` espalhado pelos componentes.

---

## TanStack Query Devtools

Habilitado apenas em `NODE_ENV === "development"`. Permite ver queries cacheadas, estado de mutations e forçar refetch durante o desenvolvimento.

---

## Skeletons (loading states)

Todos os blocos com dados assíncronos têm skeleton via `<Skeleton />` (`src/components/ui/skeleton.tsx` — `animate-pulse` + bg cinza):

- `DashboardClient` mostra skeletons no header enquanto carrega o user
- `CategoryColumn` mostra 3 skeletons enquanto a query de tasks resolve
- `TaskBoard` inteiro fica skeleton se loading inicial
- `TaskModal` mostra skeletons na lista de subtarefas até a query terminar

---

## Notificações em tempo real

O `NotificationService` abre uma conexão WebSocket com o backend e reconecta automaticamente a cada 5 segundos em caso de queda:

```
browser → NEXT_PUBLIC_WS_URL/ws/notifications
```

O `NotificationsProvider` expõe `{ events, unreadCount, isConnected, clearEvents }` via Context. A conexão só é aberta quando `userId` está disponível e encerrada ao fazer logout.

### Reescrita de URL (proxy)

O `next.config.ts` define rewrites para que o browser não acesse o backend diretamente:

```
/api-internal/*  →  ${API_URL}/*    (chamadas HTTP via fetch)
/socket/*        →  ${API_URL}/*    (WebSocket upgrade)
```

---

## Proxy (ex-Middleware)

> **Next.js 16**: o arquivo de middleware foi renomeado para `proxy.ts` com export nomeado `proxy` (não `middleware` e não `default`).

```typescript
// proxy.ts
export function proxy(request: NextRequest) { ... }
export const config = { matcher: [...] }
```

---

## Tipos TypeScript (`src/types/api.ts`)

Todos os tipos que espelham respostas do backend estão centralizados em um único arquivo:

```typescript
User, Task, TaskStatus, Tag, Category,
Group, GroupCreated, GroupMember, GroupRole,
JoinRequest, JoinRequestStatus,
Notification, NotificationType,
SessionInfo
```

Os routers tRPC usam esses tipos como parâmetro genérico do `http.get<T>()` para que o TanStack Query infira os tipos automaticamente nos hooks — sem necessidade de cast nos componentes.

---

## Tratamento de erros

### `ApiError`

Erros do backend são parseados por `parseApiError(res: Response)` usando type guard:

```typescript
const raw: unknown = await res.json();
if (isApiErrorBody(raw)) {
  code = raw.error?.code ?? code;
}
```

### Retry automático

O `QueryClient` não retenta requests que retornam `UNAUTHORIZED`:

```typescript
retry: (count, err) => {
  if (err instanceof TRPCClientError && err.data?.code === "UNAUTHORIZED") return false;
  return count < 2;
}
```

### Mensagens de erro

Traduzidas para português via `getErrorMessage(code)` em `src/errors/codes.ts`, espelhando o enum `ErrorCode` do backend.

---
