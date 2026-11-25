"use client";

import { Check, Eye, EyeOff, LockKeyhole, type LucideIcon } from "lucide-react";
import { InputHTMLAttributes, ReactNode, useState } from "react";

/** Campo com ícone à esquerda e um espaço opcional para ações à direita. */
export default function AuthInput({
  icon: Icon,
  trailing,
  valid = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: LucideIcon; trailing?: ReactNode; valid?: boolean }) {
  return (
    <div className={"auth-input" + (valid ? " is-valid" : "")}>
      <Icon className="auth-input-icon" aria-hidden="true" />
      <input {...props} />
      {(valid || trailing) && (
        <span className="auth-input-trailing">
          {valid && <Check className="auth-input-check" aria-hidden="true" />}
          {trailing}
        </span>
      )}
    </div>
  );
}

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { valid?: boolean }) {
  const [reveal, setReveal] = useState(false);
  const label = reveal ? "Ocultar senha" : "Mostrar senha";
  return (
    <AuthInput
      {...props}
      type={reveal ? "text" : "password"}
      icon={LockKeyhole}
      trailing={
        <button className="auth-reveal" type="button" onClick={() => setReveal((current) => !current)} title={label} aria-label={label}>
          {reveal ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      }
    />
  );
}
