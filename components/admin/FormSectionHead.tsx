import type { ReactNode } from "react";
import InfoTip from "@/components/ui/InfoTip";

export default function FormSectionHead({ title, hint }: { title: string; hint?: ReactNode }) {
  return <div className="form-section-head title-tip">
    <h4>{title}</h4>
    {hint && <InfoTip label={`Mais informações sobre ${title}`}>{hint}</InfoTip>}
  </div>;
}
