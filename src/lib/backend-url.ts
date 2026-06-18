const DEFAULT_BACKEND_URL = "http://localhost:4000";

export function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(
    /\/+$/,
    ""
  );
}
