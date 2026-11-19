"use client";

import { ArrowRight, Check, CheckCircle2, Medal, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/admin/ui/Avatar";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import Select from "@/components/ui/Select";
import { graduationLabels, graduationOptions, graduationTracks, isCommander, rankGroups, rankLabels } from "@/lib/member-access";
import type { DkRank, GraduationLevel, MemberProfile } from "@/lib/types";

export type RequestAdjustments = Partial<{
  rank: DkRank;
  graduation_cavalaria: GraduationLevel;
  graduation_arquearia: GraduationLevel;
  commander_cavalaria: boolean;
  commander_arquearia: boolean;
}>;

/** Valores que o pedido deixaria em vigor; o que o pedido não trouxe continua como está. */
type RequestValues = {
  rank: DkRank;
  graduation_cavalaria: GraduationLevel;
  graduation_arquearia: GraduationLevel;
  commander_cavalaria: boolean;
  commander_arquearia: boolean;
};
type Draft = RequestValues & { requestId: string };

type Props = {
  members: MemberProfile[];
  currentUserId: string;
  principal: boolean;
  busyId: string | null;
  /** O painel pode mudar a situação deste membro? (nunca a própria conta nem outro ADM Principal) */
  canManage: (member: MemberProfile) => boolean;
  canEditAccess: (member: MemberProfile) => boolean;
  onSetStatus: (member: MemberProfile, status: "aprovado" | "recusado") => void;
  onReviewRequest: (member: MemberProfile, action: "approve" | "reject", adjustments?: RequestAdjustments) => void;
  onEditAccess: (member: MemberProfile) => void;
};

const rankOptions = rankGroups.flatMap((group) => group.ranks.map((rank) => ({ value: rank.value, label: rank.label, group: group.category })));
const levelOptions = graduationOptions.map((item) => ({ value: item.value, label: item.label }));
const commanderOptions = [{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }];
const yesNo = (value: boolean) => (value ? "Sim" : "Não");

function requestedValues(member: MemberProfile): RequestValues {
  const values = {
    rank: member.requested_rank ?? member.rank,
    graduation_cavalaria: member.requested_graduation_cavalaria ?? member.graduation_cavalaria ?? "sem_graduacao",
    graduation_arquearia: member.requested_graduation_arquearia ?? member.graduation_arquearia ?? "sem_graduacao",
  };
  // Sem graduação na trilha não existe comandante (o servidor aplica a mesma regra).
  return {
    ...values,
    commander_cavalaria: values.graduation_cavalaria !== "sem_graduacao" && (member.requested_commander_cavalaria ?? member.commander_cavalaria ?? false),
    commander_arquearia: values.graduation_arquearia !== "sem_graduacao" && (member.requested_commander_arquearia ?? member.commander_arquearia ?? false),
  };
}

function adjustmentsOf(requested: RequestValues, draft: RequestValues): RequestAdjustments {
  const adjustments: RequestAdjustments = {};
  if (draft.rank !== requested.rank) adjustments.rank = draft.rank;
  for (const track of graduationTracks) {
    if (draft[track.field] !== requested[track.field]) adjustments[track.field] = draft[track.field];
    if (draft[track.commanderField] !== requested[track.commanderField]) adjustments[track.commanderField] = draft[track.commanderField];
  }
  return adjustments;
}

type Row = {
  key: keyof RequestValues;
  label: string;
  kind: "rank" | "level" | "commander";
  from: string;
  to: string;
  asked: string;
  /** Linha de comandante com a graduação da trilha zerada: nada a decidir. */
  locked?: boolean;
};

export default function MemberQueue({ members, currentUserId, principal, busyId, canManage, canEditAccess, onSetStatus, onReviewRequest, onEditAccess }: Props) {
  // Um rascunho vale só para o pedido em que foi criado: se o membro pedir outra coisa, ele é descartado.
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  if (!members.length) {
    return <div className="empty-state"><CheckCircle2 /><h3>Nenhuma pendência</h3></div>;
  }

  function startAdjust(member: MemberProfile) {
    if (!member.access_request_id) return;
    setDrafts((current) => ({ ...current, [member.id]: { ...requestedValues(member), requestId: member.access_request_id as string } }));
  }
  function updateDraft(memberId: string, patch: Partial<RequestValues>) {
    setDrafts((current) => {
      const draft = current[memberId];
      if (!draft) return current;
      const next = { ...draft, ...patch };
      // Graduação zerada numa trilha: o comando dela cai junto.
      for (const track of graduationTracks) {
        if (next[track.field] === "sem_graduacao") next[track.commanderField] = false;
      }
      return { ...current, [memberId]: next };
    });
  }
  function stopAdjust(memberId: string) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[memberId];
      return next;
    });
  }

  return <div className="queue-list">
    <p className="queue-count" role="status">{members.length} {members.length === 1 ? "item na fila" : "itens na fila"}</p>
    {members.map((member) => {
      const isSelf = member.id === currentUserId;
      const newRegistration = member.status === "pendente";
      const dataRequest = Boolean(member.access_request_id);
      const graduationReview = principal && Boolean(member.graduation_review_needed);
      const busy = busyId === member.id;
      const blocked = isSelf || (newRegistration && !canManage(member));

      const requested = requestedValues(member);
      const stored = drafts[member.id];
      const draft = stored && stored.requestId === member.access_request_id ? stored : null;
      const shown: RequestValues = draft ?? requested;
      const adjustments = draft ? adjustmentsOf(requested, draft) : {};
      const adjusted = Object.keys(adjustments).length > 0;

      const rows: Row[] = [
        { key: "rank", kind: "rank", label: "Patente", from: rankLabels[member.rank], to: rankLabels[shown.rank], asked: rankLabels[requested.rank] },
        ...graduationTracks.flatMap((track): Row[] => {
          const currentCommander = isCommander(member[track.field], member[track.commanderField]);
          const commanderRow: Row = {
            key: track.commanderField,
            kind: "commander",
            label: `Comandante de ${track.label}`,
            from: yesNo(currentCommander),
            to: yesNo(shown[track.commanderField]),
            asked: yesNo(requested[track.commanderField]),
            locked: shown[track.field] === "sem_graduacao",
          };
          // A linha de comandante só aparece quando há algo a decidir: já é, foi pedido, ou o
          // revisor está ajustando uma trilha que tem graduação.
          const relevant = currentCommander || requested[track.commanderField] || shown[track.commanderField] || (Boolean(draft) && !commanderRow.locked);
          return [
            {
              key: track.field,
              kind: "level",
              label: `Graduação em ${track.label}`,
              from: graduationLabels[member[track.field] ?? "sem_graduacao"],
              to: graduationLabels[shown[track.field]],
              asked: graduationLabels[requested[track.field]],
            },
            ...(relevant ? [commanderRow] : []),
          ];
        }),
      ];

      return <article className={`queue-card${blocked ? " is-blocked" : ""}`} key={member.id}>
        <header className="queue-card-head">
          <div className="queue-person">
            <Avatar name={member.nickname} path={member.avatar_path} size={44} />
            <div>
              <h3>{member.nickname} <BirthdayBadge birthDate={member.birth_date} /></h3>
              <p>{member.full_name}{member.email ? ` · ${member.email}` : ""}</p>
            </div>
          </div>
          <div className="queue-tags">
            {newRegistration && <span className="badge pendente">Novo cadastro</span>}
            {dataRequest && <span className="badge pendente">Conferência de dados</span>}
            {graduationReview && <span className="badge pendente">Graduação a revisar</span>}
          </div>
        </header>

        {dataRequest && <div className="queue-diff">
          <table>
            <thead><tr><th>Item</th><th>Atual</th><th aria-hidden="true" /><th>{draft ? "Aprovar como" : "Informado"}</th></tr></thead>
            <tbody>{rows.map((row) => {
              const changed = row.from !== row.to;
              const rowAdjusted = Boolean(draft) && row.to !== row.asked;
              const selectId = `adjust-${member.id}-${row.key}`;
              return <tr key={row.key} className={`${changed ? "is-changed" : ""}${rowAdjusted ? " is-adjusted" : ""}`}>
                <td>{row.label}</td>
                <td>{row.from}</td>
                <td className="queue-arrow">{changed && <ArrowRight aria-label="muda para" />}</td>
                <td>{draft
                  ? <>
                    {row.kind === "commander"
                      ? <Select
                        id={selectId}
                        value={draft[row.key as "commander_cavalaria" | "commander_arquearia"] ? "sim" : "nao"}
                        options={commanderOptions}
                        onChange={(value) => updateDraft(member.id, { [row.key]: value === "sim" } as Partial<RequestValues>)}
                        disabled={busy || row.locked}
                      />
                      : <Select
                        id={selectId}
                        value={draft[row.key] as string}
                        options={row.kind === "rank" ? rankOptions : levelOptions}
                        onChange={(value) => updateDraft(member.id, { [row.key]: value } as Partial<RequestValues>)}
                        disabled={busy}
                      />}
                    {rowAdjusted && <small className="queue-asked">Pedido do membro: {row.asked}</small>}
                  </>
                  : row.to}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>}

        {graduationReview && !dataRequest && <p className="queue-note">Tinha graduação, mas a ordem não dizia a trilha. Defina o nível em cada trilha.</p>}

        <div className="queue-actions">
          {isSelf && <p className="form-help">Sua própria solicitação precisa ser analisada por outro administrador.</p>}
          {!isSelf && newRegistration && !canManage(member) && <p className="form-help">Esta conta só pode ser analisada pelo ADM Principal.</p>}

          {graduationReview && canEditAccess(member) && <button className="button button-ghost" type="button" disabled={busy} onClick={() => onEditAccess(member)}><Medal aria-hidden="true" /> Definir graduação</button>}

          {dataRequest && !isSelf && (draft
            ? <>
              <button className="button button-ghost" type="button" disabled={busy} onClick={() => stopAdjust(member.id)}>Cancelar</button>
              <button className="button button-ghost" type="button" disabled={busy} onClick={() => onReviewRequest(member, "reject")}><X aria-hidden="true" /> Recusar</button>
              <button className="button button-primary" type="button" disabled={busy} onClick={() => onReviewRequest(member, "approve", adjusted ? adjustments : undefined)}><Check aria-hidden="true" /> {adjusted ? "Aprovar ajustado" : "Aprovar"}</button>
            </>
            : <>
              <button className="button button-ghost" type="button" disabled={busy} onClick={() => startAdjust(member)}><SlidersHorizontal aria-hidden="true" /> Ajustar</button>
              <button className="button button-ghost" type="button" disabled={busy} onClick={() => onReviewRequest(member, "reject")}><X aria-hidden="true" /> Recusar</button>
              <button className="button button-primary" type="button" disabled={busy} onClick={() => onReviewRequest(member, "approve")}><Check aria-hidden="true" /> Aprovar</button>
            </>)}

          {newRegistration && !isSelf && canManage(member) && <>
            <button className="button button-danger" type="button" disabled={busy} onClick={() => onSetStatus(member, "recusado")}><X aria-hidden="true" /> Recusar</button>
            <button className="button button-primary" type="button" disabled={busy} onClick={() => onSetStatus(member, "aprovado")}><Check aria-hidden="true" /> Aprovar</button>
          </>}
        </div>
      </article>;
    })}
  </div>;
}
