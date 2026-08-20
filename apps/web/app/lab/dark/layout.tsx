import type { ReactNode } from 'react';

const BOOT = `document.documentElement.setAttribute('data-palette','noir');`;

export default function LabDarkLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      {children}
    </>
  );
}
