import { getErrorMessage } from "@/errors/codes";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null;
}

export async function parseApiError(res: Response): Promise<ApiError> {
  let code = "INTERNAL_SERVER_ERROR";
  let message = "Erro interno do servidor.";
  try {
    const raw: unknown = await res.json();
    if (isApiErrorBody(raw)) {
      code = raw.error?.code ?? code;
      message = raw.error?.message ?? getErrorMessage(code);
    }
  } catch {
    message = getErrorMessage(code);
  }
  return new ApiError(code, message, res.status);
}
