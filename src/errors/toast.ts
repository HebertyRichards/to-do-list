import { toast } from "sonner";
import { getErrorMessage } from "./codes";

type ErrorLike = {
  data?: { code?: string | null } | null;
  message?: string;
};

export function showError(err: ErrorLike): void {
  const code = err.data?.code ?? "";
  toast.error(getErrorMessage(code, err.message));
}
