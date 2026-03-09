
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Landmark,
  LayoutDashboard,
  Settings,
  List,
  Target,
  Trophy,
  BarChart3,
  DatabaseZap,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/transactions', icon: List, label: 'Transactions' },
  { href: '/dashboard/budgets', icon: Target, label: 'Budgets' },
  { href: '/dashboard/goals', icon: Trophy, label: 'Savings Goals' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
  { href: '/dashboard/data', icon: DatabaseZap, label: 'Data' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <Landmark className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold">CashFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                tooltip={{
                  children: item.label,
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{/* Can add user info here */}</SidebarFooter>
    </Sidebar>
  );
}
