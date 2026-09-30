'use client';

import { Bell, CheckCheck, ChevronDown, LogOut, Menu, Search, Settings, UserCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import Avatar from '@/components/common/Avatar';
import { CURRENT_ADMIN, PROFILE_HREF } from '@/lib/constants';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyConsoleSearch } from '@/store/filtersSlice';
import { markAllRead } from '@/store/notificationsSlice';
import { closeMenu, openMenu, setMobileNav, showToast, toggleMenu } from '@/store/uiSlice';
import type { ListRoute } from '@/types';

const MENU_ITEM = 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-slate-50';

/** The console search always lands on a list page; anywhere else defaults to Users. */
function resolveSearchTarget(pathname: string): ListRoute {
  if (pathname.startsWith('/transactions')) return 'transactions';
  if (pathname.startsWith('/bookings')) return 'bookings';
  return 'users';
}

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const openMenuName = useAppSelector((state) => state.ui.openMenu);
  const { items, unread } = useNotifications();
  const [query, setQuery] = useState('');

  useEffect(() => setQuery(''), [pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!(event.target as Element).closest('[data-menu-root]')) dispatch(closeMenu());
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && dispatch(closeMenu());
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const target = resolveSearchTarget(pathname);
    dispatch(applyConsoleSearch({ target, query: trimmed }));
    router.push(`/${target}`);
  };

  const info = (message: string) => {
    dispatch(closeMenu());
    dispatch(showToast({ message, tone: 'info' }));
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 print:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          className="focus-ring rounded-md p-1.5 text-slate-500 md:hidden"
          onClick={() => dispatch(setMobileNav(true))}
        >
          <Menu size={21} />
        </button>
        <div className="text-sm font-semibold text-slate-800 md:hidden">AdminHub</div>
      </div>
      <form onSubmit={submitSearch} className="ml-auto flex items-center gap-4">
        <div className="hidden h-10 w-[270px] items-center gap-2 rounded-md border border-slate-200 bg-white px-3 sm:flex">
          <Search size={16} className="text-slate-400" />
          <input
            aria-label="Search console"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search console..."
          />
        </div>

        <div className="relative" data-menu-root>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={openMenuName === 'notifications'}
            className="focus-ring relative rounded-md p-2 text-slate-500 hover:bg-slate-50"
            onClick={() => dispatch(toggleMenu('notifications'))}
          >
            <Bell size={19} />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
          </button>
          {openMenuName === 'notifications' && (
            <div className="absolute right-0 top-12 w-[310px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <b className="text-sm">Notifications</b>
                <button
                  type="button"
                  disabled={unread === 0}
                  onClick={() => dispatch(markAllRead(items.map((item) => item.id)))}
                  className="text-[11px] font-medium text-indigo-600 disabled:text-slate-300"
                >
                  <CheckCheck size={13} className="mr-1 inline" />
                  Mark all read
                </button>
              </div>
              <div className="space-y-3 pt-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                    <div>
                      <p className="text-xs font-medium text-slate-700">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" data-menu-root>
          <button
            type="button"
            aria-label="Open profile menu"
            aria-expanded={openMenuName === 'profile'}
            className="focus-ring flex items-center gap-2 rounded-full"
            onClick={() => dispatch(toggleMenu('profile'))}
          >
            <Avatar src={CURRENT_ADMIN.avatar} alt={CURRENT_ADMIN.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>
          {openMenuName === 'profile' && (
            <div className="absolute right-0 top-12 w-[220px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold">{CURRENT_ADMIN.name}</p>
                <p className="text-[11px] text-slate-400">{CURRENT_ADMIN.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch(closeMenu());
                  router.push(PROFILE_HREF);
                }}
                className={`mt-1 ${MENU_ITEM}`}
              >
                <UserCircle size={15} />
                My Profile
              </button>
              <button
                type="button"
                onClick={() => info('Account settings are not part of this frontend-only demo.')}
                className={MENU_ITEM}
              >
                <Settings size={15} />
                Account Settings
              </button>
              <button type="button" onClick={() => dispatch(openMenu('notifications'))} className={MENU_ITEM}>
                <Bell size={15} />
                Notifications
              </button>
              <button
                type="button"
                onClick={() => info('Sign out is disabled: this demo has no authentication backend.')}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </form>
    </header>
  );
}
