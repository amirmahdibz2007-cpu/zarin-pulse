import { copy } from '@zarinpulse/contracts';

export const primaryNav = [
  { href: '/', label: copy.nav.home },
  { href: '/abandonment', label: copy.nav.abandonment },
  { href: '/ai', label: copy.nav.ai },
  { href: '/peers', label: copy.nav.peers },
] as const;

export const extraNav = [
  { href: '/fees', label: copy.nav.fees },
  { href: '/health', label: copy.nav.health },
  { href: '/psp', label: copy.nav.psp },
  { href: '/calendar', label: copy.nav.calendar },
  { href: '/growth', label: copy.nav.growth },
  { href: '/customers', label: copy.nav.customers },
  { href: '/prices', label: copy.nav.prices },
  { href: '/methodology', label: copy.nav.methodology },
  { href: '/reconciliation', label: copy.nav.reconciliation },
  { href: '/judge', label: copy.nav.judge },
  { href: '/ask', label: copy.nav.ask },
] as const;

export const allNav = [...primaryNav, ...extraNav];
