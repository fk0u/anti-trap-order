/**
 * Pintu tunggal data Lite untuk LiteFlow: API v1 (default) atau mesin lokal
 * (mode terbatas, dipilih user lewat "Lanjut mode terbatas").
 *
 * Mesin lokal dimuat lewat dynamic import, jadi tidak membebani bundel awal.
 * Tidak ada peralihan diam-diam: LiteFlow hanya memanggil `loadLocalEngine()`
 * setelah user menekan tombol itu.
 */
import {
  analyzeText,
  getScenario,
  listCategories,
  listScenarios,
  listTactics,
  reflect,
  type RequestOptions,
} from "@/lib/api-v1";
import type {
  AnalyzeResponse,
  Category,
  CategoryId,
  ReflectRequest,
  ReflectResponse,
  ScenarioDetail,
  ScenarioSummary,
  Tactic,
} from "@/types/api-v1";

export interface LiteEngine {
  readonly local: boolean;
  listCategories(opts?: RequestOptions): Promise<Category[]>;
  listTactics(opts?: RequestOptions): Promise<Tactic[]>;
  listScenarios(category?: CategoryId, opts?: RequestOptions): Promise<ScenarioSummary[]>;
  getScenario(id: string, opts?: RequestOptions): Promise<ScenarioDetail>;
  analyzeText(text: string, opts?: RequestOptions): Promise<AnalyzeResponse>;
  reflect(req: ReflectRequest, opts?: RequestOptions): Promise<ReflectResponse>;
}

export const remoteEngine: LiteEngine = {
  local: false,
  listCategories,
  listTactics,
  listScenarios,
  getScenario,
  analyzeText,
  reflect,
};

/** Muat mesin lokal. Gagal (mis. chunk tidak terunduh karena offline total) → melempar. */
export async function loadLocalEngine(): Promise<LiteEngine> {
  const m = await import("@/lib/offline/engine");
  return {
    local: true,
    listCategories: async () => m.listCategoriesLocal(),
    listTactics: async () => m.listTacticsLocal(),
    listScenarios: async (category) => m.listScenariosLocal(category),
    getScenario: async (id) => m.getScenarioLocal(id),
    analyzeText: async (text) => m.analyzeTextLocal(text),
    reflect: async (req) => m.reflectLocal(req),
  };
}
