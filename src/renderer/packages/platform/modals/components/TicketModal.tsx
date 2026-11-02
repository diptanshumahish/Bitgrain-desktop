import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { Button } from "@bitgrain/ui/components/Button";
import { userSignal } from "../../auth/use-auth";
import { trackEvent } from "../../tracker";
import {
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  ticketCategoryLabel,
  bodyPlaceholderForType,
  submitTicket,
  type TicketOption,
} from "../../support/tickets";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface TicketModalProps {
  defaultType?: string;
  defaultTitle?: string;
  defaultBody?: string;
  onSubmitted?: (ticketNumber: number) => void;
  onClose: () => void;
}

interface SegmentedProps {
  options: TicketOption[];
  value: string;
  onChange: (id: string) => void;
}

const Segmented: React.FC<SegmentedProps> = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const active = option.id === value;
      return (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
            active
              ? "bg-[var(--s-text)] text-[var(--s-bg-panel)] border-[var(--s-text)]"
              : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)] border-[var(--s-border)] hover:text-[var(--s-text)]"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const FIELD_CLASS =
  "w-full px-3 py-2.5 rounded-lg bg-[var(--s-bg-input)] text-[13px] text-[var(--s-text)] border border-transparent outline-none focus:border-[var(--s-accent)] transition-colors placeholder:text-[var(--s-text-subtle)]";

export const TicketModal: React.FC<TicketModalProps> = ({
  defaultType = "bug",
  defaultTitle = "",
  defaultBody = "",
  onSubmitted,
  onClose,
}) => {
  const user = useSignalValue(userSignal);
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedNumber, setSubmittedNumber] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needsEmail = !user;
  const emailValid = !needsEmail || /.+@.+/.test(email.trim());
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && emailValid && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const created = await submitTicket({
      type,
      title: title.trim(),
      body: body.trim(),
      priority,
      category: category || undefined,
      email: needsEmail ? email.trim() : undefined,
      source_url: typeof window !== "undefined" ? window.location.href : undefined,
    });
    setSubmitting(false);
    trackEvent("support", "ticket_submitted", {
      details: { type, priority, category: category || null, success: Boolean(created), source: "ticket_modal" },
    });
    if (!created) {
      setError("We couldn't send that. Please try again in a moment, or");
      return;
    }
    setSubmittedNumber(created.number);
    onSubmitted?.(created.number);
  };

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[460px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] animate-in fade-in zoom-in-95 duration-200 font-editorial"
      >
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--s-text)]">
              {submittedNumber ? "Thanks, we got it" : "Report a bug or request a feature"}
            </h2>
            <p className="text-[12px] text-[var(--s-text-muted)] mt-1">
              {submittedNumber
                ? "We read every ticket and reply by email."
                : (
                  <>
                    Tell us what broke or what you wish existed. Common issues are usually covered in the{" "}
                    <a
                      href="/docs/07-help/02-troubleshooting"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[var(--s-text)] transition-colors"
                    >
                      troubleshooting guide
                    </a>
                    .
                  </>
                )}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {submittedNumber ? (
          <div className="px-5 py-6 flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 text-[13px] text-[var(--s-text)]">
              <Check size={16} strokeWidth={2.5} />
              Logged as ticket #{submittedNumber}
            </span>
            <p className="text-[13px] text-[var(--s-text-muted)]">
              You can track it{user ? " under tickets in your account" : " from the link we just emailed you"}.
            </p>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="px-5 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-[var(--s-text-muted)]">Type</span>
              <Segmented options={TICKET_TYPES} value={type} onChange={setType} />
            </div>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A short summary"
              className={FIELD_CLASS}
            />

            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={bodyPlaceholderForType(type)}
              rows={5}
              className={`${FIELD_CLASS} resize-none`}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-[var(--s-text-muted)]">Priority</span>
                <Segmented options={TICKET_PRIORITIES} value={priority} onChange={setPriority} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-[var(--s-text-muted)]">Area</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={FIELD_CLASS}
                >
                  <option value="">Any</option>
                  {TICKET_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {ticketCategoryLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {needsEmail && (
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email, so we can reply"
                type="email"
                className={FIELD_CLASS}
              />
            )}

            {error && (
              <p className="text-[12px] text-red-500">
                {error}{" "}
                <Link to="/support" onClick={onClose} className="underline">
                  use the full form
                </Link>
                .
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={submit} disabled={!canSubmit} loading={submitting}>
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
