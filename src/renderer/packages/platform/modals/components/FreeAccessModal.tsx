import React, { useState } from "react";
import { X } from "lucide-react";
import { callApi } from "@bitgrain/api/api-client";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "../../auth/use-auth";
import { Button } from "@bitgrain/ui/components/Button";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface FreeAccessModalProps {
  plan?: "pro";
  onClose: () => void;
}

const PLAN_OPTIONS: { value: string; label: string }[] = [
  { value: "pro", label: "Pro" },
  { value: "any", label: "Whatever you can offer" },
];

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
}> = ({ label, value, onChange, placeholder, type = "text", optional }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
      {label}
      {optional && <span className="text-zinc-500 dark:text-zinc-400"> (optional)</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--s-accent)]/40 focus:border-[var(--s-accent)] transition-all"
    />
  </div>
);

export const FreeAccessModal: React.FC<FreeAccessModalProps> = ({ plan, onClose }) => {
  const user = useSignalValue(userSignal);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [planWanted, setPlanWanted] = useState<string>(plan ?? "pro");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [audience, setAudience] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Please tell us a little about why you are asking.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await callApi<{ ok: boolean }>("/api/access-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        plan_wanted: planWanted,
        twitter,
        instagram,
        website,
        audience,
        reason,
        source: window.location.pathname,
      }),
    });
    setLoading(false);
    if (result?.ok) {
      setDone(true);
    } else {
      setError("Your request did not send. Please try again.");
    }
  };

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-end sm:items-center justify-center sm:p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#18181b] rounded-t-2xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-800 w-full sm:max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 font-editorial">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <img src="/bitgrainlogo.png" alt="Bitgrain" className="w-8 h-8 rounded object-cover" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {done ? (
          <div className="px-5 pb-8 pt-2 text-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Request sent</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2  ">
              Every request is read by hand. If it is a fit, we will set up your plan and email you.
            </p>
            <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="px-5 pb-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                Ask for free access
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1  ">
                Making zines, posters or covers and money is tight? Tell us a bit about yourself and we will see what we can do.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 flex flex-col gap-3 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">Which plan</label>
                <select
                  value={planWanted}
                  onChange={(event) => setPlanWanted(event.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--s-accent)]/40 focus:border-[var(--s-accent)] transition-all"
                >
                  {PLAN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="X or Twitter" value={twitter} onChange={setTwitter} placeholder="@handle" optional />
                <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="@handle" optional />
              </div>

              <Field label="Website or portfolio" value={website} onChange={setWebsite} placeholder="https://" optional />
              <Field
                label="Your audience"
                value={audience}
                onChange={setAudience}
                placeholder="Who sees your work, and where you share it"
                optional
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
                  Why are you asking for free access?
                </label>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="A few lines about what you make and your situation is plenty"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--s-accent)]/40 focus:border-[var(--s-accent)] transition-all resize-none"
                />
              </div>

              {error && <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading} loading={loading}>
                Send request
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
