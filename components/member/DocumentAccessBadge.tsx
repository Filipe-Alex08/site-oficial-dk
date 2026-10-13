"use client";

import { Award, LockKeyhole, Shield } from "lucide-react";
import { Fragment } from "react";
import { useState } from "react";
import { graduationLabels, rankLabels } from "@/lib/member-access";
import type { DocumentAccessRule } from "@/lib/types";

export default function DocumentAccessBadge({ rules, logic }: { rules: DocumentAccessRule[]; logic: "and" | "or" }) {
  const [open, setOpen] = useState(false);
  const items = rules.length ? rules : [];
  function label(rule: DocumentAccessRule) {
    return rule.kind === "rank"
      ? `Patente ${rankLabels[rule.minimum_rank]} ou superior`
      : `Graduação ${graduationLabels[rule.minimum_graduation]} em ${rule.track === "cavalaria" ? "Cavalaria" : "Arquearia"} ou superior`;
  }
  return <div className="document-access">
    <button className="document-access-trigger" type="button" aria-label="Ver requisitos de acesso" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {items.length ? items.map((rule, index) => rule.kind === "rank"
        ? <Shield key={`${rule.kind}-${index}`} aria-hidden="true" />
        : <Award key={`${rule.kind}-${index}`} aria-hidden="true" />) : <LockKeyhole aria-hidden="true" />}
    </button>
    {open && <div className="document-access-popover" role="status">
      <strong>{items.length ? "Quem pode acessar" : "Acesso liberado"}</strong>
      {items.length ? <>
        <p>Os conectores mostram como os requisitos se combinam. E é avaliado antes de OU.</p>
        <ul>{items.map((rule, index) => {
          const join = rule.join ?? logic;
          return <Fragment key={`${rule.kind}-${index}`}>
            {index > 0 && <li className="document-access-connector"><b className={`document-rule-operator ${join}`}>{join === "and" ? "E" : "OU"}</b></li>}
            <li className="document-access-requirement">{rule.kind === "rank" ? <Shield aria-hidden="true" /> : <Award aria-hidden="true" />}<span>{label(rule)}</span></li>
          </Fragment>;
        })}</ul>
      </> : <p>Todos os membros aprovados podem abrir este documento.</p>}
      <button className="document-access-close" type="button" onClick={() => setOpen(false)}>Entendi</button>
    </div>}
  </div>;
}
