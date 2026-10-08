"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Zo lang moet de hover op hetzelfde type blijven voordat er gescrold wordt. */
const DEBOUNCE_MS = 180;
/** Zo lang na eigen wheel/touch/toets-scrollen van de bezoeker doen we niets. */
const GEBRUIKER_SCROLLT_MS = 600;
/** Ruimte tussen kaart en schermrand na het scrollen. */
const MARGE_PX = 24;
/** Een kaart die voor minstens dit deel zichtbaar is, telt als "in beeld". */
const ZICHTBAAR_DREMPEL = 0.9;
/** Alleen desktop met een echte muis; mobiel en touch blijven ongemoeid. */
const DESKTOP_QUERY = "(min-width: 1024px) and (hover: hover)";

const SCROLL_TOETSEN = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

/**
 * Hover op de gevel licht de bijbehorende typekaart links op; staat die kaart
 * buiten beeld, dan scrollt de pagina minimaal tot hij net in beeld is.
 *
 * De lijst staat in de gewone paginaflow en het gevelpaneel plakt (sticky)
 * ernaast. We scrollen daarom alleen binnen het bereik waarin het paneel
 * plakt: de gevel blijft dan pixel-voor-pixel onder de muis staan, alleen de
 * lijst schuift eronder door. Zou het paneel mee moeten bewegen, dan scrollen
 * we niet (de muis zou anders op een andere woning landen en de hover
 * verspringen).
 */
export function useGevelKaartInBeeld({
  type,
  kaartRefs,
  paneelRef,
}: {
  /** Het type onder de muis op de gevel (of null). */
  type: string | null;
  /** Typenaam -> kaart-element in de lijst. */
  kaartRefs: RefObject<Map<string, HTMLElement>>;
  /** Het sticky gevelpaneel. */
  paneelRef: RefObject<HTMLElement | null>;
}) {
  const laatsteGebruikerScroll = useRef(0);
  const laatsteAutoType = useRef<string | null>(null);

  // Eigen scrollen van de bezoeker gaat altijd voor.
  useEffect(() => {
    const markeer = () => {
      laatsteGebruikerScroll.current = performance.now();
      laatsteAutoType.current = null;
    };
    const opToets = (e: KeyboardEvent) => {
      if (SCROLL_TOETSEN.has(e.key)) markeer();
    };
    window.addEventListener("wheel", markeer, { passive: true });
    window.addEventListener("touchmove", markeer, { passive: true });
    window.addEventListener("keydown", opToets);
    return () => {
      window.removeEventListener("wheel", markeer);
      window.removeEventListener("touchmove", markeer);
      window.removeEventListener("keydown", opToets);
    };
  }, []);

  useEffect(() => {
    // Geen type: de muis zit tussen twee vlakken of heeft de gevel verlaten.
    // Kort ertussen houdt laatsteAutoType vast (het volgende vlak van
    // hetzelfde type scrollt niet opnieuw); pas na een echte pauze vergeten.
    if (!type) {
      const vergeet = window.setTimeout(() => {
        laatsteAutoType.current = null;
      }, GEBRUIKER_SCROLLT_MS);
      return () => window.clearTimeout(vergeet);
    }
    if (type === laatsteAutoType.current) return;
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const timer = window.setTimeout(() => {
      if (
        performance.now() - laatsteGebruikerScroll.current <
        GEBRUIKER_SCROLLT_MS
      ) {
        return;
      }
      const kaart = kaartRefs.current.get(type);
      const paneel = paneelRef.current;
      const kolom = paneel?.parentElement;
      if (!kaart || !paneel || !kolom) return;

      const vh = window.innerHeight;
      const kop = document.querySelector<HTMLElement>("header");
      const kopOnder = Math.max(0, kop?.getBoundingClientRect().bottom ?? 0);
      const k = kaart.getBoundingClientRect();

      // Al (bijna) volledig zichtbaar? Dan niets doen.
      const zichtbaar =
        Math.max(0, Math.min(k.bottom, vh) - Math.max(k.top, kopOnder)) /
        k.height;
      laatsteAutoType.current = type;
      if (zichtbaar >= ZICHTBAAR_DREMPEL) return;

      // Minimale verschuiving ("nearest"). Omhoog scrollen haalt de kop
      // terug, dus dan reserveren we zijn hoogte boven de kaart.
      let delta: number;
      if (k.top < kopOnder + MARGE_PX) {
        delta = k.top - ((kop?.offsetHeight ?? 0) + MARGE_PX);
      } else {
        delta = k.bottom - (vh - MARGE_PX);
      }

      // Alleen scrollen zolang het paneel blijft plakken.
      const p = paneel.getBoundingClientRect();
      const c = kolom.getBoundingClientRect();
      const plakTop = parseFloat(getComputedStyle(paneel).top);
      if (!Number.isFinite(plakTop) || Math.abs(p.top - plakTop) > 1) return;
      const min = Math.min(0, c.top - plakTop);
      const max = Math.max(0, c.bottom - p.height - plakTop);
      delta = Math.round(Math.min(max, Math.max(min, delta)));
      if (Math.abs(delta) < 2) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollBy({ top: delta, behavior: reduce ? "instant" : "smooth" });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [type, kaartRefs, paneelRef]);
}
