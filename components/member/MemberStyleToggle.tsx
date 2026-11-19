"use client";

import { useId } from "react";
import { useMemberTheme } from "@/components/member/MemberThemeProvider";
import { graduationLabels } from "@/lib/member-access";
import type { MemberStyle } from "@/lib/member-style";

const options: Array<{ value: MemberStyle; label: string }> = [
  { value: "graduacao", label: "Graduação" },
  { value: "padrao", label: "Padrão" },
];

/**
 * Alternador de aparência: seguir a cor da graduação ou ficar no padrão do site.
 * São dois botões de rádio nativos (teclado e leitor de tela de graça).
 */
export default function MemberStyleToggle() {
  const { style, setStyle, graduationTheme, available } = useMemberTheme();
  const name = useId();
  if (!available) return null;
  const tierName = graduationLabels[graduationTheme as "bronze" | "prata" | "ouro"];

  return (
    <fieldset className="m-style-toggle" data-tier={graduationTheme}>
      <legend>Aparência</legend>
      <div className="m-style-options">
        {options.map((option) => (
          <label key={option.value} data-style={option.value} title={option.value === "graduacao" ? `Cores da sua graduação (${tierName})` : "Cores padrão do site"}>
            <input type="radio" name={name} value={option.value} checked={style === option.value} onChange={() => setStyle(option.value)} />
            <span className="m-style-swatch" aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
