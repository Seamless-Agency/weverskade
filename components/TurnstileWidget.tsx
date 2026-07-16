"use client";

import { useEffect, useImperativeHandle, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Turnstile schakelt zichzelf pas in zodra de sitekey is ingesteld. Zonder key
// blijft alles werken zoals voorheen, zodat een deploy waarin de env-vars nog
// ontbreken de formulieren niet breekt. De server slaat de controle dan ook
// over — zie lib/turnstile.ts.
export const isTurnstileEnabled = Boolean(SITE_KEY);

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

let scriptPromise: Promise<void> | null = null;

function loadScript() {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      // Vrijgeven zodat een volgende mount het opnieuw mag proberen.
      scriptPromise = null;
      reject(new Error("Turnstile-script kon niet worden geladen."));
    });
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function TurnstileWidget({
  ref,
  onVerify,
  onError,
  action,
  className,
}: {
  ref?: React.Ref<TurnstileHandle>;
  /** Krijgt het token, of een lege string zodra dat verloopt of faalt. */
  onVerify: (token: string) => void;
  onError?: () => void;
  action?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacks = useRef({ onVerify, onError });

  useEffect(() => {
    callbacks.current = { onVerify, onError };
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      const id = widgetIdRef.current;
      if (id === null || !window.turnstile) return;

      try {
        window.turnstile.reset(id);
      } catch {
        // Widget al opgeruimd; er valt niets te resetten.
      }
    },
  }), []);

  useEffect(() => {
    if (!SITE_KEY) return;

    let cancelled = false;

    loadScript()
      .then(() => {
        const container = containerRef.current;

        if (cancelled || !container || !window.turnstile) return;
        if (widgetIdRef.current !== null) return;

        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: SITE_KEY,
          action,
          theme: "light",
          language: "nl",
          callback: (token: string) => callbacks.current.onVerify(token),
          // Een verlopen of mislukt token is onbruikbaar: leeg het, zodat de
          // verzendknop weer op slot gaat tot Turnstile een nieuw token geeft.
          "expired-callback": () => callbacks.current.onVerify(""),
          "timeout-callback": () => callbacks.current.onVerify(""),
          "error-callback": () => {
            callbacks.current.onVerify("");
            callbacks.current.onError?.();
          },
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError?.();
      });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      widgetIdRef.current = null;

      if (id === null || !window.turnstile) return;

      try {
        window.turnstile.remove(id);
      } catch {
        // Widget kan al door Cloudflare zijn opgeruimd.
      }
    };
  }, [action]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className={className} />;
}
