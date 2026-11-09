import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | 4;

/**
 * Stepper A→Ω sesuai Figma "06 | Prototype".
 *
 * Gaya yang sudah dicocokkan dengan 06: step 2 (S-01, node 129:5116).
 * Step lain mengikuti pola yang sama dan perlu dicek ulang saat layar
 * S-03 s.d. S-08 dikerjakan.
 */

// Nilai dari node 129:5116 (S-01).
const ALPHA_BG = "linear-gradient(to bottom, #33badf, #ffffff)";
const NODE_DONE_BG = "linear-gradient(to bottom, #4cc2e3, #ffffff)";
const NODE_CURRENT_BG = "linear-gradient(to bottom, #67cbe7, #ffffff)";
const LINE_FILLED_BG = [
  "linear-gradient(to right, #7de3ff, #0e7490)",
  "linear-gradient(to right, #77ddf9, #177d99)",
];

function Line({ filled, index }: { filled: boolean; index: number }) {
  return (
    <span
      className={cn("h-[2px] min-w-px flex-1", !filled && "bg-ato-border-strong")}
      style={filled ? { backgroundImage: LINE_FILLED_BG[Math.min(index, LINE_FILLED_BG.length - 1)] } : undefined}
    />
  );
}

function Node({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "upcoming") {
    return <span className="size-3 shrink-0 rounded-ato-full bg-ato-border-strong" />;
  }
  return (
    <span
      className={cn(
        "shrink-0 rounded-ato-full border-[0.3px] border-ato-ink",
        state === "current" ? "size-4" : "size-3"
      )}
      style={{ backgroundImage: state === "current" ? NODE_CURRENT_BG : NODE_DONE_BG }}
    />
  );
}

const capClass = "flex size-7 shrink-0 items-center justify-center rounded-ato-full font-ato-console text-ato-console uppercase";

export function StepperAlphaOmega({ step, className }: { step: Step; className?: string }) {
  const nodeState = (i: number) => (step > i ? "done" : step === i ? "current" : "upcoming");
  const omegaReached = step === 4;

  return (
    <div aria-hidden className={cn("flex h-7 w-full items-center", className)}>
      <span className={cn(capClass, "border-[0.3px] border-ato-ink text-black")} style={{ backgroundImage: ALPHA_BG }}>
        A
      </span>
      {[1, 2, 3].map((i) => (
        <span key={i} className="contents">
          <Line filled={step >= i} index={i - 1} />
          <Node state={nodeState(i)} />
        </span>
      ))}
      <Line filled={omegaReached} index={3} />
      <span
        className={cn(
          capClass,
          omegaReached
            ? "border-[0.3px] border-ato-ink text-black"
            : "border border-ato-border-strong bg-ato-bg-2 text-ato-text-3"
        )}
        style={omegaReached ? { backgroundImage: ALPHA_BG } : undefined}
      >
        Ω
      </span>
    </div>
  );
}
