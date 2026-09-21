import type { ComponentType } from 'react';
import { LayoutDashboard, Route as RouteIcon, Ticket, Users } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

// Single source of truth for the sidebar, the top bar title and the dashboard cards.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    description: 'Overview of the platform.',
    icon: LayoutDashboard,
  },
  {
    title: 'Routes',
    url: '/routes',
    description: 'Monitor the graph-based routing engine, stops and schedules.',
    icon: RouteIcon,
  },
  {
    title: 'Tickets',
    url: '/tickets',
    description: 'Track QR ticketing flows and active tickets.',
    icon: Ticket,
  },
  {
    title: 'Users',
    url: '/users',
    description: 'Manage commuters and staff accounts.',
    icon: Users,
  },
];

export function isNavActive(itemUrl: string, pathname: string) {
  return itemUrl === '/' ? pathname === '/' : pathname.startsWith(itemUrl);
}
