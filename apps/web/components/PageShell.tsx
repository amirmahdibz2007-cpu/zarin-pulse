import type { ReactNode } from 'react';

export function PageShell(props: {
  children: ReactNode;
  width?: 'narrow' | 'wide' | 'center';
}) {
  const widthClass =
    props.width === 'wide' ? 'page-shell-wide' : props.width === 'center' ? 'page-shell-center' : '';
  return <main className={`page-shell ${widthClass}`.trim()}>{props.children}</main>;
}

export function PageHeader(props: { kicker?: string; title: string; lede?: string }) {
  return (
    <header className="flex flex-col gap-3">
      {props.kicker ? <p className="page-kicker">{props.kicker}</p> : null}
      <h1 className="page-title">{props.title}</h1>
      {props.lede ? <p className="page-lede">{props.lede}</p> : null}
    </header>
  );
}
