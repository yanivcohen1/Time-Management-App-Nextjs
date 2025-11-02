const JWT_STORAGE_KEY = "jwt";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJwtToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(JWT_STORAGE_KEY);
}

export function persistJwtToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(JWT_STORAGE_KEY, token);
}

export function clearJwtToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(JWT_STORAGE_KEY);
}

export { JWT_STORAGE_KEY };
