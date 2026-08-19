export type ConciergeRuntime = {
  provider: "built_in" | "local";
  model?: string;
  usesLiveProvider: boolean;
};

export function resolveConciergeRuntime(env: Record<string, string | undefined> = process.env): ConciergeRuntime {
  const provider = env.CONCIERGE_PROVIDER === "local" ? "local" : "built_in";
  return {
    provider,
    model: env.CONCIERGE_LLM_MODEL || undefined,
    usesLiveProvider: provider === "built_in",
  };
}
