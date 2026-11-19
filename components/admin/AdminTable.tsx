import type { ReactNode } from "react";

/** Tabela simples com cabeçalhos em texto e linhas escritas à mão (as seções novas usam ui/DataTable). */
export default function AdminTable({ headers, count, empty, children }: { headers: string[]; count: number; empty: string; children: ReactNode }) {
  return <div className="table-wrap">
    {count === 0
      ? <p className="table-empty">{empty}</p>
      : <table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table>}
  </div>;
}
