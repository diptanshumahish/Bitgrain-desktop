import type { ReactNode } from "react";
import { Aperture, Layers, Film, LayoutGrid, LayoutTemplate, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { signal, useSignalValue } from "../lib/signal";
import {
  documentTabsSignal,
  activeTabIdSignal,
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
import { HUB_DESTINATIONS } from "../pages/landing-page/HubDestinations";
import { HubAsciiBackground } from "../components/hub/HubAsciiBackground";
import { HubGreeting } from "../components/hub/HubGreeting";
import { HubQuickActions } from "../components/hub/quick-actions/HubQuickActions";
import { HubTemplatesSection } from "../components/hub/HubTemplatesSection";
import { useWelcomeAutostart } from "../components/onboarding/welcome/hooks/use-welcome-autostart";
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

// The home tab's left rail: the Home and Templates pages, then filters over the
// open work. Shared by every home route so the rail stays put while browsing.
export function HomeSidebar() {
  const tabs = useSignalValue(documentTabsSignal);
  const filter = useSignalValue(filterSignal);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onTemplates = pathname.startsWith("/templates");

  const works = tabs.filter((tab) => tab.kind !== "home");
  const countBy = (kind: TabKind): number => works.filter((tab) => tab.kind === kind).length;
  const showFilter = (next: Filter): void => {
    filterSignal.value = next;
    if (onTemplates) navigate("/");
  };

  return (
    <aside className="relative z-10 flex w-56 shrink-0 flex-col border-r border-[var(--s-border)] bg-[var(--s-bg-canvas)] px-3 py-4">
      <div className="flex items-center gap-2 px-1.5">
        <img src="/bitgrainlogo.png" alt="" className="h-5 w-5 rounded object-cover" />
        <span className="text-[14px] font-semibold tracking-tight text-[var(--s-text)]">Bitgrain</span>
      </div>

      <nav className="mt-6 flex flex-col gap-0.5">
        <NavItem
          label="Home"
          icon={LayoutGrid}
          count={works.length}
          active={!onTemplates && filter === "all"}
          onClick={() => showFilter("all")}
        />
        <NavItem
          label="Templates"
          icon={LayoutTemplate}
          active={onTemplates}
          onClick={() => navigate("/templates")}
        />
      </nav>

      <p className="mt-6 mb-1.5 px-2.5 text-[11px] font-medium text-[var(--s-text-subtle)]">Open work</p>
      <nav className="flex flex-col gap-0.5">
        {CREATE_KINDS.map((kind) => (
          <NavItem
            key={kind}
            label={KIND_LABEL[kind]}
            icon={KIND_ICON[kind]}
            count={countBy(kind)}
            active={!onTemplates && filter === kind}
            onClick={() => showFilter(kind)}
          />
        ))}
      </nav>
    </aside>
  );
}

// The home dashboard, built from the web hub: greeting, the three quick actions,
// open work and the saved library, blank studio formats, then the template feed.
export function HomeDashboard() {
  const tabs = useSignalValue(documentTabsSignal);
  const filter = useSignalValue(filterSignal);
  const saved = useSignalValue(savedProjectsSignal);
  const user = useSignalValue(userSignal);
  useWelcomeAutostart(user);

  const works = tabs.filter((tab) => tab.kind !== "home");
  const visible = filter === "all" ? works : works.filter((tab) => tab.kind === filter);
  const firstName = user?.name?.trim().split(" ")[0] || "creator";

  return (
    <div className="relative pb-16">
      <div className="relative z-10 mx-auto max-w-6xl px-8 pt-10">
        <HubGreeting firstName={firstName} />
        <HubQuickActions destinations={HUB_DESTINATIONS} />

        {(filter !== "all" || works.length > 0) && (
          <section className="mt-12">
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
        )}

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

        <section className="mt-12">
          <SectionHeading>Blank studio formats</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STUDIO_STARTERS.map((starter) => (
              <StarterCard key={starter.id} starter={starter} />
            ))}
          </div>
        </section>
      </div>

      <div className="relative z-10 px-8">
        <HubTemplatesSection />
      </div>
    </div>
  );
}

// The hub's animated ASCII field. It draws `position: fixed`, so it is boxed in a
// transformed layer (which becomes its containing block) to stay behind the home
// content instead of the whole window, and mounts only while home is visible so
// its animation frame loop stops on other tabs.
export function HomeBackdrop() {
  const tabs = useSignalValue(documentTabsSignal);
  const activeId = useSignalValue(activeTabIdSignal);
  const homeActive = tabs.find((tab) => tab.id === activeId)?.kind === "home";
  if (!homeActive) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [transform:translateZ(0)]">
      <HubAsciiBackground />
    </div>
  );
}
