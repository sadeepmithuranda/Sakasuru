import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MeDTO } from "@sakasuru/validation";
import type { Api } from "@/data/api";
import { createRemoteApi } from "@/data/remote";
import { createLocalApi } from "@/data/local";
import { useI18n } from "./i18n";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const api: Api = API_URL ? createRemoteApi(API_URL) : createLocalApi();

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

interface Session {
  me: MeDTO | null;
  ready: boolean;
  setMe: (m: MeDTO | null) => void;
}
const SessionCtx = createContext<Session | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const [me, setMeState] = useState<MeDTO | null>(null);
  const [ready, setReady] = useState(false);
  const { setLang } = useI18n();
  const setMe = (m: MeDTO | null) => {
    setMeState(m);
    if (m) setLang(m.profile.language);
    if (!m) queryClient.clear();
  };
  useEffect(() => {
    api
      .restore()
      .then((m) => m && setMe(m))
      .catch(() => undefined)
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply accessibility preferences app-wide.
  useEffect(() => {
    const p = me?.preferences;
    const root = document.documentElement;
    root.style.setProperty("--text-scale", String(p?.textScale ?? 1));
    root.classList.toggle("reduce-motion", !!(p?.reducedMotion || p?.dataSaver));
    root.classList.toggle("high-contrast", !!p?.highContrast);
  }, [me?.preferences]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionCtx.Provider value={{ me, ready, setMe }}>{children}</SessionCtx.Provider>
    </QueryClientProvider>
  );
}

export function useSession() {
  const v = useContext(SessionCtx);
  if (!v) throw new Error("useSession outside provider");
  return v;
}
