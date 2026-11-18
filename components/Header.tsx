"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, LogOut, Menu, Shield, UserPlus, UserRound, X } from "lucide-react";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import type { ClientAccount } from "@/lib/account-switch";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { adminRoleOptions, getMemberTheme } from "@/lib/member-access";
import type { AdminRole, MemberProfile } from "@/lib/types";
import { GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import { useRealtimeTables } from "@/components/RealtimeProvider";

const activityLinks = [
  ["Swordplay e Boffering", "/atividades/swordplay"],
  ["Tipos de atividades", "/atividades/tipos"],
  ["Jogos", "/atividades/jogos"],
  ["Graduações", "/atividades/graduacoes"],
];

type HeaderAccount = {
  email: string;
  profile: MemberProfile | null;
  roles: AdminRole[];
  canManageAssessments: boolean;
  canViewLogs: boolean;
  avatarUrl: string | null;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [account, setAccount] = useState<HeaderAccount | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [signingOut, setSigningOut] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<ClientAccount[]>([]);
  const [maxSaved, setMaxSaved] = useState(5);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState(pathname);
  // Ao navegar, fecha menus abertos (ajuste de estado durante a renderização).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setActivitiesOpen(false);
    setAccountOpen(false);
  }
  const reloadAccount = useRef<(() => void) | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMemberArea = pathname === "/membro" || pathname.startsWith("/membro/");
    document.documentElement.dataset.memberTheme = isMemberArea ? getMemberTheme(account?.profile) : "padrao";
    return () => { delete document.documentElement.dataset.memberTheme; };
  }, [account?.profile, pathname]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;

    // Quem está logado vem do servidor: a sessão vive num cookie que este
    // componente não lê. Não há mais evento de login para escutar — entrar e
    // sair agora navegam ou recarregam a página.
    // Uma única chamada traz conta, perfil, papéis, permissões e as contas salvas
    // neste navegador (sem credenciais). Se falhar, o cabeçalho fica no estado de
    // visitante, mas para de exibir "Conta" como se ainda estivesse carregando.
    const loadCurrentAccount = async () => {
      try {
        const response = await apiFetch("/api/auth/me");
        if (!response.ok) throw new Error(`/api/auth/me respondeu ${response.status}`);
        const data = await response.json();
        if (!active) return;

        if (!data.user) {
          setAccount(null);
          setLoading(false);
          return;
        }

        setAccount({
          email: data.user.email || "",
          profile: (data.profile ?? null) as MemberProfile | null,
          roles: ((Array.isArray(data.roles) ? data.roles : []) as string[]).filter((role): role is AdminRole =>
            adminRoleOptions.some((option) => option.value === role),
          ),
          canManageAssessments: Boolean(data.canManageAssessments),
          canViewLogs: Boolean(data.canViewLogs),
          avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : null,
        });
        setSavedAccounts(Array.isArray(data.accounts) ? data.accounts : []);
        if (typeof data.max === "number") setMaxSaved(data.max);
        setLoading(false);
      } catch {
        if (active) setLoading(false);
      }
    };

    reloadAccount.current = () => void loadCurrentAccount();
    void loadCurrentAccount();
    window.addEventListener("dk-profile-updated", loadCurrentAccount);

    return () => {
      active = false;
      reloadAccount.current = null;
      window.removeEventListener("dk-profile-updated", loadCurrentAccount);
    };
  }, []);

  // Patente, graduação ou cargo mudaram (talvez por outro administrador): o menu
  // da conta acompanha sem precisar recarregar a página. Só para quem está logado.
  useRealtimeTables(["profiles", "user_admin_roles"], () => reloadAccount.current?.(), { debounceMs: 1500, enabled: Boolean(account) });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!activitiesOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !activitiesRef.current?.contains(event.target)) setActivitiesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivitiesOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activitiesOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const approved = account?.profile?.status === "aprovado";
  const displayName = account?.profile?.nickname || account?.profile?.full_name || account?.email || "Usuário";
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  async function switchAccount(id: string) {
    setSwitchingId(id);
    setSwitchError(null);
    try {
      const response = await jsonApiFetch("/api/auth/accounts/switch", { id });
      if (response.ok) {
        // Recarrega a página inteira: nada da conta anterior (cache de dados,
        // estado de telas) pode sobrar na nova.
        window.location.reload();
        return;
      }
      const data = await response.json().catch(() => null);
      setSwitchError(data?.error ?? "Não foi possível trocar de conta.");
      if (response.status !== 500) setSavedAccounts((list) => list.filter((item) => item.id !== id));
    } catch {
      setSwitchError("Não foi possível trocar de conta agora.");
    }
    setSwitchingId(null);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      // O cookie de sessão é do servidor: só ele consegue apagá-lo.
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAccount(null);
      setSavedAccounts([]);
      setAccountOpen(false);
      setSigningOut(false);
      router.refresh();
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Death Knights, página inicial" onClick={() => setOpen(false)}>
          <Image className="brand-mark" src="/images/dk-emblem.webp" alt="Brasão DK Swordplay BH MG" width={48} height={48} />
          <span className="brand-copy"><strong>Death Knights</strong><small>Swordplay em Belo Horizonte</small></span>
        </Link>

        <button className="menu-toggle" type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <nav className={"main-nav " + (open ? "is-open" : "")} aria-label="Menu principal">
          <Link className={active("/") ? "active" : ""} href="/" onClick={() => setOpen(false)}>Início</Link>
          <Link className={active("/sobre") ? "active" : ""} href="/sobre" onClick={() => setOpen(false)}>Sobre</Link>
          <div className={"nav-dropdown " + (activitiesOpen ? "is-open" : "")} ref={activitiesRef}>
            <button className={active("/atividades") ? "active" : ""} type="button" aria-expanded={activitiesOpen} aria-haspopup="true" onClick={() => setActivitiesOpen((value) => !value)}>Atividades <ChevronDown size={15} /></button>
            <div className="dropdown-panel">
              {activityLinks.map(([label, href]) => <Link key={href} className={pathname.startsWith(href) ? "active" : ""} href={href} onClick={() => { setOpen(false); setActivitiesOpen(false); }}>{label}</Link>)}
            </div>
          </div>
          <Link className={active("/midias") ? "active" : ""} href="/midias" onClick={() => setOpen(false)}>Mídias</Link>
          <Link className={active("/eventos") ? "active" : ""} href="/eventos" onClick={() => setOpen(false)}>Eventos</Link>
        </nav>

        <div className="header-account" ref={accountRef}>
          {!account && !loading ? (
            <Link className="button button-ghost header-login" href="/area-do-membro/login"><LogIn size={16} /> Entrar</Link>
          ) : (
            <>
              <button
                className="header-account-trigger"
                type="button"
                aria-label={loading ? "Carregando conta" : `Conta de ${displayName}`}
                aria-expanded={accountOpen}
                aria-haspopup="true"
                disabled={loading}
                onClick={() => setAccountOpen((value) => !value)}
              >
                <span className="header-avatar">
                  {account?.avatarUrl ? <Image src={account.avatarUrl} alt="" width={36} height={36} unoptimized /> : account ? initials : <UserRound size={19} />}
                </span>
                <span className="header-account-label">{loading ? "Conta" : displayName}</span>
                <ChevronDown className="header-account-chevron" size={15} />
              </button>

              <div className={`account-dropdown ${accountOpen ? "is-open" : ""}`} aria-hidden={!accountOpen} inert={!accountOpen}>
                {account && <>
                  <div className="account-summary">
                    <strong>{displayName}</strong>
                    <span>{account.email}</span>
                    {approved && account.profile && <div className="account-insignias"><RankInsignia rank={account.profile.rank} /><GraduationInsignias profile={account.profile} /></div>}
                    {account.profile && !approved && <small className="account-status">Cadastro {account.profile.status}</small>}
                    {!account.profile && <small className="account-status">Cadastro incompleto</small>}
                  </div>
                  {approved && (
                    <div className="account-switcher">
                      <span className="account-links-heading"><UserRound size={14} /> Trocar de conta</span>
                      {savedAccounts.map((saved) => (
                        <button key={saved.id} className="account-switch-item" type="button" onClick={() => switchAccount(saved.id)} disabled={switchingId !== null}>
                          <span className="header-avatar">
                            {saved.avatarUrl ? <Image src={saved.avatarUrl} alt="" width={36} height={36} unoptimized /> : (saved.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || <UserRound size={19} />)}
                          </span>
                          <span className="account-switch-text">
                            <strong>{switchingId === saved.id ? "Trocando…" : saved.name}</strong>
                            <small>{saved.email}</small>
                          </span>
                        </button>
                      ))}
                      {switchError && <p className="form-message error" role="alert">{switchError}</p>}
                      {savedAccounts.length < maxSaved && (
                        <Link className="account-switch-add" href="/area-do-membro/login?adicionar=1" onClick={() => setAccountOpen(false)}><UserPlus size={16} /> Adicionar outra conta</Link>
                      )}
                    </div>
                  )}
                  {approved ? <div className="account-links">
                    <Link href="/membro" onClick={() => setAccountOpen(false)}><UserRound size={16} /> Área do membro</Link>
                    <Link href="/membro/atividades" onClick={() => setAccountOpen(false)}>Atividades e presenças</Link>
                    <Link href="/membro/documentos" onClick={() => setAccountOpen(false)}>Documentos</Link>
                    <Link href="/membro/simulados" onClick={() => setAccountOpen(false)}>Avaliações</Link>
                    {(account.roles.length > 0 || account.canManageAssessments || account.canViewLogs) && <>
                      <span className="account-links-heading"><Shield size={14} /> Administração</span>
                      <Link href="/admin" onClick={() => setAccountOpen(false)}>Painel administrativo</Link>
                    </>}
                  </div> : <div className="account-links"><Link href="/area-do-membro/login" onClick={() => setAccountOpen(false)}><UserRound size={16} /> Status do cadastro</Link></div>}
                  <button className="account-signout" type="button" onClick={signOut} disabled={signingOut}><LogOut size={16} /> {signingOut ? "Saindo…" : "Sair da conta"}</button>
                </>}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
