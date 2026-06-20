"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "react-day-picker/locale";

import { cn } from "@/utils/cn";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const fieldClass =
  "h-9 w-full rounded border border-border bg-surface-muted px-3 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

// O valor canônico é sempre "YYYY-MM-DD" (ou "" quando vazio); a UI exibe dd/mm/aaaa.
function isoToBR(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

function brToISO(br: string): string | null {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  // Rejeita datas impossíveis (ex.: 31/02) que o Date "rola" para o mês seguinte.
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function isoToDate(iso: string): Date | undefined {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
}

function dateToISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

interface Props {
  value: string; // "YYYY-MM-DD" ou ""
  onChange: (iso: string) => void;
  id?: string;
}

export function DatePicker({ value, onChange, id }: Props) {
  // `value` (form) é a fonte da verdade. `text` é só o buffer de digitação;
  // é atualizado apenas em handlers (nunca via useEffect), evitando loops de render.
  const [text, setText] = useState(() => isoToBR(value));
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => isoToDate(value) ?? new Date());

  const selected = isoToDate(value);

  const handleType = (raw: string) => {
    const masked = maskDate(raw);
    setText(masked);
    if (masked === "") {
      onChange("");
      return;
    }
    const iso = brToISO(masked);
    if (iso) {
      const parsed = isoToDate(iso);
      onChange(iso);
      if (parsed) setMonth(parsed);
    }
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const iso = dateToISO(date);
    onChange(iso);
    setText(isoToBR(iso));
    setMonth(date);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        id={id}
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={text}
        onChange={(e) => handleType(e.target.value)}
        className={fieldClass}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Abrir calendário"
            className={cn(
              "absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center",
              "rounded text-foreground-muted hover:bg-surface-secondary focus:outline-none focus:ring-1 focus:ring-ring",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
