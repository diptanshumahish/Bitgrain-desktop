import { useEffect, useRef, useState } from "react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import { userSignal, logout } from "../../hooks/useAuth";
import { openSettings } from "../../store/account-store";
import { getAvatarGlyph } from "../../lib/avatar-glyphs";
import { useAvatar } from "../../hooks/useAvatar";

const NO_DRAG = "[-webkit-app-region:no-drag]";

// The signed-in user, always shown at the top-right of the title bar. Click for a
// small menu: open Account & settings, or sign out.
export function AccountChip() {
  const user = useSignalValue(userSignal);
  const avatar = useAvatar(user?.avatarUrl);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) return null;

  const firstName = user.name?.split(" ")[0] ?? "Account";

  return (
    <div ref={ref} className={`${NO_DRAG} relative flex h-full items-center`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-[12px] text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" draggable={false} />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-[var(--s-border)] bg-[var(--s-bg-input)]">
            <pre className="scale-[1.1] text-[2.5px] leading-[1] text-[var(--s-text-muted)]">
              {getAvatarGlyph(user.id)}
            </pre>
          </span>
        )}
        <span className="max-w-[110px] truncate font-medium">{firstName}</span>
        <ChevronDown size={12} strokeWidth={2} className="text-[var(--s-text-muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[400] mt-1 w-52 overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] py-1 shadow-xl">
          <div className="border-b border-[var(--s-border)] px-3 py-2">
            <div className="truncate text-[12px] font-semibold text-[var(--s-text)]">{user.name}</div>
            <div className="truncate text-[11px] text-[var(--s-text-muted)]">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); openSettings(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]"
          >
            <Settings size={14} strokeWidth={2} className="text-[var(--s-text-muted)]" />
            Account &amp; settings
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); void logout(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]"
          >
            <LogOut size={14} strokeWidth={2} className="text-[var(--s-text-muted)]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
