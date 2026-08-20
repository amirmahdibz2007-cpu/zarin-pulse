import type { ReactNode } from 'react';

export function ResponsiveTable<T>(props: {
  rows: readonly T[];
  rowKey: (row: T) => string;
  columns: readonly { key: string; header: string; cell: (row: T) => ReactNode }[];
}) {
  return (
    <div className="surface-table overflow-hidden">
      <table className="hidden w-full text-sm lg:table">
        <thead>
          <tr className="text-right">
            {props.columns.map((col) => (
              <th key={col.key} className="p-3 font-medium text-[color:var(--zp-muted)]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={props.rowKey(row)} className="border-t border-[color:var(--zp-border)]">
              {props.columns.map((col) => (
                <td key={col.key} className="p-3">
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-[color:var(--zp-border)] lg:hidden">
        {props.rows.map((row) => (
          <li key={props.rowKey(row)} className="p-4">
            {props.columns.map((col) => (
              <p key={col.key} className="flex min-h-11 items-baseline justify-between gap-3 text-sm">
                <span className="text-[color:var(--zp-muted)]">{col.header}</span>
                <span className="text-left">{col.cell(row)}</span>
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
