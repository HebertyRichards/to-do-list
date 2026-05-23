# To-Do List — Frontend

Interface web construída com **Next.js 16**, **tRPC** e **TanStack Query**. Consome a API FastAPI do backend via camada tRPC server-side, com autenticação por cookies httpOnly e notificações em tempo real via WebSocket.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| API client | tRPC v11 + TanStack Query v5 |
| Formulários | React Hook Form + Zod |
| Estilo | Tailwind CSS 4 |
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
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Server component (thin wrapper)
│   │   │   └── DashboardClient.tsx   # "use client" — lógica e UI
│   │   └── groups/
│   │       ├── page.tsx
│   │       └── GroupsClient.tsx
│   ├── (auth)/                       # Rotas públicas
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── LoginClient.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       └── RegisterClient.tsx
│   ├── api/
│   │   └── trpc/[trpc]/route.ts      # Handler HTTP do tRPC
│   ├── layout.tsx                    # Root layout com providers
│   └── page.tsx                      # Redirect → /dashboard
│
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── OnboardingModal.tsx
│   ├── errors/
│   │   └── codes.ts                  # Enum ErrorCode + getErrorMessage()
│   ├── hooks/                        # Wrappers sobre trpc.*.useQuery/useMutation
│   │   ├── use-auth.ts
│   │   ├── use-categories.ts
│   │   ├── use-groups.ts
│   │   └── use-tasks.ts
│   ├── lib/
│   │   ├── api-error.ts              # ApiError + parseApiError (type guard)
│   │   └── trpc-client.ts            # createTRPCReact
│   ├── providers/
│   │   ├── auth.tsx                  # AuthProvider + useAuth
│   │   ├── notifications.tsx         # NotificationsProvider + useNotifications
│   │   └── trpc.tsx                  # TrpcProvider (QueryClient + httpBatchLink)
│   ├── server/
│   │   └── trpc/
│   │       ├── init.ts               # Context, createContext, procedures
│   │       ├── root.ts               # AppRouter (agrega todos os routers)
│   │       └── routers/
│   │           ├── auth.ts
│   │           ├── categories.ts
│   │           ├── groups.ts
│   │           ├── notifications.ts
│   │           └── tasks.ts
│   ├── services/
│   │   ├── http.ts                   # Cliente fetch tipado (get/post/patch/delete)
│   │   └── notificationService.ts   # NotificationService (WebSocket + reconnect)
│   └── types/
│       └── api.ts                    # Interfaces TypeScript (User, Task, Group…)
│
├── proxy.ts                          # Next.js 16 Proxy (ex-middleware)
├── next.config.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## Variáveis de ambiente

```env
# URL interna do backend (usada pelo servidor Next.js — não exposta ao browser)
API_URL=http://backend:8000

# URL do WebSocket (exposta ao browser via NEXT_PUBLIC_)
NEXT_PUBLIC_WS_URL=ws://backend:8000
```

> Em desenvolvimento local sem Docker, use `http://localhost:8000` e `ws://localhost:8000`.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 22+
- pnpm
- Backend rodando (ver README do backend)

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
# Editar API_URL e NEXT_PUBLIC_WS_URL
```

### 3. Iniciar em desenvolvimento

```bash
pnpm dev
```

Acesse em `http://localhost:3000`.

### Outros comandos

```bash
pnpm build          # Build de produção (output: standalone)
pnpm start          # Iniciar build de produção
pnpm lint           # ESLint
pnpm tsc --noEmit   # Typecheck sem emitir arquivos
```

---

## Docker

O `docker-compose.yml` está no repositório do **backend**. O frontend é buildado como parte da stack:

```bash
# Na pasta do backend
docker compose up -d
```

O Dockerfile do frontend usa output `standalone` do Next.js (imagem mínima, sem `node_modules` desnecessários).

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

#### `tasks`
| Procedure | Tipo | Descrição |
|---|---|---|
| `list` | query | Tarefas do usuário (`Task[]`) |
| `listGroup` | query | Tarefas de um grupo (`Task[]`) |
| `create` | mutation | Criar tarefa |
| `update` | mutation | Atualizar tarefa |
| `delete` | mutation | Deletar tarefa |

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

## Formulários

Todos os formulários usam **React Hook Form** com **Zod** via `zodResolver`. A validação acontece no cliente antes de qualquer chamada de rede:

```tsx
const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

Erros de validação aparecem abaixo de cada campo. Erros do servidor aparecem no topo do formulário via `mutation.error`.

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

## Convenções de código

- **Sem `any`** — type guards no lugar de type assertions
- **Sem non-null assertions (`!`)** — verificações explícitas ou optional chaining
- **Formulários com React Hook Form** — sem `useState` para campos de input
- **`useEffect` com deps corretas** — deps derivadas de valores primitivos (ex: `userId`, não `user`)
- **Server Components finos** — `page.tsx` só renderiza o `*Client.tsx`; toda lógica fica no Client Component
- **Tipos centralizados** — sem tipos inline duplicados nos componentes
