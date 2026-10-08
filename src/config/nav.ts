import type { ComponentType } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  LayoutDashboard,
  Megaphone,
  Navigation,
  Route as RouteIcon,
  Ticket,
  Truck,
  Users,
} from 'lucide-react';

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
  {
    title: 'Fleet',
    url: '/fleet',
    description: 'Vehicle status and maintenance flags.',
    icon: Truck,
  },
  {
    title: 'Live Tracking',
    url: '/tracking',
    description: 'Search commuters and drivers on the map.',
    icon: Navigation,
  },
  {
    title: 'Finance',
    url: '/finance',
    description: 'Revenue, refunds, and shift audit reports.',
    icon: BarChart3,
  },
  {
    title: 'Shift Monitoring',
    url: '/shifts',
    description: 'Live view of active driver shifts, with force-close for stale shifts.',
    icon: Clock,
  },
  {
    title: 'Broadcast Alert',
    url: '/broadcast',
    description: 'Push an alert to all users or to a specific route segment.',
    icon: Megaphone,
  },
  {
    title: 'Incidents',
    url: '/incidents',
    description: 'Review and triage driver and commuter-reported incidents.',
    icon: AlertTriangle,
  },
];

export function isNavActive(itemUrl: string, pathname: string) {
  return itemUrl === '/' ? pathname === '/' : pathname.startsWith(itemUrl);
}
