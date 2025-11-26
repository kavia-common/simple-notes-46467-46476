/* eslint-disable no-undef */
/* global window */

function getWindowSafe(): any | undefined {
  try {
    return typeof window !== 'undefined' ? (window as any) : undefined;
  } catch {
    return undefined;
  }
}

function readGlobalVar(key: string): string {
  // Prefer browser global injection, else Node process.env during SSR/build
  const w = getWindowSafe();
  const p = typeof process !== 'undefined' ? (process as any) : undefined;
  const fromWindow = w && typeof w[key] !== 'undefined' ? String(w[key]) : '';
  const fromEnv = p?.env && typeof p.env[key] !== 'undefined' ? String(p.env[key]) : '';
  return fromWindow || fromEnv || '';
}

export const environment = {
  production: false,
  apiBase: readGlobalVar('NG_APP_API_BASE'),
  backendUrl: readGlobalVar('NG_APP_BACKEND_URL'),
  frontendUrl: readGlobalVar('NG_APP_FRONTEND_URL'),
  wsUrl: readGlobalVar('NG_APP_WS_URL'),
};
