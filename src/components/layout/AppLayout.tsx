import { Outlet, useLocation } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { isNavActive, navItems } from '@/config/nav';

export function AppLayout() {
  const { pathname } = useLocation();
  // Prefer the longest matching URL so "/" doesn't win over "/tickets"
  const current = [...navItems]
    .sort((a, b) => b.url.length - a.url.length)
    .find((item) => isNavActive(item.url, pathname));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">{current?.title ?? 'UrbanLink Admin'}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
