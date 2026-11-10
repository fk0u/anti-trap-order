"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_RETRY_AFTER_S, errorScreen, isApiError, listCharacters, startSoul, stepSoul } from "@/lib/api-v1";
import { liteCopy } from "@/content/lite";
import { soulCopy } from "@/content/soul";
import { NICKNAME_MAX_LENGTH, checkNickname } from "@/lib/soul/rules";
import { fillStory, type ChoiceId, type CharacterOptions, type Meters, type Mission, type SoulStepResponse } from "@/types/api-v1";
import { ServerErrorScreen } from "@/components/errors/ErrorScreens";
import { ApiDownSheet } from "@/components/lite/ApiDownSheet";
import { RateLimitScreen } from "@/components/lite/RateLimitScreen";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { CharacterScreen, type CharacterSelection } from "@/components/soul/CharacterScreen";
import { ConsequenceScreen } from "@/components/soul/ConsequenceScreen";
import { MissionScreen } from "@/components/soul/MissionScreen";
import { SOUL_GRADIENTS } from "@/components/soul/SoulParts";
import { SummaryScreen } from "@/components/soul/SummaryScreen";

type Step = "character" | "m1" | "m2" | "m3" | "k1" | "k2" | "k3" | "summary";
const STEPS: readonly Step[] = ["character", "m1", "m2", "m3", "k1", "k2", "k3", "summary"];

type MissionRun = {
  mission: Mission;
  /** Meter sebelum misi ini dijawab (MeterMini S-11). */
  meters: Meters;
  choice: ChoiceId | null;
  result: SoulStepResponse | null;
};

type Run = {
  arcId: string;
  /** Nama & relasi hanya untuk fillStory() di browser — tidak pernah dikirim. */
  name: string;
  relation: string;
  total: number;
  startMeters: Meters;
  missions: MissionRun[];
};

type RateLimit = { seconds: number; after?: () => void };

const sub = (a: Meters, b: Meters): Meters => ({
  kepercayaan: a.kepercayaan - b.kepercayaan,
  kewaspadaan: a.kewaspadaan - b.kewaspadaan,
  keamanan: a.keamanan - b.keamanan,
});

/**
 * Alur A20 Soul (S-10 → S-14) dalam satu route `/soul`. Pola sama dengan
 * LiteFlow: setiap langkah = satu entri riwayat (pushState), refresh → S-10,
 * Back setelah refresh langsung keluar dari /soul.
 *
 * Privasi: nama panggilan dan relasi hanya dipakai di browser (fillStory).
 * Server hanya menerima arc_id, mission_id, choice_id, dan meter.
 */
export function SoulFlow() {
  const [step, setStep] = useState<Step>("character");
  const stepRef = useRef<Step>("character");

  // S-10
  const [options, setOptions] = useState<CharacterOptions | null>(null);
  const [optionsFailed, setOptionsFailed] = useState(false);
  const [selection, setSelection] = useState<CharacterSelection>(null);
  const [nickname, setNickname] = useState("");
  const [relationId, setRelationId] = useState("");
  const [busy, setBusy] = useState(false);

  // S-11 – S-14
  const [run, setRun] = useState<Run | null>(null);
  const [locked, setLocked] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Overlay error
  const [sheetRetry, setSheetRetry] = useState<(() => void) | null>(null); // S-19
  const [serverRetry, setServerRetry] = useState<(() => void) | null>(null); // S-18
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null); // S-20

  // ---------- Riwayat browser (sama dengan LiteFlow) ----------

  const session = useRef("");
  const idx = useRef(0);

  const go = useCallback((next: Step) => {
    idx.current += 1;
    window.history.pushState(
      { ...(window.history.state ?? {}), soulStep: next, soulSession: session.current, soulIdx: idx.current },
      ""
    );
    stepRef.current = next;
    setStep(next);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    session.current = Math.random().toString(36).slice(2);
    const prev = window.history.state as { soulIdx?: number } | null;
    const base = typeof prev?.soulIdx === "number" ? prev.soulIdx : 0;
    idx.current = base;
    window.history.replaceState(
      { ...(window.history.state ?? {}), soulStep: "character", soulSession: session.current, soulIdx: base },
      ""
    );
    const onPop = (e: PopStateEvent) => {
      const st = e.state as { soulStep?: Step; soulSession?: string; soulIdx?: number } | null;
      if (st?.soulSession !== session.current) {
        const i = typeof st?.soulIdx === "number" ? st.soulIdx : 0;
        if (i < base) window.history.go(-(i + 1));
        else window.history.go(base - i);
        return;
      }
      idx.current = st.soulIdx ?? 0;
      const target: Step = st.soulStep && STEPS.includes(st.soulStep) ? st.soulStep : "character";
      stepRef.current = target;
      setStep(target);
      setConfirmOpen(false);
      setSheetRetry(null);
      setServerRetry(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ---------- Error ----------

  const handleError = useCallback((err: unknown, retry: () => void, afterRate?: () => void) => {
    switch (errorScreen(err)) {
      case "ignore":
        return;
      case "rate":
        setRateLimit({ seconds: (isApiError(err) && err.retryAfter) || DEFAULT_RETRY_AFTER_S, after: afterRate });
        return;
      case "offline":
        setSheetRetry(() => retry);
        return;
      case "server":
        setServerRetry(() => retry);
        return;
    }
  }, []);

  // ---------- S-10 ----------

  const loadOptions = useCallback(() => {
    const ctrl = new AbortController();
    setOptionsFailed(false);
    listCharacters({ signal: ctrl.signal })
      .then((o) => {
        setOptions(o);
        setRelationId((cur) => cur || o.relations[0]?.id || "");
      })
      .catch((err) => {
        if (errorScreen(err) === "ignore") return;
        setOptionsFailed(true);
        handleError(err, loadOptions, loadOptions);
      });
    return () => ctrl.abort();
  }, [handleError]);

  useEffect(() => loadOptions(), [loadOptions]);

  const maxLength = Math.min(Math.max(options?.nickname_max_length ?? NICKNAME_MAX_LENGTH, 1), NICKNAME_MAX_LENGTH);
  const nicknameCheck = useMemo(() => checkNickname(nickname, maxLength), [nickname, maxLength]);

  /** Karakter terpilih → arc, nama, relasi. null jika belum valid. */
  const chosen = useMemo(() => {
    if (!options || !selection) return null;
    if (selection.kind === "template") {
      const t = options.templates.find((x) => x.id === selection.id);
      const rel = options.relations.find((r) => r.id === t?.relation_id);
      return t && rel ? { arcId: t.arc_id, name: t.default_name, relation: rel.label } : null;
    }
    const rel = options.relations.find((r) => r.id === relationId);
    return nicknameCheck.ok && rel ? { arcId: rel.arc_id, name: nicknameCheck.value, relation: rel.label } : null;
  }, [options, selection, relationId, nicknameCheck]);

  const onStart = useCallback(async () => {
    if (!chosen) return;
    setBusy(true);
    try {
      const st = await startSoul(chosen.arcId);
      setRun({
        arcId: st.arc_id,
        name: chosen.name,
        relation: chosen.relation,
        total: st.total_missions,
        startMeters: st.meters,
        missions: [{ mission: st.mission, meters: st.meters, choice: null, result: null }],
      });
      go("m1");
    } catch (err) {
      handleError(err, () => void onStart());
    } finally {
      setBusy(false);
    }
  }, [chosen, go, handleError]);

  // ---------- S-11 / S-13 ----------

  const fill = useCallback((text: string) => (run ? fillStory(text, run.name, run.relation) : text), [run]);

  const setChoice = (i: number, choice: ChoiceId) =>
    setRun((r) => (r ? { ...r, missions: r.missions.map((m, j) => (j === i ? { ...m, choice } : m)) } : r));

  const onChoose = useCallback(
    async (i: number) => {
      const m = run?.missions[i];
      if (!run || !m || !m.choice) return;
      if (m.result) {
        go(`k${i + 1}` as Step); // misi sudah dijawab: hanya lihat lagi akibatnya
        return;
      }
      setLocked(true);
      try {
        const res = await stepSoul({ arc_id: run.arcId, mission_id: m.mission.id, choice_id: m.choice, meters: m.meters });
        setRun((r) => {
          if (!r) return r;
          const missions = r.missions.map((x, j) => (j === i ? { ...x, result: res } : x));
          if (res.next_mission && !missions[i + 1]) {
            missions.push({ mission: res.next_mission, meters: res.meters, choice: null, result: null });
          }
          return { ...r, missions };
        });
        // Jika user sudah pindah layar (mis. Back) selama menunggu, jangan dipaksa pindah.
        if (stepRef.current === `m${i + 1}`) go(`k${i + 1}` as Step);
      } catch (err) {
        handleError(err, () => void onChoose(i));
      } finally {
        setLocked(false);
      }
    },
    [run, go, handleError]
  );

  const resetToCharacter = useCallback(() => {
    setRun(null);
    setConfirmOpen(false);
    go("character");
  }, [go]);

  // ---------- Render ----------

  // Langkah yang datanya sudah tidak ada (mis. setelah "Ganti") → kembali ke yang masih valid.
  let view: Step = step;
  const num = step === "character" || step === "summary" ? 0 : Number(step.slice(1));
  const mr = num > 0 ? run?.missions[num - 1] : undefined;
  if (num > 0 && !mr) view = "character";
  if (step.startsWith("k") && mr && !mr.result) view = `m${num}` as Step;
  const last = run?.missions[run.missions.length - 1];
  if (step === "summary" && !last?.result?.summary) view = run ? (`m${run.missions.length}` as Step) : "character";

  let screen: React.ReactNode = null;
  if (view === "character") {
    screen = (
      <CharacterScreen
        options={options}
        selection={selection}
        onSelectTemplate={(id) => setSelection({ kind: "template", id })}
        nickname={nickname}
        nicknameCheck={nicknameCheck}
        maxLength={maxLength}
        relationId={relationId}
        onCustomChange={(n, rel) => {
          setSelection({ kind: "custom" });
          setNickname(n);
          setRelationId(rel);
        }}
        canStart={chosen !== null}
        busy={busy}
        retry={
          optionsFailed && !options && !sheetRetry && !serverRetry && !rateLimit
            ? { label: liteCopy.offline.retry, onClick: () => loadOptions() }
            : undefined
        }
        onStart={() => void onStart()}
      />
    );
  } else if (run && view.startsWith("m")) {
    const i = Number(view.slice(1)) - 1;
    const m = run.missions[i];
    screen = (
      <MissionScreen
        key={m.mission.id}
        mission={m.mission}
        total={run.total}
        meters={m.meters}
        story={fill(m.mission.story)}
        selected={m.choice}
        onSelect={(c) => setChoice(i, c)}
        mode={m.result ? "answered" : locked ? "locked" : "open"}
        onChoose={() => void onChoose(i)}
        onChangeCharacter={() => setConfirmOpen(true)}
      />
    );
  } else if (run && view.startsWith("k")) {
    const i = Number(view.slice(1)) - 1;
    const m = run.missions[i];
    const res = m.result!;
    screen = (
      <ConsequenceScreen
        index={res.mission_index}
        total={run.total}
        choice={res.choice_id}
        whatHappened={fill(res.consequence.what_happened)}
        why={fill(res.consequence.why)}
        meters={res.meters}
        deltas={res.deltas}
        isLast={res.next_mission === null}
        onBack={() => window.history.back()}
        onNext={() => go(res.next_mission ? (`m${i + 2}` as Step) : "summary")}
      />
    );
  } else if (run && view === "summary" && last?.result?.summary) {
    const s = last.result.summary;
    screen = (
      <SummaryScreen
        summary={{ ...s, description: fill(s.description), insights: s.insights.map(fill) }}
        deltas={sub(s.final_meters, run.startMeters)}
        onAgain={() => {
          setSelection(null);
          resetToCharacter();
        }}
      />
    );
  }

  return (
    <>
      {screen}
      {/* Keputusan desain mandiri: konfirmasi ganti karakter (tidak ada di 06). */}
      <BottomSheet id="soul-change-character" open={confirmOpen} onClose={() => setConfirmOpen(false)} title={soulCopy.changeCharacter.title}>
        <div className="flex w-full flex-col gap-ato-12">
          <Button variant="aqua" desktop="soul" gradient={SOUL_GRADIENTS.next} labelClassName="text-[#1b1b1b]" className="lg:w-full" onClick={() => setConfirmOpen(false)}>
            {soulCopy.changeCharacter.cancel}
          </Button>
          <Button variant="secondary" size="md" desktop="secondary" className="lg:w-full" onClick={resetToCharacter}>
            {soulCopy.changeCharacter.confirm}
          </Button>
        </div>
      </BottomSheet>
      <ApiDownSheet
        open={sheetRetry !== null}
        onClose={() => setSheetRetry(null)}
        onRetry={() => {
          const retry = sheetRetry;
          setSheetRetry(null);
          retry?.();
        }}
      />
      {serverRetry && (
        <ServerErrorScreen
          overlay
          onRetry={() => {
            const retry = serverRetry;
            setServerRetry(null);
            retry();
          }}
        />
      )}
      {rateLimit && (
        <RateLimitScreen
          key={rateLimit.seconds}
          seconds={rateLimit.seconds}
          onClose={() => {
            const after = rateLimit.after;
            setRateLimit(null);
            after?.();
          }}
        />
      )}
    </>
  );
}
