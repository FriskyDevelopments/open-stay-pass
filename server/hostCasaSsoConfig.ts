export type HostCasaSsoStatus = {
  configured: boolean;
  supabaseUrl?: string;
  missing: Array<"VITE_HOSTCASA_SUPABASE_URL" | "VITE_HOSTCASA_SUPABASE_ANON_KEY">;
};

type HostCasaSsoEnvironment = {
  VITE_HOSTCASA_SUPABASE_URL?: string;
  VITE_HOSTCASA_SUPABASE_ANON_KEY?: string;
};

function normalise(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isHttpsUrl(value: string | undefined) {
  if (!value) return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Reports whether the public configuration needed to start a HostCasa-branded
 * Supabase login flow is present. It deliberately never returns the anon key.
 */
export function resolveHostCasaSsoStatus(
  environment: HostCasaSsoEnvironment = process.env as HostCasaSsoEnvironment,
): HostCasaSsoStatus {
  const supabaseUrl = normalise(environment.VITE_HOSTCASA_SUPABASE_URL);
  const anonKey = normalise(environment.VITE_HOSTCASA_SUPABASE_ANON_KEY);
  const missing: HostCasaSsoStatus["missing"] = [];

  if (!isHttpsUrl(supabaseUrl)) {
    missing.push("VITE_HOSTCASA_SUPABASE_URL");
  }

  if (!anonKey) {
    missing.push("VITE_HOSTCASA_SUPABASE_ANON_KEY");
  }

  return {
    configured: missing.length === 0,
    ...(supabaseUrl && isHttpsUrl(supabaseUrl) ? { supabaseUrl } : {}),
    missing,
  };
}
