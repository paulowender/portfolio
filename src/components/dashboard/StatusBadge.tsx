import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  neutral: 'border-[#3b3944] bg-[#211f27] text-[#c6c1cd]',
  success: 'border-[#315448] bg-[#182922] text-[#8ed5bd]',
  warning: 'border-[#5c4930] bg-[#2d2418] text-[#efc27f]',
  danger: 'border-[#5f343b] bg-[#2d1b1e] text-[#f0a2ad]',
  info: 'border-[#384d68] bg-[#192431] text-[#9bc4ed]',
};

export default function StatusBadge({ tone = 'neutral', children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-lg border px-2.5 py-1 text-xs font-semibold',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
