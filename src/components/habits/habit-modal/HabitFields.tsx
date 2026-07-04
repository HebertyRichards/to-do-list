"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils/cn";
import { DAYS_OF_WEEK, type HabitFormFields } from "../constants";

interface Props {
  register: UseFormRegister<HabitFormFields>;
  control: Control<HabitFormFields>;
  ids: { titleId: string; descId: string };
  titleError?: string;
  daysError?: string;
}

const fieldClass =
  "h-9 w-full rounded border border-border bg-surface-muted px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function HabitFields({ register, control, ids, titleError, daysError }: Props) {
  const t = useTranslations("habits");
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={ids.titleId}>{t("title")}</Label>
        <input id={ids.titleId} maxLength={180} className={fieldClass} {...register("title")} />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={ids.descId}>{t("description")}</Label>
        <textarea
          id={ids.descId}
          rows={3}
          placeholder={t("descriptionOptional")}
          className="w-full rounded border border-border bg-surface-muted px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          {...register("description")}
        />
      </div>

      <Controller
        name="everyDay"
        control={control}
        render={({ field: everyDay }) => (
          <Controller
            name="days"
            control={control}
            render={({ field: days }) => {
              const selected = new Set(days.value);
              const toggleDay = (value: number) => {
                if (everyDay.value) return;
                if (selected.has(value)) {
                  days.onChange(days.value.filter((d) => d !== value));
                } else {
                  days.onChange([...days.value, value].sort((a, b) => a - b));
                }
              };
              return (
                <div className="space-y-2">
                  <Label>{t("frequency")}</Label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <Checkbox
                      checked={everyDay.value}
                      onCheckedChange={(c) => everyDay.onChange(c === true)}
                    />
                    <span>{t("everyDayCheckbox")}</span>
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((d) => {
                      const active = everyDay.value || selected.has(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          disabled={everyDay.value}
                          title={t(`dayLabel.${d}`)}
                          aria-pressed={active}
                          className={cn(
                            "h-9 w-11 rounded border text-xs font-medium transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-surface-muted text-foreground-muted hover:bg-surface-secondary",
                            everyDay.value && "cursor-not-allowed opacity-70",
                          )}
                        >
                          {t(`dayShort.${d}`)}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-foreground-subtle">
                    {everyDay.value ? t("hintEveryDay") : t("hintSelectDays")}
                  </p>
                  {daysError && <p className="text-xs text-destructive">{daysError}</p>}
                </div>
              );
            }}
          />
        )}
      />
    </>
  );
}
