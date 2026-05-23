export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  BAD_REQUEST: "BAD_REQUEST",

  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  REFRESH_REUSE_DETECTED: "REFRESH_REUSE_DETECTED",

  FORBIDDEN: "FORBIDDEN",
  NOT_GROUP_ADMIN: "NOT_GROUP_ADMIN",
  NOT_GROUP_MEMBER: "NOT_GROUP_MEMBER",
  NOT_TASK_OWNER: "NOT_TASK_OWNER",

  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  GROUP_NOT_FOUND: "GROUP_NOT_FOUND",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  SUBTASK_NOT_FOUND: "SUBTASK_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  JOIN_REQUEST_NOT_FOUND: "JOIN_REQUEST_NOT_FOUND",

  CONFLICT: "CONFLICT",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  ALREADY_GROUP_MEMBER: "ALREADY_GROUP_MEMBER",
  JOIN_REQUEST_ALREADY_PENDING: "JOIN_REQUEST_ALREADY_PENDING",

  INVALID_GROUP_KEY: "INVALID_GROUP_KEY",
  JOIN_REQUEST_EXPIRED: "JOIN_REQUEST_EXPIRED",

  DATE_RANGE_INVALID: "DATE_RANGE_INVALID",
  ASSIGNEE_NOT_IN_GROUP: "ASSIGNEE_NOT_IN_GROUP",

  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorMessages: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Dados inválidos.",
  BAD_REQUEST: "Requisição inválida.",
  UNAUTHENTICATED: "Não autenticado.",
  INVALID_CREDENTIALS: "Credenciais inválidas.",
  TOKEN_EXPIRED: "Sessão expirada.",
  TOKEN_INVALID: "Token inválido.",
  SESSION_EXPIRED: "Sessão expirada. Faça login novamente.",
  REFRESH_REUSE_DETECTED: "Sessão revogada por segurança.",
  FORBIDDEN: "Acesso negado.",
  NOT_GROUP_ADMIN: "Apenas o administrador pode executar esta ação.",
  NOT_GROUP_MEMBER: "Você não pertence a este grupo.",
  NOT_TASK_OWNER: "Você não pode editar esta tarefa.",
  NOT_FOUND: "Recurso não encontrado.",
  USER_NOT_FOUND: "Usuário não encontrado.",
  GROUP_NOT_FOUND: "Grupo não encontrado.",
  TASK_NOT_FOUND: "Tarefa não encontrada.",
  SUBTASK_NOT_FOUND: "Subtarefa não encontrada.",
  CATEGORY_NOT_FOUND: "Categoria não encontrada.",
  JOIN_REQUEST_NOT_FOUND: "Solicitação não encontrada.",
  CONFLICT: "Conflito de estado.",
  EMAIL_ALREADY_REGISTERED: "Email já cadastrado.",
  USERNAME_TAKEN: "Nome de usuário indisponível.",
  ALREADY_GROUP_MEMBER: "Você já faz parte deste grupo.",
  JOIN_REQUEST_ALREADY_PENDING: "Já existe uma solicitação pendente.",
  INVALID_GROUP_KEY: "Chave de grupo inválida.",
  JOIN_REQUEST_EXPIRED: "Solicitação expirada. Tente novamente.",
  DATE_RANGE_INVALID: "Data de início deve ser anterior à data limite.",
  ASSIGNEE_NOT_IN_GROUP: "Usuário atribuído não faz parte do grupo.",
  TOO_MANY_REQUESTS: "Muitas requisições. Tente mais tarde.",
  DATABASE_ERROR: "Erro ao acessar dados.",
  INTERNAL_SERVER_ERROR: "Erro interno do servidor.",
};

export function getErrorMessage(code: string, fallback?: string): string {
  return ErrorMessages[code as ErrorCode] ?? fallback ?? "Erro desconhecido.";
}
