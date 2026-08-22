import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { apiUrl } from "./apiOrigin";

const supabaseUrl = import.meta.env.VITE_HOSTCASA_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_HOSTCASA_SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export function isHostCasaLoginConfigured() {
  return Boolean(getClient());
}

export type HostCasaProvider = "apple" | "google" | "azure";

export async function startHostCasaLogin(provider: HostCasaProvider = "google") {
  const supabase = getClient();
  if (!supabase) return false;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/operator` },
  });
  if (error) throw error;
  return true;
}

export async function signOutHostCasaSession(supabaseClient: SupabaseClient | null = getClient()) {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
}

export async function syncHostCasaSession() {
  const supabase = getClient();
  if (!supabase) return false;

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return false;

  const response = await fetch(apiUrl("/api/auth/hostcasa/session"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    await supabase.auth.signOut();
    return false;
  }
  return true;
}
