"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/utils/statuses";
import { cn } from "@/utils/cn";
import type { TaskFilters, TaskSort } from "@/hooks/use-task-filters";
import type { Category, TaskStatus } from "@/types/api";

interface Props {
  filters: TaskFilters;
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
  reset: () => void;
  isActive: boolean;
  categories: Category[];
  assignees: string[];
  groupSlug?: string;
}

const SORT_OPTIONS: { value: TaskSort; labelKey: string }[] = [
  { value: "position", labelKey: "sortPosition" },
  { value: "due_date", labelKey: "sortDueDate" },
  { value: "created_at", labelKey: "sortCreatedAt" },
  { value: "priority", labelKey: "sortPriority" },
  { value: "title", labelKey: "sortTitle" },
];

const ALL = "__all__";

export function TaskFilterBar({
  filters,
  setFilter,
  reset,
  isActive,
  categories,
  assignees,
  groupSlug,
}: Props) {
  const t = useTranslations("filters");
  const tStatus = useTranslations("status");
  const toggleStatus = (s: TaskStatus) =>
    setFilter(
      "statuses",
      filters.statuses.includes(s)
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s],
    );

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 pt-4">
      {/* Alternância tarefa/subtarefa */}
      <div className="flex overflow-hidden rounded-md border border-border">
        {(["task", "subtask"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter("kind", k)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium transition-colors",
              filters.kind === k
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:bg-surface-secondary",
            )}
          >
            {k === "task" ? t("tasks") : t("subtasks")}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle" />
        <Input
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          placeholder={t("search")}
          className="h-8 w-44 pl-7 text-sm"
        />
      </div>

      <div className="flex gap-1">
        {STATUS_OPTIONS.map((opt) => {
          const active = filters.statuses.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-medium transition-opacity",
                opt.className,
                !active && "opacity-40 hover:opacity-70",
              )}
            >
              {tStatus(opt.key)}
            </button>
          );
        })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-40 justify-between text-xs font-normal">
            <span className="truncate">
              {filters.categories.length === 0
                ? t("allCategories")
                : filters.categories.length === 1
                  ? categories.find((c) => c.slug === filters.categories[0])?.name ??
                    t("categoriesCount", { count: 1 })
                  : t("categoriesCount", { count: filters.categories.length })}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {categories.map((c) => (
            <DropdownMenuCheckboxItem
              key={c.slug}
              checked={filters.categories.includes(c.slug)}
              onCheckedChange={(checked) =>
                setFilter(
                  "categories",
                  checked
                    ? [...filters.categories, c.slug]
                    : filters.categories.filter((s) => s !== c.slug),
                )
              }
              onSelect={(e) => e.preventDefault()}
              className="text-sm"
            >
              <span
                className="mr-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: c.color ?? "#9ca3af" }}
              />
              {c.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Responsáveis só existem em boards de grupo (no individual tudo é do usuário). */}
      {groupSlug && (
        <>
          <Select
            value={filters.assignee ?? ALL}
            onValueChange={(v) => setFilter("assignee", v === ALL ? null : v)}
          >
            <SelectTrigger size="sm" className="w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL} className="text-sm">
                {t("allAssignees")}
              </SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a} value={a} className="text-sm">
                  @{a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground-muted">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-primary"
              checked={filters.assignedToMe}
              onChange={(e) => setFilter("assignedToMe", e.target.checked)}
            />
            {t("mine")}
          </label>
        </>
      )}

      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground-muted">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-red-500"
          checked={filters.urgentOnly}
          onChange={(e) => setFilter("urgentOnly", e.target.checked)}
        />
        {t("urgent")}
      </label>

      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground-muted">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-red-500"
          checked={filters.overdueOnly}
          onChange={(e) => setFilter("overdueOnly", e.target.checked)}
        />
        {t("overdue")}
      </label>

      <Select value={filters.sort} onValueChange={(v) => setFilter("sort", v as TaskSort)}>
        <SelectTrigger size="sm" className="w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-sm">
              {t(o.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isActive && (
        <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-xs">
          <X className="mr-1 h-3.5 w-3.5" />
          {t("clear")}
        </Button>
      )}
    </div>
  );
}
