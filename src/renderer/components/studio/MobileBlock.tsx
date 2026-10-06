import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface MobileBlockProps {
  onBack: () => void;
  title?: string;
  body?: string;
  backLabel?: string;
}

export const MobileBlock: React.FC<MobileBlockProps> = ({
  onBack,
  title = "this part needs a bigger screen",
  body = "studio and video use a layered canvas built for a desktop pointer. the image editor works right here on your phone, drop a photo and go.",
  backLabel = "back to home",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-8 text-center font-editorial gap-5">
      <img
        height={40}
        width={40}
        className="rounded"
        src="/bitgrainlogo.png"
        alt="bitgrain"
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-[22px] font-extrabold text-[#fafafa] m-0">
          {title}
        </h1>
        <p className="text-sm text-zinc-400 m-0 leading-[1.6] max-w-[320px]">
          {body}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 mt-1">
        <button
          onClick={() => navigate("/editor")}
          className="flex items-center gap-1.5 bg-[var(--s-accent)] text-[var(--s-accent-text)] border-none rounded-lg cursor-pointer text-[13px] font-bold font-inherit px-5 py-2.5"
        >
          open the editor
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-[12px] font-inherit bg-transparent border-none cursor-pointer"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
};
