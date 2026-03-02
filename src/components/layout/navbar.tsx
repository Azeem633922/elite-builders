'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

const navLinks = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/submissions', label: 'My Submissions' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold">
          EliteBuilders
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-black hover:text-white',
                pathname === link.href ? 'bg-black text-white' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4">
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
