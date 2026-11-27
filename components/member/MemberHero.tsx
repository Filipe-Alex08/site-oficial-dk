import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import BuildEmblem from "@/components/member/BuildEmblem";
import EditMemberProfile from "@/components/member/EditMemberProfile";
import { BuildInsignia, GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import MemberAvatar from "@/components/member/MemberAvatar";
import MemberStyleToggle from "@/components/member/MemberStyleToggle";
import { getBuildIcon } from "@/lib/insignias";
import type { MemberProfile } from "@/lib/types";

/**
 * Cartão de identidade do início: quem o membro é (apelido, patente, graduação,
 * builds) e as ações pessoais (editar perfil, aparência, sair). É onde o tema da
 * graduação aparece com mais força.
 */
export default function MemberHero({ profile, avatarUrl, userId, hasPassword, securityPhrase, allClear }: {
  profile: MemberProfile;
  avatarUrl: string | null;
  userId: string;
  hasPassword: boolean;
  securityPhrase: string;
  /** Nenhuma pendência para o membro: mostra a linha "Tudo em dia". */
  allClear: boolean;
}) {
  const hasPrimaryBuild = Boolean(getBuildIcon(profile.primary_build));
  const hasSecondaryBuild = Boolean(getBuildIcon(profile.secondary_build));

  return (
    <section className="m-hero" aria-labelledby="m-hero-title">
      <div className="m-hero-art" aria-hidden="true"><BuildEmblem build={profile.primary_build} /></div>
      <div className="m-hero-avatar">
        <MemberAvatar avatarUrl={avatarUrl} avatarPath={profile.avatar_path ?? null} nickname={profile.nickname} userId={userId} />
      </div>

      <div className="m-hero-id">
        <h1 id="m-hero-title"><small>Salve,</small>{profile.nickname}</h1>
        <p className="m-hero-name">{profile.full_name}</p>
        <BirthdayBadge birthDate={profile.birth_date} />
        <div className="profile-insignias" role="group" aria-label="Patente, graduação e builds">
          <RankInsignia rank={profile.rank} variant="badge" />
          <GraduationInsignias profile={profile} variant="badge" />
          {hasPrimaryBuild && <BuildInsignia build={profile.primary_build} variant="badge" caption="Principal" />}
          {hasSecondaryBuild && <BuildInsignia build={profile.secondary_build} variant="badge" caption="Secundária" />}
        </div>
      </div>

      <div className="m-hero-actions">
        <EditMemberProfile profile={profile} hasPassword={hasPassword} securityPhrase={securityPhrase} />
        <MemberStyleToggle />
      </div>

      {(profile.access_request_id || profile.graduation_review_needed || allClear) && (
        <div className="m-hero-notes">
          {profile.access_request_id && <p className="m-note is-warn" role="status"><Clock3 aria-hidden="true" /> Alteração de patente, graduação ou comando aguardando aprovação.</p>}
          {profile.graduation_review_needed && <p className="m-note is-warn" role="status"><AlertTriangle aria-hidden="true" /> Sua graduação está em revisão: um administrador vai definir o nível em cada trilha.</p>}
          {allClear && <p className="m-note is-ok"><CheckCircle2 aria-hidden="true" /> Tudo em dia.</p>}
        </div>
      )}
    </section>
  );
}
