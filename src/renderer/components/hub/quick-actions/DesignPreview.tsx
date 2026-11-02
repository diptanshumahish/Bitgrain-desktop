import React from "react";

const HANDLE_CLASS = "absolute h-1.5 w-1.5 border border-[var(--s-accent)] bg-white";

export const DesignPreview: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(var(--s-border)_1px,transparent_1px)] [background-size:12px_12px]">
    <div className="flex h-[84%] aspect-[4/5] -rotate-3 flex-col rounded-sm bg-[#f4efe6] p-1.5 shadow-xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-0">
      <img src="/art/kites-sm.webp" alt="" className="min-h-0 w-full flex-1 object-cover" />
      <div className="relative mt-1.5 px-0.5 pb-1">
        <span className="block font-editorial text-[11px] font-semibold leading-none text-zinc-900">Golden hour</span>
        <span className="mt-1 block h-[3px] w-2/3 rounded-full bg-zinc-900/25" />
        <span className="pointer-events-none absolute -inset-1 border border-[var(--s-accent)]">
          <span className={`${HANDLE_CLASS} -left-1 -top-1`} />
          <span className={`${HANDLE_CLASS} -right-1 -top-1`} />
          <span className={`${HANDLE_CLASS} -bottom-1 -left-1`} />
          <span className={`${HANDLE_CLASS} -bottom-1 -right-1`} />
        </span>
      </div>
    </div>
  </div>
);
