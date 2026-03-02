'use client';

import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { trpc } from '@/lib/trpc';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const { signOut } = useClerk();
  const { data: user } = trpc.user.getCurrent.useQuery();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? 'User'} />
          <AvatarFallback>{user?.name?.charAt(0) ?? '?'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? 'User'} />
              <AvatarFallback>{user?.name?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.name ?? 'Anonymous'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.githubUrl && (
          <DropdownMenuItem asChild>
            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {user.githubUrl.replace('https://github.com/', '')}
              </span>
            </a>
          </DropdownMenuItem>
        )}
        {user?.portfolioUrl && (
          <DropdownMenuItem asChild>
            <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer">
              Portfolio
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {new URL(user.portfolioUrl).hostname}
              </span>
            </a>
          </DropdownMenuItem>
        )}
        {user?.cvUrl && (
          <DropdownMenuItem asChild>
            <a href={user.cvUrl} target="_blank" rel="noopener noreferrer">
              View CV
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Edit Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: '/' })}
          className="text-destructive focus:text-destructive"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
