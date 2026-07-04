import { toast } from "sonner";
import { getErrorMessage } from "./codes";

type ErrorLike = {
  data?: { code?: string | null; appCode?: string | null } | null;
  message?: string;
};

export function showError(err: ErrorLike): void {
  // appCode é o código da API (ex.: NOT_GROUP_ADMIN); o code do tRPC é o fallback.
  const code = err.data?.appCode ?? err.data?.code ?? "";
  toast.error(getErrorMessage(code, err.message));
}
