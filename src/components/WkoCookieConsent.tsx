import { useEffect } from "react";

declare global {
  interface Window {
    GCM?: {
      init: (
        configUrl: string,
        language: string,
        clientId: number,
        useOverlay: boolean,
      ) => void;
      settings: {
        save: () => void;
      };
    };
    gtmcid?: string;
    dataLayer?: unknown[];
    trackingDomain?: string;
    tradom?: string;
    __CMP_CORE_LOADED__?: boolean;
    clickEdit?: () => void;
    getBanner?: () => void;
    blockingBanner?: () => void;
  }
}

const GCM_SCRIPT_ID = "wko-gcm-script";
const CONSENT_SCRIPT_ID = "wko-consent-script";
const GCM_SCRIPT_URL = "https://consent.wko.at/wko/gcm.js";
const GCM_CONFIG_URL = "https://consent.wko.at/wko/config.js";
const CONSENT_SCRIPT_URL = "https://consent.wko.at/consent.js";
const CMP_CORE_TIMEOUT_MS = 5000;

const waitForCmpCore = () =>
  new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();

    const poll = () => {
      if (window.__CMP_CORE_LOADED__) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > CMP_CORE_TIMEOUT_MS) {
        reject();
        return;
      }

      window.setTimeout(poll, 50);
    };

    poll();
  });

const initializeCmpCore = () => {
  window.trackingDomain =
    typeof window.tradom === "string" && window.tradom !== ""
      ? window.tradom
      : "tms.wko.at";
  window.clickEdit?.();
  window.getBanner?.();
  window.blockingBanner?.();
};

const loadScript = (
  id: string,
  src: string,
  target: HTMLElement = document.head,
) =>
  new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(id) as
      | HTMLScriptElement
      | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.type = "text/javascript";
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject();

    target.appendChild(script);
  });

export const WkoCookieConsent = () => {
  useEffect(() => {
    let cancelled = false;

    loadScript(GCM_SCRIPT_ID, GCM_SCRIPT_URL)
      .then(() => {
        if (cancelled || !window.GCM) {
          return;
        }

        const lang = document.documentElement.lang.slice(0, 2);
        window.GCM.init(GCM_CONFIG_URL, lang, 1, true);
        window.GCM.settings.save();
        window.gtmcid = "GTM-WJCQGGP";
        window.dataLayer = [];

        return loadScript(CONSENT_SCRIPT_ID, CONSENT_SCRIPT_URL, document.body);
      })
      .then(() => waitForCmpCore())
      .then(() => {
        if (cancelled || document.readyState !== "complete") {
          return;
        }

        initializeCmpCore();
      })
      .catch(() => {
        // Match the original site's external consent dependency without
        // interrupting the calculator if the hosted script is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};
