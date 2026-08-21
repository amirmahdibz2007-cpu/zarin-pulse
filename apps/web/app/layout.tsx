import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { copy } from '@zarinpulse/contracts';
import { BottomNav, SidebarNav } from '../components/BottomNav';
import { CommandPalette } from '../components/CommandPalette';
import { PaletteSwitch } from '../components/PaletteSwitch';
import { RegisterSw } from '../components/RegisterSw';
import { SloshRoot } from '../components/Infographic';
import { vazirmatn } from '../lib/font';
import { DEFAULT_PALETTE, PALETTE_STORAGE_KEY, PREVIEW_PALETTE } from '../lib/palette';
import { NAV_STORAGE_KEY } from '../lib/nav-chrome';
import { NavToggle } from '../components/NavToggle';
import './globals.css';

export const metadata: Metadata = {
  title: copy.product.name,
  description: copy.product.tagline,
  appleWebApp: {
    capable: true,
    title: copy.product.name,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192' },
      { url: '/icon-512.png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#f8f4f0',
  width: 'device-width',
  initialScale: 1,
};

const PALETTE_BOOT = `(function(){try{if(location.pathname==='/preview'){document.documentElement.setAttribute('data-palette',${JSON.stringify(PREVIEW_PALETTE)});return;}var k=${JSON.stringify(PALETTE_STORAGE_KEY)};var v=localStorage.getItem(k);if(v==='noir'||v==='dark')document.documentElement.setAttribute('data-palette','noir');else document.documentElement.setAttribute('data-palette','sand');}catch(e){}})();`;
const NAV_BOOT = `(function(){try{var k=${JSON.stringify(NAV_STORAGE_KEY)};if(localStorage.getItem(k)==='hidden')document.documentElement.setAttribute('data-nav','hidden');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      data-palette={DEFAULT_PALETTE}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PALETTE_BOOT + NAV_BOOT }} />
      </head>
      <body className={`${vazirmatn.className} zp-shell`}>
        <SloshRoot>
          <RegisterSw />
          <div className="lg:flex">
            <SidebarNav />
            <div className="min-h-dvh flex-1 pb-28 lg:pb-0">
              <header className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
                <p className="page-kicker install-hint">{copy.installHint}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <NavToggle />
                  <PaletteSwitch />
                  <CommandPalette />
                </div>
              </header>
              {children}
            </div>
          </div>
          <BottomNav />
        </SloshRoot>
      </body>
    </html>
  );
}
