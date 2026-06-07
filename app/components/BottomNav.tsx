'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Lernen', icon: '⚡' },
  { href: '/books', label: 'Bücher', icon: '📚' },
  { href: '/stats', label: 'Statistik', icon: '📊' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-100 dark:border-gray-900 flex items-stretch z-20">
      {tabs.map((tab) => {
        const active =
          tab.href === '/'
            ? pathname === '/'
            : pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors min-h-[44px] ${
              active
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
