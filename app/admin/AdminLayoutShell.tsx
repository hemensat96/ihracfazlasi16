'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '▣', exact: true },
  { href: '/admin/urunler', label: 'Ürünler', icon: '◈' },
  { href: '/admin/satislar', label: 'Satışlar', icon: '◉' },
  { href: '/admin/raporlar', label: 'Raporlar', icon: '▤' },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: '◫' },
];

const externalItems = [
  { href: '/panel', label: 'Butik Yönetim Paneli', icon: '⊞' },
];

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-50 flex items-center justify-center">
        {children}
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-base font-bold text-white">İhraç Fazlası Giyim</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Paneli</p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Dış sistemler */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="px-3 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dış Sistemler</p>
            {externalItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-700">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors mb-1"
          >
            <span>↗</span>
            <span>Siteyi Görüntüle</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
          >
            <span>←</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
