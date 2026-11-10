import { cn } from "@/lib/utils";

export type StepperStep = 0 | 1 | 2 | 3 | 4;

/**
 * Stepper A→Ω sesuai Figma "06 | Prototype". Dua gaya di 06:
 *
 * - `landing` — S-01 (node 129:5116): garis terisi bergradien, hanya step 2 yang dipakai.
 * - `flow` — alur Lite: S-03 (0), S-04 (1), S-05/S-07 (2), S-06 (3), S-08 (4).
 *   Node 2 selalu 16px. Warna titik sedikit berbeda per layar di 06; nilai di
 *   tabel FLOW diambil persis dari node masing-masing layar.
 */

const ALPHA_BG = "linear-gradient(to bottom, #33badf, #ffffff)";

/**
 * Border 0.3px hitam di 06. Browser menggambar minimal 1 piksel perangkat
 * pekat sehingga titik tampak seperti cincin hitam; di Figma (layar 2x) garis
 * 0.3px hanya menutup ±0,6 piksel. Ditiru dengan 0.5px hitam 60%.
 */
const HAIRLINE = "border-[0.5px] border-[rgba(0,0,0,0.6)]";
const nodeGradient = (from: string) => `linear-gradient(to bottom, ${from}, #ffffff)`;

// ---------- landing (S-01) ----------
const LANDING_NODE_DONE = "#4cc2e3";
const LANDING_NODE_CURRENT = "#67cbe7";
const LANDING_LINE_FILLED = ["linear-gradient(to right, #7de3ff, #0e7490)", "linear-gradient(to right, #77ddf9, #177d99)"];

// ---------- flow (S-03–S-08) ----------
const FLOW_LINE_ON = "#4fc3e3";
/** Abu kebiruan untuk segmen awal yang belum dilewati (S-03/S-04). */
const FLOW_IDLE_SOFT = "#b1c7d5";
const FLOW_IDLE = "var(--ato-border-strong)";

type FlowSpec = {
  lines: [string, string, string, string];
  /** null = titik belum dicapai (warna datar dari `idle`). */
  nodes: [string | null, string | null, string | null];
  idle: [string, string, string];
};

const FLOW: Record<StepperStep, FlowSpec> = {
  0: {
    lines: [FLOW_IDLE_SOFT, FLOW_IDLE_SOFT, FLOW_IDLE, FLOW_IDLE],
    nodes: [null, null, null],
    idle: [FLOW_IDLE_SOFT, FLOW_IDLE_SOFT, FLOW_IDLE],
  },
  1: {
    lines: [FLOW_LINE_ON, FLOW_IDLE_SOFT, FLOW_IDLE, FLOW_IDLE],
    nodes: ["#3dbde0", null, null],
    idle: [FLOW_IDLE_SOFT, FLOW_IDLE_SOFT, FLOW_IDLE],
  },
  2: {
    lines: [FLOW_LINE_ON, FLOW_LINE_ON, FLOW_IDLE, FLOW_IDLE],
    nodes: ["#47c0e2", "#3fbee1", null],
    idle: [FLOW_IDLE, FLOW_IDLE, FLOW_IDLE],
  },
  3: {
    lines: [FLOW_LINE_ON, FLOW_LINE_ON, FLOW_LINE_ON, FLOW_IDLE],
    nodes: ["#47c0e2", "#3fbee1", "#3cbde0"],
    idle: [FLOW_IDLE, FLOW_IDLE, FLOW_IDLE],
  },
  4: {
    lines: [FLOW_LINE_ON, FLOW_LINE_ON, FLOW_LINE_ON, FLOW_LINE_ON],
    nodes: ["#38bbdf", "#4dc2e2", "#5ac6e4"],
    idle: [FLOW_IDLE, FLOW_IDLE, FLOW_IDLE],
  },
};
/** Ω tercapai di S-08 (node 149:5403). */
const FLOW_OMEGA_REACHED = "linear-gradient(to bottom, #4ac3e3, var(--ato-bg-2) 99.99%)";

const capClass =
  "flex size-7 shrink-0 items-center justify-center rounded-ato-full font-ato-console text-ato-console uppercase";
const omegaIdleClass = "border border-ato-border-strong bg-ato-bg-2 text-ato-text-3";

function Line({ background }: { background: string }) {
  return <span className="h-[2px] min-w-px flex-1" style={{ background }} />;
}

function Dot({ size, gradientFrom, flat }: { size: 12 | 16; gradientFrom?: string; flat?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-ato-full",
        size === 16 ? "size-4" : "size-3",
        gradientFrom && HAIRLINE
      )}
      style={gradientFrom ? { backgroundImage: nodeGradient(gradientFrom) } : { background: flat }}
    />
  );
}

function Alpha() {
  return (
    <span className={cn(capClass, HAIRLINE, "text-black")} style={{ backgroundImage: ALPHA_BG }}>
      A
    </span>
  );
}

function FlowStepper({ step }: { step: StepperStep }) {
  const spec = FLOW[step];
  const reached = step === 4;
  return (
    <>
      <Alpha />
      {[0, 1, 2].map((i) => (
        <span key={i} className="contents">
          <Line background={spec.lines[i]} />
          <Dot
            size={i === 1 ? 16 : 12}
            gradientFrom={spec.nodes[i] ?? undefined}
            flat={spec.nodes[i] ? undefined : spec.idle[i]}
          />
        </span>
      ))}
      <Line background={spec.lines[3]} />
      <span
        className={cn(capClass, reached ? "border-[0.5px] border-ato-ink text-black" : omegaIdleClass)}
        style={reached ? { backgroundImage: FLOW_OMEGA_REACHED } : undefined}
      >
        Ω
      </span>
    </>
  );
}

function LandingStepper({ step }: { step: StepperStep }) {
  const state = (i: number) => (step > i ? "done" : step === i ? "current" : "upcoming");
  const omegaReached = step === 4;
  return (
    <>
      <Alpha />
      {[1, 2, 3].map((i) => {
        const s = state(i);
        return (
          <span key={i} className="contents">
            <Line
              background={step >= i ? LANDING_LINE_FILLED[Math.min(i - 1, LANDING_LINE_FILLED.length - 1)] : FLOW_IDLE}
            />
            {s === "upcoming" ? (
              <Dot size={12} flat={FLOW_IDLE} />
            ) : (
              <Dot size={s === "current" ? 16 : 12} gradientFrom={s === "current" ? LANDING_NODE_CURRENT : LANDING_NODE_DONE} />
            )}
          </span>
        );
      })}
      <Line background={omegaReached ? LANDING_LINE_FILLED[1] : FLOW_IDLE} />
      <span
        className={cn(capClass, omegaReached ? cn(HAIRLINE, "text-black") : omegaIdleClass)}
        style={omegaReached ? { backgroundImage: ALPHA_BG } : undefined}
      >
        Ω
      </span>
    </>
  );
}

export function StepperAlphaOmega({
  step,
  variant = "landing",
  className,
}: {
  step: StepperStep;
  variant?: "landing" | "flow";
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("flex h-7 w-full items-center", className)}>
      {variant === "flow" ? <FlowStepper step={step} /> : <LandingStepper step={step} />}
    </div>
  );
}

/**
 * Stepper A→Ω desktop S-01 "Cara kerja" — gaya Aero 06 terbaru (node 56:8583):
 * Alpha gradien `#72CFE9 → putih` bergaris hitam; selesai = titik 12 gradien
 * `#78D1E9`; sekarang = 16 gradien `#82D4EB`; garis yang dilewati `#5C9EB0`;
 * berikut = `border/strong`; Ω = `bg/2` atau aksen penuh jika step 4.
 */
export function StepperAlphaOmegaDesktop({ step, className }: { step: StepperStep; className?: string }) {
  const line = (on: boolean) => <span className={cn("h-[2px] min-w-px flex-1", on ? "bg-[#5c9eb0]" : "bg-ato-border-strong")} />;
  const node = (i: number) =>
    step > i ? (
      <span className={cn("size-3 shrink-0 rounded-ato-full bg-gradient-to-b from-[#78d1e9] to-white", HAIRLINE)} />
    ) : step === i ? (
      <span className={cn("size-4 shrink-0 rounded-ato-full bg-gradient-to-b from-[#82d4eb] to-white", HAIRLINE)} />
    ) : (
      <span className="size-3 shrink-0 rounded-ato-full bg-ato-border-strong" />
    );
  return (
    <div aria-hidden className={cn("flex h-7 w-full items-center", className)}>
      <span className={cn(capClass, "border-[0.5px] border-ato-ink bg-gradient-to-b from-[#72cfe9] to-white text-ato-text-1")}>A</span>
      {[1, 2, 3].map((i) => (
        <span key={i} className="contents">
          {line(step >= i)}
          {node(i)}
        </span>
      ))}
      {line(step >= 4)}
      <span className={cn(capClass, step >= 4 ? "bg-ato-lite-accent text-white shadow-ato-gloss" : omegaIdleClass)}>Ω</span>
    </div>
  );
}
