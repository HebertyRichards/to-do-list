import type { TimelineItem } from "@/types/api";
import { formatDuration } from "./datetime";

type ActivityItem = Extract<TimelineItem, { kind: "activity" }>;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em progresso",
  done: "Finalizado",
};

// Acessores seguros para o payload (Record<string, unknown>).
const str = (p: Record<string, unknown>, k: string): string | undefined =>
  typeof p[k] === "string" ? (p[k] as string) : undefined;
const num = (p: Record<string, unknown>, k: string): number | undefined =>
  typeof p[k] === "number" ? (p[k] as number) : undefined;

const statusLabel = (v: string | undefined): string => (v ? (STATUS_LABEL[v] ?? v) : "");
const forTime = (sec: number | undefined): string =>
  sec != null ? ` · ${formatDuration(sec)}` : "";

/**
 * Frase (sem o autor) que descreve um evento do sistema a partir do `type` +
 * `payload`. O autor é renderizado à parte pelo componente da timeline.
 */
export function describeActivity(a: ActivityItem): string {
  const p = a.payload;
  switch (a.type) {
    case "created":
      return "criou este item";
    case "status_changed":
      return `mudou o status para ${statusLabel(str(p, "to"))}${forTime(num(p, "duration_seconds"))}`;
    case "delivered": {
      const held = num(p, "assignee_held_seconds");
      const heldTxt = held != null ? ` · com o responsável por ${formatDuration(held)}` : "";
      return `entregou${forTime(num(p, "duration_seconds"))}${heldTxt}`;
    }
    case "reopened":
      return `reabriu${forTime(num(p, "duration_seconds"))}`;
    case "category_moved":
      return `moveu de "${str(p, "from_name") ?? "?"}" para "${str(p, "to_name") ?? "?"}"${forTime(num(p, "duration_seconds"))}`;
    case "assignee_changed": {
      const to = str(p, "to");
      if (to) return `atribuiu para ${to}`;
      return `removeu o responsável${str(p, "from") ? ` (${str(p, "from")})` : ""}`;
    }
    case "urgent_changed":
      return p.to ? "marcou como urgente" : "removeu a urgência";
    case "dates_changed":
      return "atualizou as datas";
    default:
      return "atualizou o item";
  }
}
