"use client";

import { cn } from "@/utils/cn";
import { DatePicker } from "@/components/ui/date-picker";

const selectClass =
  "h-9 rounded border border-border bg-surface-muted px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

// Valor canônico: "YYYY-MM-DDTHH:MM" (24h, sem AM/PM). Derivado direto do prop — sem estado local.
function split(v: string): { date: string; hour: string; minute: string } {
  const m = v.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  return { date: m?.[1] ?? "", hour: m?.[2] ?? "00", minute: m?.[3] ?? "00" };
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")); // 00..23
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")); // 00..59

interface Props {
  value: string;
  onChange: (canonical: string) => void;
  id?: string;
}

export function DateTimeField({ value, onChange, id }: Props) {
  const { date, hour, minute } = split(value);

  const emit = (d: string, h: string, mi: string) => {
    onChange(d ? `${d}T${h}:${mi}` : "");
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[8rem] flex-1">
        <DatePicker id={id} value={date} onChange={(d) => emit(d, hour, minute)} />
      </div>
      <div className="flex items-center gap-1">
        <select
          aria-label="Hora"
          value={hour}
          onChange={(e) => emit(date, e.target.value, minute)}
          className={cn(selectClass, "w-15")}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-foreground-subtle">:</span>
        <select
          aria-label="Minuto"
          value={minute}
          onChange={(e) => emit(date, hour, e.target.value)}
          className={cn(selectClass, "w-15")}
        >
          {MINUTES.map((mi) => (
            <option key={mi} value={mi}>
              {mi}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
