"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMyGroups, useCreateGroup, useJoinGroup, useRenameGroup } from "@/hooks/use-groups";
import { AppShell } from "@/components/layout/AppShell";
import { getErrorMessage } from "@/errors/codes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Key, Copy, Check, ArrowRight, Pencil, X } from "lucide-react";
import type { Group, GroupCreated } from "@/types/api";
import { useTranslations } from "next-intl";

type CreateFields = { name: string; description?: string };
type JoinFields = { key: string };

function GroupCard({ group }: { group: Group }) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const rename = useRenameGroup();
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const commitRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== group.name) {
      rename.mutate({ group_slug: group.slug, name: trimmed });
    }
    setRenaming(false);
  };

  return (
    <Card className="h-full border border-border bg-surface hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {renaming ? (
            <div className="flex flex-1 items-center gap-1.5">
              <input
                ref={inputRef}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") { setNameDraft(group.name); setRenaming(false); }
                }}
                maxLength={120}
                className="flex-1 rounded border border-ring bg-surface-muted px-2 py-1 text-sm font-semibold focus:outline-none"
                onClick={(e) => e.preventDefault()}
              />
              <button onClick={commitRename} className="text-success hover:text-success/80" title={tCommon("confirm")}>
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => { setNameDraft(group.name); setRenaming(false); }} className="text-foreground-muted" title={tCommon("cancel")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <CardTitle className="truncate flex-1">{group.name}</CardTitle>
          )}
          {!renaming && (
            <button
              onClick={(e) => { e.preventDefault(); setRenaming(true); setNameDraft(group.name); }}
              className="shrink-0 text-foreground-subtle hover:text-foreground-muted transition-colors p-1"
              title={t("rename")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground-muted line-clamp-3">
          {group.description || <span className="italic text-foreground-subtle">{t("noDescription")}</span>}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <Users className="h-3.5 w-3.5" />
            {t("memberCount", { count: group.member_count })}
          </span>
          <Link
            href={`/groups/${group.slug}`}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            onClick={(e) => renaming && e.preventDefault()}
          >
            {t("access")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GroupsClient() {
  const t = useTranslations("pages");
  const tG = useTranslations("groups");
  const [activeTab, setActiveTab] = useState("my-groups");
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const [groupSlug, setGroupSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: groups = [], isLoading, refetch } = useMyGroups();
  const create = useCreateGroup();
  const join = useJoinGroup();

  const createSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, tG("nameRequired")).max(120, tG("nameMax")),
        description: z.string().max(500, tG("descMax")).optional(),
      }),
    [tG],
  );
  const joinSchema = useMemo(
    () => z.object({ key: z.string().min(1, tG("keyRequired")) }),
    [tG],
  );

  const createForm = useForm<CreateFields>({ resolver: zodResolver(createSchema) });
  const joinForm = useForm<JoinFields>({ resolver: zodResolver(joinSchema) });

  const onCreateSubmit = (data: CreateFields) => {
    create.mutate(data, {
      onSuccess: (res: GroupCreated) => {
        setGroupKey(res.key);
        setGroupSlug(res.slug);
        toast.success(tG("createdSuccess"));
        refetch();
      },
    });
  };

  const onJoinSubmit = (data: JoinFields) => {
    join.mutate(data, {
      onSuccess: () => {
        joinForm.reset();
        toast.success(tG("toastJoinSent"));
      },
    });
  };

  const copyToClipboard = () => {
    if (!groupKey) return;
    navigator.clipboard.writeText(groupKey);
    setCopied(true);
    toast.success(tG("toastKeyCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val !== "create") {
      setGroupKey(null);
      setGroupSlug(null);
      createForm.reset();
    }
    if (val !== "join") {
      joinForm.reset();
    }
  };

  return (
    <AppShell title={t("groups")}>
      <div className="max-w-6xl w-full mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="my-groups">{tG("myGroups")}</TabsTrigger>
              <TabsTrigger value="create">{tG("createTab")}</TabsTrigger>
              <TabsTrigger value="join">{tG("joinTab")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-groups" className="outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg bg-surface min-h-[350px] space-y-4">
                <div className="rounded-full bg-surface-secondary p-4">
                  <Users className="h-8 w-8 text-foreground-subtle" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-semibold">{tG("emptyTitle")}</h3>
                  <p className="text-sm text-foreground-muted">
                    {tG("emptyBody")}
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setActiveTab("create")} variant="default">
                    <Plus className="h-4 w-4 mr-1" />
                    {tG("createTab")}
                  </Button>
                  <Button onClick={() => setActiveTab("join")} variant="secondary">
                    <Key className="h-4 w-4 mr-1" />
                    {tG("useKey")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard key={group.slug} group={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="outline-none">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>{tG("createTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                {groupKey ? (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-success font-medium text-sm">
                        <Check className="h-4 w-4" />
                        {tG("createdSuccess")}
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {tG.rich("keyWarning", { strong: (c) => <strong className="text-foreground">{c}</strong> })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-foreground-muted">{tG("accessKey")}</label>
                      <div className="flex gap-2">
                        <code className="flex-1 block rounded border bg-surface-secondary px-3 py-2.5 text-xs font-mono break-all select-all">
                          {groupKey}
                        </code>
                        <Button type="button" onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0 h-10 w-10">
                          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button asChild className="w-full">
                        <Link href={`/groups/${groupSlug}`}>
                          {tG("goToBoard")}
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Link>
                      </Button>
                      <Button type="button" onClick={() => handleTabChange("create")} variant="ghost" className="w-full">
                        {tG("createAnother")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    {create.error && (
                      <p className="text-sm text-destructive">{getErrorMessage(create.error.data?.code ?? "")}</p>
                    )}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">{tG("groupName")}</label>
                      <input
                        {...createForm.register("name")}
                        placeholder={tG("groupNamePlaceholder")}
                        className="w-full rounded border px-3 py-2 text-sm bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {createForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">{tG("descriptionLabel")}</label>
                      <textarea
                        {...createForm.register("description")}
                        placeholder={tG("descriptionPlaceholder")}
                        rows={3}
                        className="w-full rounded border px-3 py-2 text-sm bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                      {createForm.formState.errors.description && (
                        <p className="text-xs text-destructive">{createForm.formState.errors.description.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={create.isPending} className="w-full">
                      {create.isPending ? tG("creating") : tG("createTab")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="outline-none">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>{tG("joinTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                  {join.error && (
                    <p className="text-sm text-destructive">{getErrorMessage(join.error.data?.code ?? "")}</p>
                  )}
                  {join.isSuccess && (
                    <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex gap-2.5 text-sm text-success">
                      <Check className="h-5 w-5 shrink-0" />
                      <span>{tG("joinSuccessLong")}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">{tG("groupKey")}</label>
                    <input
                      {...joinForm.register("key")}
                      placeholder={tG("keyPlaceholder")}
                      className="w-full rounded border px-3 py-2 text-sm font-mono bg-surface-muted border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {joinForm.formState.errors.key && (
                      <p className="text-xs text-destructive">{joinForm.formState.errors.key.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={join.isPending} className="w-full">
                    {join.isPending ? tG("requesting") : tG("requestJoin")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
