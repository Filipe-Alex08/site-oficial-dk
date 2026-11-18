import type { ReactNode } from "react";

export default function AdminTitle({ title, description, eyebrow, action }: { title: string; description?: string; eyebrow?: string; action?: ReactNode }) {
  return <div className="admin-title">
    <div>
      {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="admin-title-actions">{action}</div>}
  </div>;
}
