import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted fonts: work offline and avoid third-party requests (privacy, low data).
import "@fontsource-variable/anek-latin/standard.css";
import "@fontsource-variable/anek-tamil/standard.css";
import "@fontsource/yaldevi/400.css";
import "@fontsource/yaldevi/500.css";
import "@fontsource/yaldevi/600.css";
import "@fontsource/yaldevi/700.css";
import "./index.css";
import { I18nProvider } from "@/lib/i18n";
import { AppProviders } from "@/lib/api-context";
import { ToastProvider } from "@/components/ui";
import { App } from "@/app/App";
import { applyTheme } from "@/lib/theme";

// theme-init.js normally does this before first paint; repeat in case it was not loaded.
applyTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <AppProviders>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProviders>
    </I18nProvider>
  </StrictMode>,
);

// Offline support: register the service worker when available (skipped in previews/sandboxes).
if ("serviceWorker" in navigator && import.meta.env.PROD && import.meta.env.MODE !== "artifact") {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true })).catch(() => undefined);
}
