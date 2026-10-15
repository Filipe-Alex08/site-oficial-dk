"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, LogOut, Menu, Shield, UserRound, UserPlus, X } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { adminRoleOptions, graduationLabels, memberKindLabels, rankLabels } from "@/lib/member-access";
import type { AdminRole, MemberProfile } from "@/lib/types";

const activityLinks = [
  ["Swordplay/Boffering", "/atividades/swordplay"],
  ["Tipos de Atividades", "/atividades/tipos"],
  ["Jogos", "/atividades/jogos"],
  ["Graduações", "/atividades/graduacoes"],
];

type HeaderAccount = {
  email: string;
  profile: MemberProfile | null;
  roles: AdminRole[];
  avatarUrl: string | null;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [account, setAccount] = useState<HeaderAccount | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [signingOut, setSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;
    const loadAccount = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        if (active) {
          setAccount(null);
          setLoading(false);
        }
        return;
      }

      const [{ data: profileData }, { data: roleData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_admin_roles").select("role").eq("user_id", user.id),
      ]);
      if (!active) return;

      const profile = profileData as MemberProfile | null;
      const profileAvatarUrl = profile?.avatar_path
        ? supabase.storage.from("profile-avatars").getPublicUrl(profile.avatar_path).data.publicUrl
        : null;
      setAccount({
        email: user.email || "",
        profile,
        roles: ((roleData || []).map((item) => item.role).filter((role): role is AdminRole =>
          adminRoleOptions.some((option) => option.value === role),
        )),
        avatarUrl: profileAvatarUrl,
      });
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => loadAccount(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Let the auth callback finish before querying Supabase again.
      window.setTimeout(() => void loadAccount(session?.user ?? null), 0);
    });
    const refreshProfile = () => {
      void supabase.auth.getUser().then(({ data: { user } }) => loadAccount(user));
    };
    window.addEventListener("dk-profile-updated", refreshProfile);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("dk-profile-updated", refreshProfile);
    };
  }, []);

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

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setAccount(null);
    setAccountOpen(false);
    setSigningOut(false);
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">DK</span>
          <span className="brand-copy"><strong>Death Knights</strong><small>Swordplay • Belo Horizonte</small></span>
        </Link>

        <button className="menu-toggle" type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <nav className={"main-nav " + (open ? "is-open" : "")} aria-label="Menu principal">
          <Link className={active("/") ? "active" : ""} href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link className={active("/sobre") ? "active" : ""} href="/sobre" onClick={() => setOpen(false)}>Sobre</Link>
          <div className="nav-dropdown">
            <button className={active("/atividades") ? "active" : ""} type="button">Atividades <ChevronDown size={15} /></button>
            <div className="dropdown-panel">
              {activityLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
            </div>
          </div>
          <Link className={active("/midias") ? "active" : ""} href="/midias" onClick={() => setOpen(false)}>Mídias</Link>
          <Link className={active("/eventos") ? "active" : ""} href="/eventos" onClick={() => setOpen(false)}>Eventos</Link>
        </nav>

        <div className="header-account" ref={accountRef}>
          <button
            className="header-account-trigger"
            type="button"
            aria-label={loading ? "Carregando conta" : account ? `Conta de ${displayName}` : "Acessar conta"}
            aria-expanded={accountOpen}
            aria-haspopup="true"
            onClick={() => setAccountOpen((value) => !value)}
          >
            <span className="header-avatar">
              {account?.avatarUrl ? <Image src={account.avatarUrl} alt="" width={35} height={35} unoptimized /> : account ? initials : <UserRound size={19} />}
            </span>
            <span className="header-account-label">{loading ? "Conta" : account ? displayName : "Acessar"}</span>
            <ChevronDown className="header-account-chevron" size={15} />
          </button>

          <div className={`account-dropdown ${accountOpen ? "is-open" : ""}`} aria-hidden={!accountOpen} inert={!accountOpen}>
            {account ? <>
              <div className="account-summary">
                <strong>{displayName}</strong>
                <span>{account.email}</span>
                {approved && account.profile && <small>{rankLabels[account.profile.rank]} · {memberKindLabels[account.profile.member_kind]}{account.profile.graduation_level !== "sem_graduacao" ? ` · ${graduationLabels[account.profile.graduation_level]}` : ""}</small>}
                {account.profile && !approved && <small className="account-status">Cadastro {account.profile.status}</small>}
                {!account.profile && <small className="account-status">Perfil não localizado</small>}
              </div>
              {approved ? <div className="account-links">
                <Link href="/membro" onClick={() => setAccountOpen(false)}><UserRound size={16} /> Área do membro</Link>
                <Link href="/membro/atividades" onClick={() => setAccountOpen(false)}>Atividades e presenças</Link>
                <Link href="/membro/documentos" onClick={() => setAccountOpen(false)}>Documentos internos</Link>
                {account.roles.length > 0 && <>
                  <span className="account-links-heading"><Shield size={14} /> Administração</span>
                  <Link href="/admin" onClick={() => setAccountOpen(false)}>Painel administrativo</Link>
                </>}
              </div> : <div className="account-links"><Link href="/area-do-membro/login" onClick={() => setAccountOpen(false)}><UserRound size={16} /> Ver acesso do membro</Link></div>}
              <button className="account-signout" type="button" onClick={signOut} disabled={signingOut}><LogOut size={16} /> {signingOut ? "Saindo…" : "Sair da conta"}</button>
            </> : <>
              <div className="account-summary"><strong>Bem-vindo ao DK</strong><span>Entre para acessar sua área ou crie uma conta por convite.</span></div>
              <div className="account-links">
                <Link href="/area-do-membro/login" onClick={() => setAccountOpen(false)}><LogIn size={16} /> Entrar</Link>
                <Link href="/area-do-membro/cadastro" onClick={() => setAccountOpen(false)}><UserPlus size={16} /> Registrar-se</Link>
              </div>
            </>}
          </div>
        </div>
      </div>
    </header>
  );
}
