"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeTemplateData } from "@/lib/content-templates";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import type { ContentTemplate, ContentTemplateDataMap, ContentTemplateKind } from "@/lib/types";

const queryKey = (kind: ContentTemplateKind) => ["content-templates", kind] as const;

function toError(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? String((error as { code: unknown }).code) : "";
  if (code === "23505") return new Error("Já existe um template com esse nome.");
  return new Error(friendlyError(error));
}

export type TemplateStore<K extends ContentTemplateKind> = {
  templates: ContentTemplate<K>[];
  isLoading: boolean;
  isError: boolean;
  isBusy: boolean;
  reload: () => void;
  create: (name: string, data: ContentTemplateDataMap[K]) => Promise<ContentTemplate<K>>;
  update: (id: string, changes: { name?: string; data?: ContentTemplateDataMap[K] }) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

/** Templates compartilhados de um tipo. A permissão é conferida pela RLS da tabela. */
export function useContentTemplates<K extends ContentTemplateKind>(kind: K, enabled = true): TemplateStore<K> {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKey(kind),
    enabled: enabled && Boolean(supabase),
    queryFn: async () => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      const { data, error } = await supabase.from("content_templates").select("*").eq("kind", kind).order("name");
      if (error) throw toError(error);
      return ((data ?? []) as Array<Omit<ContentTemplate<K>, "data"> & { data: unknown }>).map((row) => ({ ...row, data: normalizeTemplateData(kind, row.data) })) as ContentTemplate<K>[];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKey(kind) });

  const createMutation = useMutation({
    mutationFn: async ({ name, data }: { name: string; data: ContentTemplateDataMap[K] }) => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      const { data: row, error } = await supabase.from("content_templates").insert({ kind, name, data }).select("*").single();
      if (error) throw toError(error);
      return { ...row, data: normalizeTemplateData(kind, row.data) } as ContentTemplate<K>;
    },
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: { name?: string; data?: ContentTemplateDataMap[K] } }) => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      const { data: rows, error } = await supabase.from("content_templates").update(changes).eq("id", id).select("id");
      if (error) throw toError(error);
      // RLS não devolve erro quando nega o UPDATE: só não casa nenhuma linha.
      if (!rows?.length) throw new Error("Template não encontrado ou sem permissão para alterar.");
    },
    onSuccess: refresh,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      const { data: rows, error } = await supabase.from("content_templates").delete().eq("id", id).select("id");
      if (error) throw toError(error);
      if (!rows?.length) throw new Error("Template não encontrado ou sem permissão para excluir.");
    },
    onSuccess: refresh,
  });

  return {
    templates: query.data ?? [],
    isLoading: query.isPending && query.fetchStatus !== "idle",
    isError: query.isError,
    isBusy: createMutation.isPending || updateMutation.isPending || removeMutation.isPending,
    reload: () => void query.refetch(),
    create: (name, data) => createMutation.mutateAsync({ name, data }),
    update: (id, changes) => updateMutation.mutateAsync({ id, changes }),
    remove: (id) => removeMutation.mutateAsync(id),
  };
}
