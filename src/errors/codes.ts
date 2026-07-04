import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config";

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

  RESET_TOKEN_INVALID: "RESET_TOKEN_INVALID",
  RESET_TOKEN_EXPIRED: "RESET_TOKEN_EXPIRED",

  VERIFY_CODE_INVALID: "VERIFY_CODE_INVALID",
  VERIFY_CODE_EXPIRED: "VERIFY_CODE_EXPIRED",

  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",

  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// Mensagens por locale. showError roda fora do contexto React (callbacks de
// mutação), então a locale vem do cookie em vez do useTranslations.
const ERROR_MESSAGES: Record<Locale, Record<ErrorCode, string>> = {
  pt: {
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
    RESET_TOKEN_INVALID: "Token de redefinição inválido.",
    RESET_TOKEN_EXPIRED: "Token de redefinição expirado. Solicite novamente.",
    VERIFY_CODE_INVALID: "Código inválido.",
    VERIFY_CODE_EXPIRED: "Código expirado. Solicite um novo.",
    EMAIL_NOT_VERIFIED: "Email não verificado. Confirme seu email para entrar.",
    EMAIL_ALREADY_VERIFIED: "Email já verificado.",
    TOO_MANY_REQUESTS: "Muitas requisições. Tente mais tarde.",
    DATABASE_ERROR: "Erro ao acessar dados.",
    INTERNAL_SERVER_ERROR: "Erro interno do servidor.",
  },
  en: {
    VALIDATION_ERROR: "Invalid data.",
    BAD_REQUEST: "Invalid request.",
    UNAUTHENTICATED: "Not authenticated.",
    INVALID_CREDENTIALS: "Invalid credentials.",
    TOKEN_EXPIRED: "Session expired.",
    TOKEN_INVALID: "Invalid token.",
    SESSION_EXPIRED: "Session expired. Please log in again.",
    REFRESH_REUSE_DETECTED: "Session revoked for security reasons.",
    FORBIDDEN: "Access denied.",
    NOT_GROUP_ADMIN: "Only the group admin can perform this action.",
    NOT_GROUP_MEMBER: "You are not a member of this group.",
    NOT_TASK_OWNER: "You cannot edit this task.",
    NOT_FOUND: "Resource not found.",
    USER_NOT_FOUND: "User not found.",
    GROUP_NOT_FOUND: "Group not found.",
    TASK_NOT_FOUND: "Task not found.",
    SUBTASK_NOT_FOUND: "Subtask not found.",
    CATEGORY_NOT_FOUND: "Category not found.",
    JOIN_REQUEST_NOT_FOUND: "Request not found.",
    CONFLICT: "State conflict.",
    EMAIL_ALREADY_REGISTERED: "Email already registered.",
    USERNAME_TAKEN: "Username unavailable.",
    ALREADY_GROUP_MEMBER: "You are already a member of this group.",
    JOIN_REQUEST_ALREADY_PENDING: "There is already a pending request.",
    INVALID_GROUP_KEY: "Invalid group key.",
    JOIN_REQUEST_EXPIRED: "Request expired. Try again.",
    DATE_RANGE_INVALID: "Start date must be before the due date.",
    ASSIGNEE_NOT_IN_GROUP: "Assigned user is not a member of the group.",
    RESET_TOKEN_INVALID: "Invalid reset token.",
    RESET_TOKEN_EXPIRED: "Reset token expired. Request a new one.",
    VERIFY_CODE_INVALID: "Invalid code.",
    VERIFY_CODE_EXPIRED: "Code expired. Request a new one.",
    EMAIL_NOT_VERIFIED: "Email not verified. Confirm your email to log in.",
    EMAIL_ALREADY_VERIFIED: "Email already verified.",
    TOO_MANY_REQUESTS: "Too many requests. Try again later.",
    DATABASE_ERROR: "Error accessing data.",
    INTERNAL_SERVER_ERROR: "Internal server error.",
  },
  es: {
    VALIDATION_ERROR: "Datos inválidos.",
    BAD_REQUEST: "Solicitud inválida.",
    UNAUTHENTICATED: "No autenticado.",
    INVALID_CREDENTIALS: "Credenciales inválidas.",
    TOKEN_EXPIRED: "Sesión expirada.",
    TOKEN_INVALID: "Token inválido.",
    SESSION_EXPIRED: "Sesión expirada. Inicia sesión de nuevo.",
    REFRESH_REUSE_DETECTED: "Sesión revocada por seguridad.",
    FORBIDDEN: "Acceso denegado.",
    NOT_GROUP_ADMIN: "Solo el administrador puede realizar esta acción.",
    NOT_GROUP_MEMBER: "No perteneces a este grupo.",
    NOT_TASK_OWNER: "No puedes editar esta tarea.",
    NOT_FOUND: "Recurso no encontrado.",
    USER_NOT_FOUND: "Usuario no encontrado.",
    GROUP_NOT_FOUND: "Grupo no encontrado.",
    TASK_NOT_FOUND: "Tarea no encontrada.",
    SUBTASK_NOT_FOUND: "Subtarea no encontrada.",
    CATEGORY_NOT_FOUND: "Categoría no encontrada.",
    JOIN_REQUEST_NOT_FOUND: "Solicitud no encontrada.",
    CONFLICT: "Conflicto de estado.",
    EMAIL_ALREADY_REGISTERED: "Email ya registrado.",
    USERNAME_TAKEN: "Nombre de usuario no disponible.",
    ALREADY_GROUP_MEMBER: "Ya formas parte de este grupo.",
    JOIN_REQUEST_ALREADY_PENDING: "Ya existe una solicitud pendiente.",
    INVALID_GROUP_KEY: "Clave de grupo inválida.",
    JOIN_REQUEST_EXPIRED: "Solicitud expirada. Inténtalo de nuevo.",
    DATE_RANGE_INVALID: "La fecha de inicio debe ser anterior al plazo.",
    ASSIGNEE_NOT_IN_GROUP: "El usuario asignado no es miembro del grupo.",
    RESET_TOKEN_INVALID: "Token de restablecimiento inválido.",
    RESET_TOKEN_EXPIRED: "Token de restablecimiento expirado. Solicita otro.",
    VERIFY_CODE_INVALID: "Código inválido.",
    VERIFY_CODE_EXPIRED: "Código expirado. Solicita uno nuevo.",
    EMAIL_NOT_VERIFIED: "Email no verificado. Confirma tu email para entrar.",
    EMAIL_ALREADY_VERIFIED: "Email ya verificado.",
    TOO_MANY_REQUESTS: "Demasiadas solicitudes. Inténtalo más tarde.",
    DATABASE_ERROR: "Error al acceder a los datos.",
    INTERNAL_SERVER_ERROR: "Error interno del servidor.",
  },
};

const UNKNOWN_ERROR: Record<Locale, string> = {
  pt: "Erro desconhecido.",
  en: "Unknown error.",
  es: "Error desconocido.",
};

function currentLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const raw = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`))?.[1];
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function isErrorCode(code: string): code is ErrorCode {
  return Object.prototype.hasOwnProperty.call(ErrorCode, code);
}

// Códigos conhecidos usam o dicionário do locale; código desconhecido cai no
// `fallback` (mensagem vinda da API — a única que pode ficar sem tradução).
export function getErrorMessage(code: string, fallback?: string): string {
  const locale = currentLocale();
  if (isErrorCode(code)) return ERROR_MESSAGES[locale][code];
  return fallback ?? UNKNOWN_ERROR[locale];
}
