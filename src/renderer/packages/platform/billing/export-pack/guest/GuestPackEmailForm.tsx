import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { buyExportPack, exportPackCheckoutBusySignal } from "../buy-export-pack";
import { guestPackEmailSignal, guestPackErrorSignal } from "./guest-pack-state";

interface GuestPackEmailFormProps {
  trigger: string;
  price: string;
}

export const GuestPackEmailForm: React.FC<GuestPackEmailFormProps> = ({ trigger, price }) => {
  const email = useSignalValue(guestPackEmailSignal);
  const error = useSignalValue(guestPackErrorSignal);
  const busy = useSignalValue(exportPackCheckoutBusySignal);
  const submit = (event: React.FormEvent): void => {
    event.preventDefault();
    void buyExportPack(trigger);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor={`guest-pack-email-${trigger}`} className="text-[12px] text-[var(--s-text-muted)]">
        Email for your receipt. You'll set up your account after paying.
      </label>
      <div className="flex gap-2">
        <input
          id={`guest-pack-email-${trigger}`}
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => (guestPackEmailSignal.value = event.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-lg border border-[var(--s-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--s-text)] outline-none focus:border-[var(--s-border-strong)]"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-lg bg-[var(--s-accent)] px-3 text-[13px] font-semibold text-[var(--s-accent-text)] disabled:opacity-50"
        >
          {busy ? "Opening…" : `Pay ${price}`}
        </button>
      </div>
      {error && <p role="alert" className="text-[12px] text-red-600">{error}</p>}
    </form>
  );
};
