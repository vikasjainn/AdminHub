import { ArrowLeftRight, CalendarDays, LayoutDashboard, UserCircle, Users } from 'lucide-react';
import { PROFILE_HREF } from '@/lib/constants';

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', mobileLabel: 'Dashboard', Icon: LayoutDashboard },
  { href: '/users', label: 'Users', mobileLabel: 'Users', Icon: Users },
  { href: '/transactions', label: 'Transactions', mobileLabel: 'Transaction', Icon: ArrowLeftRight },
  { href: '/bookings', label: 'Bookings', mobileLabel: 'Bookings', Icon: CalendarDays },
] as const;

export const PROFILE_NAV_ITEM = { href: PROFILE_HREF, mobileLabel: 'Profile', Icon: UserCircle } as const;

/** The admin profile lives under /users, so "Users" must not light up for it. */
export function isNavActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === PROFILE_HREF) return pathname === PROFILE_HREF;
  if (href === '/users') return pathname.startsWith('/users') && pathname !== PROFILE_HREF;
  return pathname.startsWith(href);
}
