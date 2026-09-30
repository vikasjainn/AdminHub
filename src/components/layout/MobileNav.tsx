'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavActive, NAV_ITEMS, PROFILE_NAV_ITEM } from '@/lib/navigation';

const MOBILE_ITEMS = [...NAV_ITEMS, PROFILE_NAV_ITEM];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-[72px] grid-cols-5 border-t border-slate-200 bg-white md:hidden print:hidden">
      {MOBILE_ITEMS.map(({ href, mobileLabel, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${
            isNavActive(href, pathname) ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Icon size={20} />
          <span>{mobileLabel}</span>
        </Link>
      ))}
    </nav>
  );
}
