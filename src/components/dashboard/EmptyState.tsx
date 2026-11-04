import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center sm:px-10">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#211e2a] text-[#b9ace0]">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
