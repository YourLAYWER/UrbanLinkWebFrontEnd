import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusPillTone = 'active' | 'idle' | 'critical' | 'standby';

interface StatusPillProps {
  tone: StatusPillTone;
  children: ReactNode;
  className?: string;
}

// Matches the "Status Pills & Badges" spec in DESIGN.md: a leading glowing dot,
// uppercase label text, and a translucent tone-matched background.
export function StatusPill({ tone, children, className }: StatusPillProps) {
  return <span className={cn('status-pill', `status-pill-${tone}`, className)}>{children}</span>;
}
