"use client";

import { Dispatch, FormEvent, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Eye, EyeOff, Info, KeyRound, Lock, Mail, Medal, Save, ShieldCheck, Swords, UserRound, X, type LucideIcon } from "lucide-react";
import Select from "@/components/ui/Select";
import TrackGroup from "@/components/member/TrackGroup";
import EmailChangeFields from "@/components/member/EmailChangeFields";
import SecurityPhraseFields from "@/components/member/SecurityPhraseFields";
import { BuildInsignia, GraduationInsignia, RankInsignia } from "@/components/member/Insignia";
import { buildOptions, getBuildIcon, normalizeBuildName } from "@/lib/insignias";
import { jsonApiFetch } from "@/lib/api-client";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/account-password";
import { graduationOptions, graduationTracks, houseFor, rankGroups } from "@/lib/member-access";
import { getZodiacSign } from "@/lib/zodiac";
import { maskPhone, phoneFieldValue } from "@/lib/phone";
import type { DkRank, GraduationLevel, MemberProfile } from "@/lib/types";

export type ProfileFormState = {
  rank: DkRank;
  graduation_cavalaria: GraduationLevel;
  graduation_arquearia: GraduationLevel;
  commander_cavalaria: boolean;
  commander_arquearia: boolean;
  full_name: string;
  nickname: string;
  birth_date: string;
  house_cavalaria: string;
  house_arquearia: string;
  shirt_number: string;
  primary_build: string;
  secondary_build: string;
  whatsapp: string;
};
export type PasswordState = { current: string; next: string; confirm: string };
export type ProfileFormErrors = { nickname?: string; whatsapp?: string; password?: string; general?: string };

export const EMPTY_PASSWORD: PasswordState = { current: "", next: "", confirm: "" };

/** Valores iniciais do formulário: o que o membro pediu por último, senão o que está valendo. */
export function profileFormFrom(profile: MemberProfile): ProfileFormState {
  return {
    rank: profile.requested_rank ?? profile.rank,
    graduation_cavalaria: profile.requested_graduation_cavalaria ?? profile.graduation_cavalaria ?? "sem_graduacao",
    graduation_arquearia: profile.requested_graduation_arquearia ?? profile.graduation_arquearia ?? "sem_graduacao",
    commander_cavalaria: profile.requested_commander_cavalaria ?? profile.commander_cavalaria ?? false,
    commander_arquearia: profile.requested_commander_arquearia ?? profile.commander_arquearia ?? false,
    full_name: profile.full_name,
    nickname: profile.nickname,
    birth_date: profile.birth_date || "",
    house_cavalaria: houseFor(profile, "cavalaria"),
    house_arquearia: houseFor(profile, "arquearia"),
    shirt_number: profile.shirt_number?.toString() || "",
    primary_build: normalizeBuildName(profile.primary_build),
    secondary_build: normalizeBuildName(profile.secondary_build),
    whatsapp: profile.whatsapp ? phoneFieldValue(profile.whatsapp) : "",
  };
}

/** Quantos campos diferem do estado inicial; a troca de senha conta como uma alteração. */
export function countProfileChanges(initial: ProfileFormState, form: ProfileFormState, password: PasswordState): number {
  const changed = (Object.keys(initial) as Array<keyof ProfileFormState>).filter((key) => initial[key] !== form[key]).length;
  return changed + (password.current || password.next || password.confirm ? 1 : 0);
}

const SECTIONS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "identidade", label: "Identidade", icon: UserRound },
  { id: "combate", label: "Combate", icon: Swords },
  { id: "trilhas", label: "Trilhas", icon: Medal },
  { id: "seguranca", label: "Segurança", icon: Lock },
];
const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), [tabindex="0"]';
const rankOptions = rankGroups.flatMap((group) => group.ranks.map((rank) => ({ ...rank, group: group.category })));

type Props = {
  profile: MemberProfile;
  /** false para quem entra só pelo Google: não há senha atual, então a senha nasce pelo link do e-mail. */
  hasPassword: boolean;
  securityPhrase: string;
  form: ProfileFormState;
  setForm: Dispatch<SetStateAction<ProfileFormState>>;
  password: PasswordState;
  setPassword: Dispatch<SetStateAction<PasswordState>>;
  passwordOpen: boolean;
  setPasswordOpen: (open: boolean) => void;
  errors: ProfileFormErrors;
  clearError: (key: keyof ProfileFormErrors) => void;
  changes: number;
  saving: boolean;
  closing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function ProfileEditDialog({
  profile, hasPassword, securityPhrase, form, setForm, password, setPassword, passwordOpen, setPasswordOpen,
  errors, clearError, changes, saving, closing, onSubmit, onClose,
}: Props) {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false);
  const [resetLink, setResetLink] = useState<{ status: "idle" | "sending" | "sent"; error: string }>({ status: "idle", error: "" });
  const dialogRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);

  const showConfirm = confirmDiscard && changes > 0 && !saving;
  const update = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  // Sem graduação na trilha não existe comandante: a marca cai junto.
  const updateLevel = (track: (typeof graduationTracks)[number], level: GraduationLevel) =>
    setForm((current) => ({ ...current, [track.field]: level, ...(level === "sem_graduacao" ? { [track.commanderField]: false } : {}) }));
  // Aplica a máscara e devolve o cursor para depois do mesmo número de dígitos.
  const updatePhone = (input: HTMLInputElement) => {
    const caret = input.selectionStart ?? input.value.length;
    const atEnd = caret === input.value.length;
    const digitsBefore = input.value.slice(0, caret).replace(/\D/g, "").length;
    const masked = maskPhone(input.value);
    input.value = masked;
    if (!atEnd) {
      let position = 0;
      for (let seen = 0; position < masked.length && seen < digitsBefore; position++) if (/\d/.test(masked[position])) seen++;
      input.setSelectionRange(position, position);
    }
    clearError("whatsapp");
    update("whatsapp", masked);
  };
  const updatePassword = (key: keyof PasswordState, value: string) => {
    clearError("password");
    setPassword((current) => ({ ...current, [key]: value }));
  };

  // Com alterações pendentes, o primeiro pedido para fechar só pergunta se pode descartar.
  const requestClose = useCallback(() => {
    if (saving) return;
    if (changes > 0) setConfirmDiscard(true);
    else onClose();
  }, [saving, changes, onClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // O seletor personalizado fecha o próprio menu com Esc e já marca o evento.
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (showConfirm) setConfirmDiscard(false);
        else requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose, showConfirm]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => { if (errors.nickname) nicknameRef.current?.focus(); }, [errors.nickname]);
  useEffect(() => { if (errors.whatsapp) whatsappRef.current?.focus(); }, [errors.whatsapp]);
  useEffect(() => { if (errors.password) passwordErrorRef.current?.scrollIntoView({ block: "nearest" }); }, [errors.password]);

  function syncActiveSection() {
    const content = contentRef.current;
    if (!content) return;
    let current = SECTIONS[0].id;
    if (content.scrollTop > 0 && content.scrollTop + content.clientHeight >= content.scrollHeight - 4) {
      current = SECTIONS[SECTIONS.length - 1].id;
    } else {
      const top = content.getBoundingClientRect().top;
      for (const section of SECTIONS) {
        const node = content.querySelector<HTMLElement>(`[data-section="${section.id}"]`);
        if (node && node.getBoundingClientRect().top - top <= 96) current = section.id;
      }
    }
    setActive(current);
  }

  function goTo(id: string) {
    const content = contentRef.current;
    const node = content?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!content || !node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    content.scrollTo({ top: Math.max(0, node.offsetTop - 12), behavior: reduced ? "auto" : "smooth" });
    setActive(id);
  }

  // Manda o link de redefinição para o e-mail da própria conta (a rota usa a sessão).
  async function sendResetLink() {
    setResetLink({ status: "sending", error: "" });
    try {
      const response = await jsonApiFetch("/api/auth/password-reset", {});
      const data = await response.json().catch(() => null);
      setResetLink(response.ok
        ? { status: "sent", error: "" }
        : { status: "idle", error: data?.error ?? "Não foi possível enviar o e-mail agora. Tente novamente." });
    } catch {
      setResetLink({ status: "idle", error: "Sem conexão com o servidor. Tente novamente." });
    }
  }

  function togglePassword() {
    if (passwordOpen) {
      setPassword(EMPTY_PASSWORD);
      clearError("password");
      setReveal(false);
      setResetLink({ status: "idle", error: "" });
    }
    setPasswordOpen(!passwordOpen);
  }

  const approvalNeeded = {
    rank: form.rank !== profile.rank,
    graduation_cavalaria: form.graduation_cavalaria !== (profile.graduation_cavalaria ?? "sem_graduacao"),
    graduation_arquearia: form.graduation_arquearia !== (profile.graduation_arquearia ?? "sem_graduacao"),
    commander_cavalaria: form.commander_cavalaria !== (profile.commander_cavalaria ?? false),
    commander_arquearia: form.commander_arquearia !== (profile.commander_arquearia ?? false),
  };
  const zodiac = getZodiacSign(form.birth_date);
  const passwordType = reveal ? "text" : "password";

  return createPortal(
    <div
      className={`game-modal-backdrop profile-dialog-backdrop${closing ? " is-closing" : ""}`}
      onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}
    >
      <section ref={dialogRef} className="game-modal profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title">
        <header className="game-modal-header profile-dialog-header">
          <div>
            <span className="eyebrow">Área do membro</span>
            <h2 id="profile-dialog-title">Editar perfil</h2>
          </div>
          <button className="icon-button" type="button" onClick={requestClose} disabled={saving} aria-label="Fechar" title="Fechar">
            <X aria-hidden="true" />
          </button>
        </header>

        <nav className="profile-dialog-nav" aria-label="Seções do formulário">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className="profile-dialog-chip" aria-current={active === id ? "true" : undefined} onClick={() => goTo(id)}>
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>

        <form className="profile-dialog-form" onSubmit={onSubmit}>
          <div className="profile-dialog-content" ref={contentRef} onScroll={syncActiveSection}>
            {profile.access_request_id && (
              <p className="profile-dialog-note" role="status"><Info size={16} aria-hidden="true" /> Alteração de patente, graduação ou comando aguardando aprovação.</p>
            )}

            <section className="profile-dialog-section" data-section="identidade" aria-labelledby="profile-section-identidade">
              <h3 id="profile-section-identidade">Identidade</h3>
              <div className="form-grid profile-dialog-grid">
                <div className="field">
                  <label htmlFor="member-full-name">Nome completo</label>
                  <input id="member-full-name" value={form.full_name} minLength={2} maxLength={120} required autoFocus autoComplete="name" onChange={(event) => update("full_name", event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="member-nickname">Apelido</label>
                  <div className="profile-dialog-affix">
                    <span aria-hidden="true">@</span>
                    <input
                      ref={nicknameRef}
                      id="member-nickname"
                      value={form.nickname}
                      minLength={2}
                      maxLength={60}
                      required
                      aria-invalid={errors.nickname ? true : undefined}
                      aria-describedby={errors.nickname ? "member-nickname-error" : undefined}
                      onChange={(event) => { clearError("nickname"); update("nickname", event.target.value); }}
                    />
                  </div>
                  {errors.nickname && <p id="member-nickname-error" className="profile-dialog-error" role="alert">{errors.nickname}</p>}
                </div>
                <div className="field">
                  <label htmlFor="member-birth-date">Data de nascimento</label>
                  <input id="member-birth-date" type="date" value={form.birth_date} onChange={(event) => update("birth_date", event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="member-zodiac-sign">Signo do Zodíaco</label>
                  <input id="member-zodiac-sign" className="profile-dialog-readonly" value={zodiac} readOnly aria-readonly="true" placeholder="Preenchido pela data de nascimento" />
                </div>
                <div className="field">
                  <label htmlFor="member-whatsapp">Celular</label>
                  <input
                    ref={whatsappRef}
                    id="member-whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={24}
                    placeholder="Opcional"
                    value={form.whatsapp}
                    aria-invalid={errors.whatsapp ? true : undefined}
                    aria-describedby={errors.whatsapp ? "member-whatsapp-error" : undefined}
                    onChange={(event) => updatePhone(event.target)}
                  />
                  {errors.whatsapp && <p id="member-whatsapp-error" className="profile-dialog-error" role="alert">{errors.whatsapp}</p>}
                </div>
              </div>
            </section>

            <section className="profile-dialog-section" data-section="combate" aria-labelledby="profile-section-combate">
              <h3 id="profile-section-combate">Combate</h3>
              <div className="form-grid profile-dialog-grid">
                <div className="field">
                  <div className="profile-dialog-label-row">
                    <label htmlFor="profile-rank">Patente</label>
                    <RankInsignia rank={form.rank} variant="icon" />
                    {approvalNeeded.rank && <span className="profile-dialog-pill">Requer aprovação</span>}
                  </div>
                  <Select id="profile-rank" value={form.rank} options={rankOptions} onChange={(value) => update("rank", value as DkRank)} />
                </div>
                <div className="field">
                  <label htmlFor="member-shirt-number">Número da camisa</label>
                  <input id="member-shirt-number" type="number" inputMode="numeric" min="0" step="1" value={form.shirt_number} onChange={(event) => update("shirt_number", event.target.value)} />
                </div>
                <div className="field">
                  <div className="profile-dialog-label-row">
                    <label htmlFor="member-primary-build">Build principal</label>
                    {getBuildIcon(form.primary_build) && <BuildInsignia build={form.primary_build} variant="icon" />}
                  </div>
                  <input id="member-primary-build" list="member-build-options" value={form.primary_build} maxLength={120} placeholder="Escolha ou escreva" onChange={(event) => update("primary_build", event.target.value)} />
                </div>
                <div className="field">
                  <div className="profile-dialog-label-row">
                    <label htmlFor="member-secondary-build">Build secundária</label>
                    {getBuildIcon(form.secondary_build) && <BuildInsignia build={form.secondary_build} variant="icon" />}
                  </div>
                  <input id="member-secondary-build" list="member-build-options" value={form.secondary_build} maxLength={120} placeholder="Opcional" onChange={(event) => update("secondary_build", event.target.value)} />
                </div>
                <datalist id="member-build-options">{buildOptions.map((build) => <option key={build} value={build} />)}</datalist>
              </div>
            </section>

            <section className="profile-dialog-section" data-section="trilhas" aria-labelledby="profile-section-trilhas">
              <h3 id="profile-section-trilhas">Trilhas</h3>
              <div className="profile-dialog-tracks">
                {graduationTracks.map((track) => {
                  const level = form[track.field];
                  const hasLevel = level !== "sem_graduacao";
                  return (
                    <TrackGroup
                      key={track.value}
                      title={track.label}
                      icon={hasLevel ? <GraduationInsignia level={level} track={track.value} variant="icon" commander={form[track.commanderField]} /> : undefined}
                      tier={hasLevel ? level : undefined}
                    >
                      <div className="field">
                        <div className="profile-dialog-label-row">
                          <label htmlFor={`profile-${track.field}`}>Graduação</label>
                          {approvalNeeded[track.field] && <span className="profile-dialog-pill">Requer aprovação</span>}
                        </div>
                        <Select id={`profile-${track.field}`} value={level} options={graduationOptions} onChange={(value) => updateLevel(track, value as GraduationLevel)} />
                      </div>
                      <div className="field">
                        <div className="profile-dialog-label-row">
                          <label className="check-field" htmlFor={`profile-${track.commanderField}`}>
                            <input
                              id={`profile-${track.commanderField}`}
                              type="checkbox"
                              checked={hasLevel && form[track.commanderField]}
                              disabled={!hasLevel}
                              onChange={(event) => update(track.commanderField, event.target.checked)}
                            /> Sou comandante de {track.label}
                          </label>
                          {approvalNeeded[track.commanderField] && <span className="profile-dialog-pill">Requer aprovação</span>}
                        </div>
                        {!hasLevel && <small className="form-help">Escolha uma graduação para marcar comandante.</small>}
                      </div>
                      <div className="field">
                        <label htmlFor={`member-${track.houseField}`}>Casa</label>
                        <input id={`member-${track.houseField}`} value={form[track.houseField]} maxLength={80} onChange={(event) => update(track.houseField, event.target.value)} />
                      </div>
                    </TrackGroup>
                  );
                })}
              </div>
            </section>

            <section className="profile-dialog-section" data-section="seguranca" aria-labelledby="profile-section-seguranca">
              <h3 id="profile-section-seguranca">Segurança</h3>
              {!hasPassword ? (
                <div className="profile-dialog-security-actions">
                  {resetLink.status === "sent" ? (
                    <p className="profile-dialog-sent" role="status"><CheckCircle2 size={16} aria-hidden="true" /> Link enviado para o seu e-mail. Abra-o neste navegador para criar a senha.</p>
                  ) : (
                    <button className="button button-ghost button-small" type="button" onClick={sendResetLink} disabled={resetLink.status === "sending"}>
                      <KeyRound aria-hidden="true" /> {resetLink.status === "sending" ? "Enviando…" : "Criar uma senha"}
                    </button>
                  )}
                  {resetLink.error && <p className="profile-dialog-error" role="alert">{resetLink.error}</p>}
                </div>
              ) : (
                <>
                <div className="profile-dialog-security-actions">
                  <button className="button button-ghost button-small" type="button" aria-expanded={passwordOpen} aria-controls="profile-password-fields" onClick={togglePassword}>
                    <KeyRound aria-hidden="true" /> {passwordOpen ? "Cancelar" : "Alterar senha"}
                  </button>
                  {profile.email && (
                    <button className="button button-ghost button-small" type="button" aria-expanded={emailOpen} aria-controls="profile-email-fields" onClick={() => setEmailOpen((open) => !open)}>
                      <Mail aria-hidden="true" /> {emailOpen ? "Cancelar" : "Alterar e-mail"}
                    </button>
                  )}
                </div>
                {emailOpen && profile.email && <div id="profile-email-fields"><EmailChangeFields currentEmail={profile.email} /></div>}
                {passwordOpen && (
                  <div id="profile-password-fields" className="profile-dialog-password">
                    <div className="form-grid profile-dialog-grid">
                      <div className="field field-full">
                        <label htmlFor="member-current-password">Senha atual</label>
                        <input id="member-current-password" type={passwordType} autoComplete="current-password" value={password.current} onChange={(event) => updatePassword("current", event.target.value)} />
                        <div className="profile-dialog-forgot">
                          {resetLink.status === "sent" ? (
                            <p className="profile-dialog-sent" role="status"><CheckCircle2 size={16} aria-hidden="true" /> Link enviado para o seu e-mail. Abra-o neste navegador.</p>
                          ) : (
                            <button className="button button-ghost button-small" type="button" onClick={sendResetLink} disabled={resetLink.status === "sending"}>
                              <Mail aria-hidden="true" /> {resetLink.status === "sending" ? "Enviando…" : "Esqueci minha senha"}
                            </button>
                          )}
                        </div>
                        {resetLink.error && <p className="profile-dialog-error" role="alert">{resetLink.error}</p>}
                      </div>
                      <div className="field">
                        <label htmlFor="member-new-password">Nova senha</label>
                        <input id="member-new-password" type={passwordType} autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} value={password.next} aria-describedby="member-new-password-hint" onChange={(event) => updatePassword("next", event.target.value)} />
                      </div>
                      <div className="field">
                        <label htmlFor="member-confirm-password">Confirmar nova senha</label>
                        <input id="member-confirm-password" type={passwordType} autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} value={password.confirm} onChange={(event) => updatePassword("confirm", event.target.value)} />
                      </div>
                    </div>
                    <div className="profile-dialog-password-foot">
                      <small id="member-new-password-hint" className="profile-dialog-hint">Mínimo de {PASSWORD_MIN} caracteres.</small>
                      <button className="icon-button" type="button" aria-pressed={reveal} onClick={() => setReveal((current) => !current)} title={reveal ? "Ocultar senhas" : "Mostrar senhas"} aria-label={reveal ? "Ocultar senhas" : "Mostrar senhas"}>
                        {reveal ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
              <div className="profile-dialog-security-actions">
                <button className="button button-ghost button-small" type="button" aria-expanded={phraseOpen} aria-controls="profile-phrase-fields" onClick={() => setPhraseOpen((open) => !open)}>
                  <ShieldCheck aria-hidden="true" /> {phraseOpen ? "Fechar" : securityPhrase ? "Frase de segurança" : "Definir frase de segurança"}
                </button>
              </div>
              {phraseOpen && <div id="profile-phrase-fields"><SecurityPhraseFields initial={securityPhrase} /></div>}
              {errors.password && <p ref={passwordErrorRef} className="profile-dialog-error" role="alert">{errors.password}</p>}
            </section>
          </div>

          <footer className="profile-dialog-footer">
            {errors.general && <p className="form-message error profile-dialog-general" role="alert">{errors.general}</p>}
            <p className={`profile-dialog-status${changes > 0 ? " is-dirty" : ""}`} role="status">
              {showConfirm ? "Descartar as alterações?" : changes === 0 ? "Nenhuma alteração" : `${changes} ${changes === 1 ? "alteração" : "alterações"}`}
            </p>
            <div className="profile-dialog-actions">
              {showConfirm ? (
                <>
                  <button className="button button-ghost button-small" type="button" onClick={() => setConfirmDiscard(false)}>Voltar</button>
                  <button className="button button-danger button-small" type="button" onClick={onClose}>Descartar</button>
                </>
              ) : (
                <>
                  <button className="button button-ghost button-small" type="button" onClick={requestClose} disabled={saving}>Cancelar</button>
                  <button className="button button-primary button-small" type="submit" disabled={saving || changes === 0}><Save aria-hidden="true" /> {saving ? "Salvando…" : "Salvar"}</button>
                </>
              )}
            </div>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
