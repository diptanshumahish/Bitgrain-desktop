import { useState } from "react";
import { createPortal } from "react-dom";
import { X, LogOut, ExternalLink } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import { userSignal, logout } from "../../hooks/useAuth";
import { accountCreditsSignal } from "../../store/user-credits-store";
import { settingsOpenSignal, closeSettings } from "../../store/account-store";
import { getAvatarGlyph } from "../../lib/avatar-glyphs";
import { useAvatar } from "../../hooks/useAvatar";

const MANAGE_URL = "https://bitgrain.app/account";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--s-border)]/60 py-2.5 last:border-0">
      <span className="text-[12px] text-[var(--s-text-muted)]">{label}</span>
      <span className="max-w-[220px] truncate text-[13px] text-[var(--s-text)]">{value}</span>
    </div>
  );
}

// The desktop account/settings panel: who you're signed in as, your plan, and
// the account actions. Deeper account management (billing, profile edits) stays
// on the web and opens in the browser.
export function AccountSettings() {
  const open = useSignalValue(settingsOpenSignal);
  const user = useSignalValue(userSignal);
  const avatar = useAvatar(user?.avatarUrl);
  const credits = useSignalValue(accountCreditsSignal);
  const [busy, setBusy] = useState(false);

  if (!open || !user) return null;

  const plan = credits?.plan === "pro" ? "Pro" : "Free";

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 p-6 font-editorial"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeSettings();
      }}
    >
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--s-border)] px-5 py-3.5">
          <h2 className="text-[14px] font-semibold text-[var(--s-text)]">Account &amp; settings</h2>
          <button
            type="button"
            onClick={closeSettings}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--s-border)] bg-[var(--s-bg-input)]">
                <pre className="scale-[1.2] text-[3px] leading-[1] text-[var(--s-text-muted)]">
                  {getAvatarGlyph(user.id)}
                </pre>
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-[var(--s-text)]">{user.name}</div>
              <div className="truncate text-[12px] text-[var(--s-text-muted)]">{user.email}</div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--s-border)] px-3.5">
            <Row label="Plan" value={plan} />
            <Row label="Signed in via" value={user.provider || "email"} />
            {user.isAdmin && <Row label="Role" value="Admin" />}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void window.bitgrain?.openExternal(MANAGE_URL)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--s-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]"
            >
              <ExternalLink size={14} strokeWidth={2} />
              Manage account on the web
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await logout();
                closeSettings();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--s-text)] px-4 py-2.5 text-[13px] font-semibold text-[var(--s-bg-panel)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <LogOut size={14} strokeWidth={2} />
              Sign out
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--s-text-muted)]">
            To delete your account, visit{" "}
            <button
              type="button"
              onClick={() => void window.bitgrain?.openExternal(MANAGE_URL)}
              className="font-medium text-[var(--s-text)] underline underline-offset-2 hover:opacity-80"
            >
              bitgrain.app/account
            </button>
            .
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
