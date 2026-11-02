import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface MobileBlockProps {
  onBack: () => void;
  title: string;
  body: string;
}

export const MobileBlock: React.FC<MobileBlockProps> = ({ onBack, title, body }) => {
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
          onClick={onBack}
          className="flex items-center gap-1.5 bg-[var(--s-accent)] text-[var(--s-accent-text)] border-none rounded-lg cursor-pointer text-[13px] font-bold font-inherit px-5 py-2.5"
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          Back to Bitgrain
        </button>
        <button
          onClick={() => navigate("/editor")}
          className="text-zinc-400 hover:text-zinc-200 transition-colors text-[13px] font-inherit bg-transparent border-none cursor-pointer"
        >
          Edit a photo instead
        </button>
      </div>
    </div>
  );
};
