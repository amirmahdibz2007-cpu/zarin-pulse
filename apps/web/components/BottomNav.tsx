import { copy } from '@zarinpulse/contracts';
import { allNav, primaryNav } from '../lib/nav';
import { MoreSheet } from './MoreSheet';
import { NavLink } from './NavLink';

export function BottomNav() {
  return (
    <nav className="nav-bottom">
      <ul className="grid grid-cols-5">
        {primaryNav.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} className="nav-bottom-link">
              {item.label}
            </NavLink>
          </li>
        ))}
        <li>
          <MoreSheet />
        </li>
      </ul>
    </nav>
  );
}

export function SidebarNav() {
  return (
    <aside className="nav-side">
      <p className="nav-brand">{copy.product.name}</p>
      <ul className="space-y-1">
        {allNav.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} className="nav-side-link">
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
