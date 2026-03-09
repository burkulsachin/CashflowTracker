
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useStore } from '@/hooks/use-store';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';
import { Landmark } from 'lucide-react';
import { useUser } from '@/firebase';

const getTitleFromPathname = (pathname: string) => {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/dashboard/data')) return 'Data Management';
  if (pathname.startsWith('/dashboard/goals')) return 'Savings Goals';

  const parts = pathname.split('/');
  const lastPart = parts[parts.length - 1];
  if (!lastPart) return 'Dashboard';
  
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
}

export function DashboardHeader() {
  const { logout } = useStore();
  const { user } = useUser();
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  const userEmail = user?.email || 'Anonymous';
  const userInitial = user?.isAnonymous ? 'A' : userEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Landmark className="hidden h-6 w-6 md:block" />
        <h1 className="text-xl font-semibold tracking-tight">
          {getTitleFromPathname(pathname)}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.photoURL || userAvatar?.imageUrl}
                  alt={userEmail}
                  data-ai-hint={userAvatar?.imageHint}
                />
                <AvatarFallback>
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || 'Anonymous User'}
                </p>
                {userEmail && <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
