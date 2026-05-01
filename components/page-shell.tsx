import type { ReactNode } from "react";

export function PageShell({
  main,
  sidebar,
}: {
  main: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-12 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px] gap-10 lg:gap-14">
        <main className="lg:col-start-1 lg:row-start-1 min-w-0">{main}</main>
        <div className="lg:col-start-2 lg:row-start-1">{sidebar}</div>
      </div>
    </div>
  );
}
