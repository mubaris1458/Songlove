import type { ReactNode } from "react";

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 animate-rise">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-row no-scrollbar -mx-4 flex gap-4 px-4 pb-2">{children}</div>
  );
}
