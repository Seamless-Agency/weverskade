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
  // Aantal automatische herstelpogingen na een client-side fout, begrensd om
  // een oneindige challenge-loop te voorkomen.
  const autoRetriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbacks.current = { onVerify, onError };
  });

  const resetWidget = () => {
    const id = widgetIdRef.current;
    if (id === null || !window.turnstile) return;

    try {
      window.turnstile.reset(id);
    } catch {
      // Widget al opgeruimd; er valt niets te resetten.
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      // Handmatige reset (bv. na een verzendpoging) telt als schone lei.
      autoRetriesRef.current = 0;
      resetWidget();
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
          retry: "auto",
          callback: (token: string) => {
            // Geslaagd: schone lei voor eventuele latere fouten.
            autoRetriesRef.current = 0;
            callbacks.current.onVerify(token);
          },
          // Een verlopen of mislukt token is onbruikbaar: leeg het, zodat de
          // verzendknop weer op slot gaat tot Turnstile een nieuw token geeft.
          "expired-callback": () => callbacks.current.onVerify(""),
          "timeout-callback": () => callbacks.current.onVerify(""),
          // Client-side fouten (bv. 600010) laten de widget anders doodlopen
          // tot de bezoeker de pagina ververst. Reset 'm automatisch een paar
          // keer met een korte pauze — dat is Cloudflares eigen retry-methode —
          // zodat een tijdelijke fout vanzelf herstelt. Begrensd tegen loops.
          "error-callback": () => {
            callbacks.current.onVerify("");
            callbacks.current.onError?.();

            if (autoRetriesRef.current >= 3) {
              // Opgegeven: laat Cloudflare de fout loggen en de foutstaat tonen.
              return false;
            }

            autoRetriesRef.current += 1;
            retryTimerRef.current = setTimeout(resetWidget, 2000);
            // We hebben de fout afgehandeld; Cloudflare hoeft niets extra's te doen.
            return true;
          },
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError?.();
      });

    return () => {
      cancelled = true;

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

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
