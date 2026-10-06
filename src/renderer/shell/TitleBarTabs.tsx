import { Plus, X, House, Aperture, Layers, Film } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signal, useSignalValue } from "../lib/signal";
import {
  documentTabsSignal,
  activeTabIdSignal,
  switchTab,
  openTab,
  closeTab,
  renameTab,
  moveTab,
  type TabKind,
} from "../store/document-tabs-store";
import { hapticStep } from "./haptics";

const NO_DRAG = "[-webkit-app-region:no-drag]";

const editingTabIdSignal = signal<string | null>(null);
const createMenuOpenSignal = signal(false);
const draggedTabIdSignal = signal<string | null>(null);
const dropTargetIdSignal = signal<string | null>(null);

const KIND_ICON: Record<TabKind, LucideIcon> = {
  home: House,
  darkroom: Aperture,
  studio: Layers,
  video: Film,
};

const CREATE_OPTIONS: { kind: TabKind; label: string; hint: string; icon: LucideIcon }[] = [
  { kind: "darkroom", label: "Darkroom", hint: "Single image editor", icon: Aperture },
  { kind: "studio", label: "Studio", hint: "Multi-layer design", icon: Layers },
  { kind: "video", label: "Video", hint: "Timeline editor", icon: Film },
];

const focusAndSelect = (input: HTMLInputElement | null): void => {
  if (!input) return;
  input.focus();
  input.select();
};

interface TabPillProps {
  id: string;
  title: string;
  kind: TabKind;
  active: boolean;
  editing: boolean;
  closable: boolean;
  pinned: boolean;
  dropTarget: boolean;
}

function TabPill({ id, title, kind, active, editing, closable, pinned, dropTarget }: TabPillProps) {
  const Icon = KIND_ICON[kind];
  const tone = active
    ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]"
    : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel)]/50";
  const dropRing = dropTarget ? "ring-1 ring-[var(--s-accent)]" : "";

  const commit = (value: string): void => {
    renameTab(id, value);
    editingTabIdSignal.value = null;
  };

  return (
    <div
      draggable={!editing && !pinned}
      onDragStart={(e) => {
        draggedTabIdSignal.value = id;
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (pinned || !draggedTabIdSignal.value) return;
        e.preventDefault();
        dropTargetIdSignal.value = id;
      }}
      onDragLeave={() => {
        if (dropTargetIdSignal.value === id) dropTargetIdSignal.value = null;
      }}
      onDrop={(e) => {
        e.preventDefault();
        const dragged = draggedTabIdSignal.value;
        if (dragged) moveTab(dragged, id);
        draggedTabIdSignal.value = null;
        dropTargetIdSignal.value = null;
      }}
      onDragEnd={() => {
        draggedTabIdSignal.value = null;
        dropTargetIdSignal.value = null;
      }}
      className={`group/tab relative flex h-7 max-w-[184px] items-center rounded-md text-[12px] transition-colors ${tone} ${dropRing}`}
    >
      {editing ? (
        <span className="flex items-center gap-1.5 pl-2.5 pr-2">
          <Icon size={12} strokeWidth={2} className="shrink-0 opacity-70" />
          <input
            ref={focusAndSelect}
            defaultValue={title}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
              if (e.key === "Escape") editingTabIdSignal.value = null;
            }}
            onBlur={(e) => commit(e.target.value)}
            className="w-24 bg-transparent text-[var(--s-text)] outline-none"
          />
        </span>
      ) : (
        <button
          type="button"
          onClick={() => switchTab(id)}
          onDoubleClick={() => (editingTabIdSignal.value = id)}
          title={title}
          className={`flex h-full items-center gap-1.5 pl-2.5 ${closable ? "pr-7" : "pr-2.5"}`}
        >
          <Icon size={12} strokeWidth={2} className="shrink-0 opacity-70" />
          <span className="max-w-[136px] truncate text-left">{title}</span>
        </button>
      )}
      {closable && !editing && (
        <button
          type="button"
          onClick={() => closeTab(id)}
          className="absolute right-1.5 flex h-4 w-4 items-center justify-center rounded opacity-0 transition-opacity hover:bg-white/10 group-hover/tab:opacity-100"
          aria-label="close tab"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function CreateMenu() {
  const open = useSignalValue(createMenuOpenSignal);

  const choose = (kind: TabKind): void => {
    hapticStep("level");
    createMenuOpenSignal.value = false;
    openTab(kind);
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => (createMenuOpenSignal.value = !open)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--s-text-muted)] transition-colors hover:bg-[var(--s-bg-panel)]/50 hover:text-[var(--s-text)]"
        aria-label="create document"
        aria-expanded={open}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => (createMenuOpenSignal.value = false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-1 shadow-xl">
            {CREATE_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.kind}
                  type="button"
                  onClick={() => choose(option.kind)}
                  aria-label={`create ${option.kind}`}
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[var(--s-bg-panel-alt)]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--s-bg-panel-alt)] text-[var(--s-text)]">
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[12px] font-medium text-[var(--s-text)]">{option.label}</span>
                    <span className="text-[10px] text-[var(--s-text-muted)]">{option.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function TitleBarTabs() {
  const tabs = useSignalValue(documentTabsSignal);
  const activeId = useSignalValue(activeTabIdSignal);
  const editingId = useSignalValue(editingTabIdSignal);
  const dropTargetId = useSignalValue(dropTargetIdSignal);

  return (
    <div className={`${NO_DRAG} flex min-w-0 items-center gap-1`}>
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <TabPill
            key={tab.id}
            id={tab.id}
            title={tab.title}
            kind={tab.kind}
            active={tab.id === activeId}
            editing={tab.id === editingId}
            closable={!tab.pinned}
            pinned={!!tab.pinned}
            dropTarget={tab.id === dropTargetId}
          />
        ))}
      </div>
      <CreateMenu />
    </div>
  );
}
