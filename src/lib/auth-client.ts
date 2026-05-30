export type AuthError = {
  data: { code: string };
  message: string;
};

interface AuthErrorBody {
  error?: { code?: string; message?: string };
}

export async function authFetch(action: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`/api/auth?action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = (data as AuthErrorBody)?.error ?? {};
    const authError: AuthError = {
      data: { code: err.code ?? "" },
      message: err.message ?? "Erro desconhecido.",
    };
    throw authError;
  }

  return data;
}
