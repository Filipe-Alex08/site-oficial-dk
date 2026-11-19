import { cache } from "react";
import { DEFAULT_NOTES_SETTINGS, loadNotesSettings, type NotesSettings } from "@/lib/member-notes";
import { getAuth } from "@/lib/viewer";

/**
 * Configurações das anotações, lidas uma vez por requisição (o layout, a barra
 * de navegação e a página compartilham o resultado). Sem sessão, vale o padrão.
 */
export const getNotesSettings = cache(async (): Promise<NotesSettings> => {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return DEFAULT_NOTES_SETTINGS;
  return loadNotesSettings(supabase);
});
