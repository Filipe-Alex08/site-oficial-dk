import Image from "next/image";
import { Award, Shield } from "lucide-react";
import { graduationLabels, rankLabels } from "@/lib/member-access";
import { getBuildIcon, getGraduationIcon, getGraduationTrack, rankIcons } from "@/lib/insignias";
import type { DkRank, DocumentTrack, GraduationLevel } from "@/lib/types";
import InsigniaBadge from "@/components/member/InsigniaBadge";

type Variant = "inline" | "badge" | "icon";

export function InsigniaColorFilters() {
  return <svg className="insignia-color-filters" aria-hidden="true" focusable="false" width="0" height="0">
    <defs>
      <filter id="insignia-archery-silver" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.77118 0.7152 -0.48638 0 0 0.79638 0.7152 -0.51158 0 0 0.80327 0.7152 -0.51847 0 0 0 0 0 1 0" />
      </filter>
      <filter id="insignia-archery-gold" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1.20904 0 -0.20904 0 0 0.53374 1 -0.53374 0 0 0.08339 0 0.91661 0 0 0 0 0 1 0" />
      </filter>
    </defs>
  </svg>;
}

function Insignia({ src, label, variant = "inline", kind = "rank", caption, artClass = "" }: {
  src: string | null; label: string; variant?: Variant; kind?: "rank" | "graduation" | "build"; caption?: string; artClass?: string;
}) {
  const art = <span className={`insignia-art ${artClass}`} aria-hidden="true">
      {src ? <Image src={src} alt="" width={64} height={64} /> : kind === "graduation" ? <Award /> : <Shield />}
    </span>;
  if (variant === "icon") return <span className={`insignia insignia-icon insignia-${kind}`} role="img" aria-label={label} title={label}>{art}</span>;
  if (variant === "badge") return <InsigniaBadge label={label} caption={caption} kind={kind}>{art}</InsigniaBadge>;
  return <span className={`insignia insignia-${variant} insignia-${kind}`}>
    {art}
    <span className="insignia-label">{caption && <small>{caption}</small>}{label}</span>
  </span>;
}

export function RankInsignia({ rank, variant }: { rank: DkRank; variant?: Variant }) {
  return <Insignia src={rankIcons[rank]} label={rankLabels[rank]} variant={variant} />;
}

export function GraduationInsignia({ level, order, track, variant }: {
  level: GraduationLevel; order?: string | null; track?: DocumentTrack; variant?: Variant;
}) {
  const resolvedTrack = track ?? getGraduationTrack(order);
  const label = resolvedTrack ? `${resolvedTrack === "cavalaria" ? "Cavalaria" : "Arquearia"} ${graduationLabels[level]}` : graduationLabels[level];
  return <Insignia src={getGraduationIcon(level, resolvedTrack)} label={label} variant={variant} kind="graduation" artClass={resolvedTrack === "arquearia" ? `archery-${level}` : ""} />;
}

export function BuildInsignia({ build, variant, caption }: { build?: string | null; variant?: Variant; caption?: string }) {
  if (!build) return <>Não informada</>;
  const src = getBuildIcon(build);
  if (!src) return <span>{build}</span>;
  return <Insignia src={src} label={build} variant={variant} kind="build" caption={caption} />;
}
