"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export default function InsigniaBadge({ children, label, caption, kind }: {
  children: ReactNode; label: string; caption?: string; kind: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const visible = hovered || expanded;

  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  return <button
    ref={ref}
    type="button"
    className={`insignia insignia-badge insignia-${kind}`}
    data-expanded={visible}
    aria-label={caption ? `${caption}: ${label}` : label}
    aria-expanded={visible}
    aria-controls={labelId}
    onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") setHovered(false); }}
    onClick={() => setExpanded((value) => !value)}
    onBlur={() => { setExpanded(false); setHovered(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") { setExpanded(false); setHovered(false); } }}
  >
    {children}
    <span id={labelId} className="insignia-reveal" aria-hidden={!visible}>
      <span className="insignia-reveal-content">
        <span className="insignia-label">{caption && <small>{caption}</small>}{label}</span>
      </span>
    </span>
  </button>;
}
