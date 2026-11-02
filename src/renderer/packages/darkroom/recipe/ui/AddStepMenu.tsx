import React from "react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { SECTION_TITLE_CLASS } from "@bitgrain/ui/components/section-title-classes";
import { MenuOptionRow } from "@bitgrain/ui/components/MenuOptionRow";
import { addMonoStep, addPaperStep, chooseLook, openStepPanel } from "../add-step-actions";

interface AddStepOption {
  key: string;
  label: string;
  detail: string;
  onPick: () => void;
}

interface AddStepMenuProps {
  isColor: boolean;
  hasPaper: boolean;
  effects: React.ReactNode;
  className?: string;
}

interface OptionListProps {
  options: AddStepOption[];
}

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

const MENU_CLASS = "w-72 max-h-[70vh] overflow-y-auto bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1.5 font-editorial";

const LOOK_OPTION: AddStepOption = { key: "look", label: "Choose a look", detail: "Halftone, dither, riso, ASCII and more", onPick: chooseLook };
const PALETTE_OPTION: AddStepOption = { key: "palette", label: "Palette", detail: "Print with a small set of inks", onPick: () => openStepPanel("palette") };
const GRADE_OPTION: AddStepOption = { key: "lut", label: "Film grade", detail: "Colour from classic film stocks", onPick: () => openStepPanel("lut") };
const MONO_OPTION: AddStepOption = { key: "mono", label: "Black and white", detail: "Drop the colour", onPick: addMonoStep };
const TONE_OPTION: AddStepOption = { key: "tone", label: "Tone", detail: "Brightness, contrast, curves, white balance", onPick: () => openStepPanel("tone") };
const PAPER_OPTION: AddStepOption = { key: "finish", label: "Paper texture", detail: "Paper grain, ink tone and soft edges", onPick: addPaperStep };

const MenuSection: React.FC<MenuSectionProps> = ({ title, children }) => (
  <div className="pb-1">
    <p className={`${SECTION_TITLE_CLASS} px-2.5 pt-2 pb-1`}>{title}</p>
    {children}
  </div>
);

const OptionList: React.FC<OptionListProps> = ({ options }) => (
  <>
    {options.map((option) => (
      <MenuOptionRow key={option.key} label={option.label} detail={option.detail}
        onClick={() => { option.onPick(); emitPopover(null); }} />
    ))}
  </>
);

export const AddStepMenu: React.FC<AddStepMenuProps> = ({ isColor, hasPaper, effects, className = MENU_CLASS }) => (
  <div className={className}>
    <MenuSection title="Look"><OptionList options={[LOOK_OPTION]} /></MenuSection>
    <MenuSection title="Effect">{effects}</MenuSection>
    <MenuSection title="Colour"><OptionList options={isColor ? [PALETTE_OPTION, GRADE_OPTION, MONO_OPTION] : [PALETTE_OPTION, GRADE_OPTION]} /></MenuSection>
    <MenuSection title="Adjust"><OptionList options={[TONE_OPTION]} /></MenuSection>
    {!hasPaper && <MenuSection title="Finish"><OptionList options={[PAPER_OPTION]} /></MenuSection>}
  </div>
);
