import { Cake } from "lucide-react";
import { birthdayLabel } from "@/lib/birthdays";

export default function BirthdayBadge({ birthDate }: { birthDate?: string | null }) {
  const label = birthdayLabel(birthDate);
  return label ? <span className="birthday-badge" title={label} aria-label={label}><Cake size={17} aria-hidden="true" /> {label}</span> : null;
}
