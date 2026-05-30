"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

function canonicalToParts(v: string): { date: string; time: string } {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return { date: "", time: "" };
  return { date: `${m[3] ?? ""}/${m[2] ?? ""}/${m[1] ?? ""}`, time: `${m[4] ?? ""}:${m[5] ?? ""}` };
}

function partsToCanonical(date: string, time: string): string {
  const dm = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!dm) return "";
  const t = /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  return `${dm[3] ?? ""}-${dm[2] ?? ""}-${dm[1] ?? ""}T${t}`;
}

function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

const fieldClass =
  "h-9 rounded border border-border bg-surface-muted px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

interface Props {
  value: string;
  onChange: (canonical: string) => void;
  id?: string;
}

export function DateTimeField({ value, onChange, id }: Props) {
  const initial = canonicalToParts(value);
  const [dateStr, setDateStr] = useState(initial.date);
  const [timeStr, setTimeStr] = useState(initial.time);

  const emit = (date: string, time: string) => onChange(partsToCanonical(date, time));

  return (
    <div className="flex gap-2">
      <input
        id={id}
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={dateStr}
        onChange={(e) => {
          const masked = maskDate(e.target.value);
          setDateStr(masked);
          emit(masked, timeStr);
        }}
        className={cn(fieldClass, "flex-1")}
      />
      <input
        type="time"
        value={timeStr}
        onChange={(e) => {
          setTimeStr(e.target.value);
          emit(dateStr, e.target.value);
        }}
        className={cn(fieldClass, "w-28")}
      />
    </div>
  );
}
