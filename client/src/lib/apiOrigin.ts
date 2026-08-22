export const OPEN_STAY_API_ORIGIN = (import.meta.env.VITE_OPEN_STAY_API_ORIGIN ?? "").trim().replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${OPEN_STAY_API_ORIGIN}${path}`;
}
