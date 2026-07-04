import type { TimelineItem } from "@/types/api";
import { formatDuration } from "./datetime";

type ActivityItem = Extract<TimelineItem, { kind: "activity" }>;

// Tradutor raiz do next-intl (useTranslations() sem namespace).
type Translator = (key: string, values?: Record<string, string | number>) => string;

const KNOWN_STATUSES = new Set(["pending", "in_progress", "done"]);

// Acessores seguros para o payload (Record<string, unknown>).
const str = (p: Record<string, unknown>, k: string): string | undefined =>
  typeof p[k] === "string" ? (p[k] as string) : undefined;
const num = (p: Record<string, unknown>, k: string): number | undefined =>
  typeof p[k] === "number" ? (p[k] as number) : undefined;

const forTime = (sec: number | undefined): string =>
  sec != null ? ` · ${formatDuration(sec)}` : "";

/**
 * Frase (sem o autor) que descreve um evento do sistema a partir do `type` +
 * `payload`. O autor é renderizado à parte pelo componente da timeline.
 */
export function describeActivity(a: ActivityItem, t: Translator): string {
  const p = a.payload;
  const statusLabel = (v: string | undefined): string =>
    v ? (KNOWN_STATUSES.has(v) ? t(`status.${v}`) : v) : "";

  switch (a.type) {
    case "created":
      return t("timeline.created");
    case "status_changed":
      return `${t("timeline.statusChanged", { status: statusLabel(str(p, "to")) })}${forTime(num(p, "duration_seconds"))}`;
    case "delivered": {
      const held = num(p, "assignee_held_seconds");
      const heldTxt =
        held != null ? ` · ${t("timeline.withAssigneeFor", { duration: formatDuration(held) })}` : "";
      return `${t("timeline.delivered")}${forTime(num(p, "duration_seconds"))}${heldTxt}`;
    }
    case "reopened":
      return `${t("timeline.reopened")}${forTime(num(p, "duration_seconds"))}`;
    case "category_moved":
      return `${t("timeline.categoryMoved", { from: str(p, "from_name") ?? "?", to: str(p, "to_name") ?? "?" })}${forTime(num(p, "duration_seconds"))}`;
    case "assignee_changed": {
      const to = str(p, "to");
      if (to) return t("timeline.assignedTo", { user: to });
      const from = str(p, "from");
      return from ? t("timeline.unassignedFrom", { user: from }) : t("timeline.unassigned");
    }
    case "urgent_changed":
      return p.to ? t("timeline.markedUrgent") : t("timeline.unmarkedUrgent");
    case "dates_changed":
      return t("timeline.datesChanged");
    default:
      return t("timeline.updated");
  }
}
