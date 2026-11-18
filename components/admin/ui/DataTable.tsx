import { Fragment, type Key, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Classe extra da célula (ex.: "row-actions"). */
  className?: string;
  /** Esconde o rótulo da coluna no modo cartão (útil para ações e para a primeira coluna). */
  hideLabel?: boolean;
  /** Cabeçalho só para leitores de tela (coluna de ações, por exemplo). */
  srOnlyHeader?: boolean;
};

/**
 * Tabela declarativa do painel. No celular cada linha vira um cartão: cada célula
 * mostra o próprio cabeçalho via `data-label`, então não há rolagem horizontal.
 */
export default function DataTable<T>({ columns, rows, rowKey, empty, caption, rowClassName, rowExtra }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => Key;
  empty: ReactNode;
  caption?: string;
  rowClassName?: (row: T) => string | undefined;
  /** Linha adicional logo abaixo (detalhes expandidos). Recebe o número de colunas para o colSpan. */
  rowExtra?: (row: T, columnCount: number) => ReactNode;
}) {
  if (!rows.length) return <div className="table-wrap"><p className="table-empty">{empty}</p></div>;
  return <div className="table-wrap">
    <table className="data-table">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.srOnlyHeader ? <span className="sr-only">{column.header}</span> : column.header}</th>)}</tr></thead>
      <tbody>{rows.map((row) => {
        const extra = rowExtra?.(row, columns.length);
        const key = rowKey(row);
        return <Fragment key={key}>
          <tr className={rowClassName?.(row)}>{columns.map((column) => <td
            key={column.key}
            className={column.className}
            data-label={column.hideLabel || column.srOnlyHeader ? undefined : column.header}
          >{column.render(row)}</td>)}</tr>
          {extra}
        </Fragment>;
      })}</tbody>
    </table>
  </div>;
}
