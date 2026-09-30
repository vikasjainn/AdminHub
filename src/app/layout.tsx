import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/providers/Providers';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Header from '@/components/layout/Header';
import ModalRoot from '@/components/modals/ModalRoot';
import Toaster from '@/components/common/Toaster';

export const metadata: Metadata = {
  title: 'AdminHub',
  description: 'AdminHub administration dashboard',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Sidebar />
          <div className="min-h-screen md:ml-[212px] print:ml-0">
            <Header />
            <main className="px-4 pb-10 pt-5 sm:px-6 md:px-8 lg:px-10">{children}</main>
            <MobileNav />
          </div>
          <ModalRoot />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
