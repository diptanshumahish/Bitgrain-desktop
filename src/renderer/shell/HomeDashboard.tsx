import type { ReactNode } from "react";
import { Aperture, Layers, Film, LayoutGrid, ArrowRight, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signal, useSignalValue } from "../lib/signal";
import {
  documentTabsSignal,
  openTab,
  openStudioTemplate,
  switchTab,
  openInstanceTab,
  type DocumentTab,
  type TabKind,
} from "../store/document-tabs-store";
import {
  savedProjectsSignal,
  openProject,
  removeProject,
} from "../store/projects-store";
import { userSignal } from "../hooks/useAuth";
import { STUDIO_STARTERS, starterToTemplate, type StudioStarter } from "../data/templates/studio-starters";
import type { InstanceRecord } from "../../shared/bridge";

// Opens a library instance in the right surface: darkroom loads its embedded
// image, studio/video open a tab bound to the instance id and load their file.
const openInstance = (record: InstanceRecord): void => {
  if (record.kind === "darkroom") {
    void openProject(record);
  } else {
    openInstanceTab(record.id, record.kind, record.title);
  }
};

type Filter = "all" | TabKind;

const filterSignal = signal<Filter>("all");

const KIND_ICON: Record<TabKind, LucideIcon> = {
  home: LayoutGrid,
  darkroom: Aperture,
  studio: Layers,
  video: Film,
};

const KIND_LABEL: Record<TabKind, string> = {
  home: "Home",
  darkroom: "Darkroom",
  studio: "Studio",
  video: "Video",
};

const CREATE_KINDS: Exclude<TabKind, "home">[] = ["darkroom", "studio", "video"];

const CREATE_HINT: Record<Exclude<TabKind, "home">, string> = {
  darkroom: "Process a single photo with effects, dithering and export.",
  studio: "Compose a multi-page, multi-layer canvas.",
  video: "Cut and grade a timeline with effects.",
};

function NavItem({
  label,
  icon: Icon,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  const tone = active
    ? "bg-[var(--s-bg-panel-alt)] text-[var(--s-text)]"
    : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel-alt)]/60 hover:text-[var(--s-text)]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${tone}`}
    >
      <Icon size={15} strokeWidth={2} className="shrink-0 opacity-80" />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] text-[var(--s-text-muted)]">{count}</span>
      )}
    </button>
  );
}

function Thumbnail({ tab }: { tab: DocumentTab }) {
  const image = tab.kind === "darkroom" ? tab.darkroom?.image ?? null : null;
  const Icon = KIND_ICON[tab.kind];
  if (image) {
    return <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--s-bg-panel-alt)] text-[var(--s-text-muted)]">
      <Icon size={26} strokeWidth={1.5} />
    </div>
  );
}

function WorkCard({ tab }: { tab: DocumentTab }) {
  const Icon = KIND_ICON[tab.kind];
  const meta = tab.kind === "darkroom" ? tab.darkroom?.meta ?? null : null;
  const subtitle = meta ? `${meta.width} × ${meta.height}` : KIND_LABEL[tab.kind];
  return (
    <button
      type="button"
      onClick={() => switchTab(tab.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-left transition-colors hover:border-[var(--s-accent)]"
    >
      <span className="aspect-[4/3] w-full overflow-hidden border-b border-[var(--s-border)]">
        <Thumbnail tab={tab} />
      </span>
      <span className="flex items-center gap-2 px-3 py-2.5">
        <Icon size={13} strokeWidth={2} className="shrink-0 text-[var(--s-text-muted)]" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[12px] font-medium text-[var(--s-text)]">{tab.title}</span>
          <span className="text-[10px] text-[var(--s-text-muted)]">{subtitle}</span>
        </span>
      </span>
    </button>
  );
}

// The three primary "start something" actions. One is highlighted as the lead
// action (studio) so the row has a clear focal point without feeling busy.
function CreateCard({ kind, lead }: { kind: Exclude<TabKind, "home">; lead?: boolean }) {
  const Icon = KIND_ICON[kind];
  return (
    <button
      type="button"
      onClick={() => openTab(kind)}
      className={`group flex flex-col justify-between gap-6 rounded-2xl border p-5 text-left transition-colors ${
        lead
          ? "border-[var(--s-accent)]/40 bg-[var(--s-bg-panel)] hover:border-[var(--s-accent)]"
          : "border-[var(--s-border)] bg-[var(--s-bg-panel)] hover:border-[var(--s-accent)]"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          lead ? "bg-[var(--s-accent)] text-white" : "bg-[var(--s-bg-panel-alt)] text-[var(--s-text)]"
        }`}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--s-text)]">
          New {KIND_LABEL[kind]}
          <ArrowRight
            size={14}
            className="text-[var(--s-text-muted)] opacity-0 transition-all -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </span>
        <span className="text-[11.5px] leading-relaxed text-[var(--s-text-muted)]">{CREATE_HINT[kind]}</span>
      </span>
    </button>
  );
}

// A blank studio at a common size. The preview rectangle mirrors the real aspect
// ratio so the format reads at a glance.
function StarterCard({ starter }: { starter: StudioStarter }) {
  const landscape = starter.width >= starter.height;
  const w = landscape ? 100 : (starter.width / starter.height) * 100;
  const h = landscape ? (starter.height / starter.width) * 100 : 100;
  return (
    <button
      type="button"
      onClick={() => openStudioTemplate(starterToTemplate(starter))}
      className="group flex flex-col items-stretch gap-2.5 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-3 text-left transition-colors hover:border-[var(--s-accent)]"
    >
      <span className="flex h-20 items-center justify-center rounded-lg bg-[var(--s-bg-panel-alt)]">
        <span
          className="rounded-[3px] border border-[var(--s-border)] shadow-sm transition-transform group-hover:scale-[1.03]"
          style={{
            width: `${w * 0.55}%`,
            height: `${h * 0.55}%`,
            background: starter.background,
          }}
        />
      </span>
      <span className="flex flex-col">
        <span className="truncate text-[12px] font-medium text-[var(--s-text)]">{starter.name}</span>
        <span className="text-[10px] tabular-nums text-[var(--s-text-muted)]">{starter.detail}</span>
      </span>
    </button>
  );
}

function SavedCard({ record }: { record: InstanceRecord }) {
  const Icon = KIND_ICON[(record.kind as TabKind) ?? "darkroom"];
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] transition-colors hover:border-[var(--s-accent)]">
      <button type="button" onClick={() => openInstance(record)} className="flex flex-col text-left">
        <span className="aspect-[4/3] w-full overflow-hidden border-b border-[var(--s-border)]">
          {record.thumbnail ? (
            <img src={record.thumbnail} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[var(--s-bg-panel-alt)] text-[var(--s-text-muted)]">
              <Icon size={26} strokeWidth={1.5} />
            </span>
          )}
        </span>
        <span className="flex items-center gap-2 px-3 py-2.5">
          <Icon size={13} strokeWidth={2} className="shrink-0 text-[var(--s-text-muted)]" />
          <span className="truncate text-[12px] font-medium text-[var(--s-text)]">{record.title}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => void removeProject(record.id)}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
        aria-label="delete project"
      >
        <Trash2 size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

// Note: no CSS `uppercase` here — it would transform the rendered text (which
// `innerText`-based checks read), and the "Library" label is asserted verbatim.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[12px] font-semibold tracking-tight text-[var(--s-text-muted)]">
      {children}
    </h2>
  );
}

export function HomeDashboard() {
  const tabs = useSignalValue(documentTabsSignal);
  const filter = useSignalValue(filterSignal);
  const saved = useSignalValue(savedProjectsSignal);
  const user = useSignalValue(userSignal);

  const works = tabs.filter((tab) => tab.kind !== "home");
  const countBy = (kind: TabKind): number => works.filter((tab) => tab.kind === kind).length;
  const visible = filter === "all" ? works : works.filter((tab) => tab.kind === filter);
  const firstName = user?.name?.trim().split(" ")[0];

  return (
    <div className="flex h-full w-full bg-[var(--s-bg-canvas)]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--s-border)] px-3 py-4">
        <div className="flex items-center gap-2 px-1.5">
          <img src="/bitgrainlogo.png" alt="" className="h-5 w-5 rounded object-cover" />
          <span className="text-[14px] font-semibold tracking-tight text-[var(--s-text)]">Bitgrain</span>
        </div>

        <nav className="mt-6 flex flex-col gap-0.5">
          <NavItem
            label="All work"
            icon={LayoutGrid}
            count={works.length}
            active={filter === "all"}
            onClick={() => (filterSignal.value = "all")}
          />
          {CREATE_KINDS.map((kind) => (
            <NavItem
              key={kind}
              label={KIND_LABEL[kind]}
              icon={KIND_ICON[kind]}
              count={countBy(kind)}
              active={filter === kind}
              onClick={() => (filterSignal.value = kind)}
            />
          ))}
        </nav>

        <p className="mt-auto px-1.5 text-[10px] leading-relaxed text-[var(--s-text-muted)]">
          Deterministic, offline, private.
        </p>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-10">
          <header className="mb-9">
            <h1 className="text-[22px] font-semibold tracking-tight text-[var(--s-text)]">
              {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </h1>
            <p className="mt-1 text-[13px] text-[var(--s-text-muted)]">
              Pick up where you left off, or start something new.
            </p>
          </header>

          <section className="mb-10">
            <SectionHeading>Start something</SectionHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CREATE_KINDS.map((kind) => (
                <CreateCard key={kind} kind={kind} lead={kind === "studio"} />
              ))}
            </div>
          </section>

          <section className="mb-10">
            <SectionHeading>Studio formats</SectionHeading>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {STUDIO_STARTERS.map((starter) => (
                <StarterCard key={starter.id} starter={starter} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeading>{filter === "all" ? "Your work" : `${KIND_LABEL[filter as TabKind]} work`}</SectionHeading>
            {visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--s-border)] px-6 py-14 text-center">
                <p className="text-[13px] text-[var(--s-text-muted)]">
                  Nothing here yet. Created work shows up with a thumbnail.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {visible.map((tab) => (
                  <WorkCard key={tab.id} tab={tab} />
                ))}
              </div>
            )}
          </section>

          {saved.length > 0 && (
            <section className="mt-12">
              <SectionHeading>Library</SectionHeading>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {saved.map((record) => (
                  <SavedCard key={record.id} record={record} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
