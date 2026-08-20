'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink(props: {
  href: string;
  children: ReactNode;
  className: string;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={props.href}
      className={props.className}
      data-active={isActive(pathname, props.href) ? 'true' : 'false'}
    >
      {props.children}
    </Link>
  );
}
