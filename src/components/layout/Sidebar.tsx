'use client';

import { UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Avatar from '@/components/common/Avatar';
import { CURRENT_ADMIN, PROFILE_HREF } from '@/lib/constants';
import { isNavActive, NAV_ITEMS } from '@/lib/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMobileNav } from '@/store/uiSlice';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const open = useAppSelector((state) => state.ui.mobileNav);
  const dispatch = useAppDispatch();
  const close = () => dispatch(setMobileNav(false));

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[232px] bg-slate-900 text-slate-300 transition-transform md:translate-x-0 print:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[68px] items-center gap-2 border-b border-slate-800 px-5 text-white">
            <img
              src="/favicon.svg"
              alt="AdminHub"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-[16px] font-bold">AdminHub</span>
            <button
              type="button"
              aria-label="Close navigation"
              className="ml-auto rounded-md p-1 hover:bg-slate-800 md:hidden"
              onClick={close}
            >
              <X size={18} />
            </button>
          </div>
          <nav className="space-y-1 px-3 pt-5">
            {NAV_ITEMS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-[12px] font-medium transition ${isNavActive(href, pathname) ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-700 px-4 py-4">
            <button
              type="button"
              onClick={() => {
                close();
                router.push(PROFILE_HREF);
              }}
              className="flex w-full items-center gap-2 rounded-md p-1 text-left hover:bg-slate-800"
            >
              <Avatar src={CURRENT_ADMIN.avatar} alt={CURRENT_ADMIN.name} className="h-8 w-8 rounded-full object-cover" />
              <span>
                <span className="block text-[11px] font-medium text-white">{CURRENT_ADMIN.name}</span>
                <span className="block text-[9px] text-slate-400">{CURRENT_ADMIN.title}</span>
              </span>
              <UserCircle size={14} className="ml-auto text-slate-500" />
            </button>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={close} />}
    </>
  );
}
