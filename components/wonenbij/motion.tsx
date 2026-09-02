"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type AllHTMLAttributes,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { useInView } from "@/hooks/useInView";

/* ─── Motion-taal van de wonen-bij omgeving ──────────────────────────────
   Gebaseerd op het Seamless/Waterloo House-vocabulaire (line-mask reveals,
   scale-settle op beeld, fade-ups ≤30px, stagger 75ms, triggers op ~90%
   viewport, altijd once) maar met de huis-easing van deze codebase:
   expo-out (0.16, 1, 0.3, 1) — dezelfde curve als de hero en de accordions.

   Alles is transform/opacity/clip-path: layout (en dus pixel perfect)
   blijft onaangetast, en `prefers-reduced-motion` schakelt alles uit via
   useInView / de checks hieronder.

   Ritme: niet elke sectie animeert in. Secties binnen <Statisch> staan
   direct in hun eindstand, zodat de reveals eromheen weer opvallen. */

export const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Standaard stagger tussen woorden/regels/kaarten (Waterloo: 75ms). */
export const STAGGER = 0.075;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ─── Reduced motion als reactieve waarde ─────────────────────────────────
   Bij `reduce` staat alles direct in de eindstand zonder transitie —
   ook voor reveals die via useInView (die dan meteen `true` geeft) lopen. */
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false
  );
}

/* ─── Hero-choreografie ───────────────────────────────────────────────────
   Zelfde afspraken als components/Hero.tsx: na een page transition wacht de
   intro 550ms (tot de curtain grotendeels staat), bij directe load 350ms. */
export function useHeroIntro(): boolean {
  const reduced = useReducedMotion();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const delay = window.__pageTransitioning ? 550 : 350;
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, []);

  return animate || reduced;
}

/* ─── Statisch: een sectie zonder scroll-reveal ──────────────────────────
   Alle Reveal-varianten binnen deze wrapper staan vanaf de eerste render
   in hun eindstand, zonder observer en zonder transitie. Bewust ingezet
   op een paar secties per pagina zodat de pagina niet overal "in-fadet"
   en er rust en variatie ontstaat. */
const StatischContext = createContext(false);

export function Statisch({ children }: { children: ReactNode }) {
  return (
    <StatischContext.Provider value={true}>{children}</StatischContext.Provider>
  );
}

/* ─── Groepscontext voor gestaffelde reveals ─────────────────────────────
   Eén observer op de container; kinderen lezen `inView` + hun eigen delay,
   zodat een grid of rij als één choreografie binnenkomt. */
const RevealGroupContext = createContext<boolean | null>(null);

export function useRevealGroup(): boolean | null {
  return useContext(RevealGroupContext);
}

export function RevealGroup({
  className,
  children,
  as: Tag = "div",
  ...rest
}: {
  className?: string;
  children: ReactNode;
  as?: ElementType;
} & Omit<AllHTMLAttributes<HTMLElement>, "as" | "children" | "className">) {
  const statisch = useContext(StatischContext);
  const [ref, inView] = useInView<HTMLDivElement>({ startWhen: !statisch });
  return (
    <RevealGroupContext.Provider value={statisch || inView}>
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    </RevealGroupContext.Provider>
  );
}

/* ─── Reveal: fade-up voor blokken en bodytekst ─────────────────────────── */
export function Reveal({
  children,
  className,
  style,
  as: Tag = "div",
  delay = 0,
  duration = 0.9,
  y = 24,
  when,
  ...rest
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  delay?: number;
  duration?: number;
  /** Startafstand in px (transform, raakt de layout niet). */
  y?: number;
  /** Expliciete trigger (bv. hero-intro); zonder deze prop observeert het blok zichzelf of volgt het zijn RevealGroup. */
  when?: boolean;
} & Omit<AllHTMLAttributes<HTMLElement>, "as" | "children" | "className" | "style">) {
  const group = useContext(RevealGroupContext);
  const statisch = useContext(StatischContext);
  const reduced = useReducedMotion();
  const [ref, ownInView] = useInView<HTMLDivElement>({
    startWhen: when === undefined && group === null && !statisch,
  });
  const on = reduced || statisch || (when ?? group ?? ownInView);
  const animeert = on && !reduced && !statisch;

  // Na de reveal verdwijnt de inline transition weer: een blijvende inline
  // `transition` zou de hover-transities uit CSS (bv. de pill-knoppen) op
  // hetzelfde element overschrijven en die hovers abrupt maken.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!animeert) return;
    const timer = setTimeout(
      () => setSettled(true),
      (delay + duration) * 1000 + 80
    );
    return () => clearTimeout(timer);
  }, [animeert, delay, duration]);

  return (
    <Tag
      ref={ref}
      className={className}
      {...rest}
      style={{
        ...style,
        opacity: on ? 1 : 0,
        // "none" i.p.v. translateY(0) als eindtoestand: een blijvende
        // (identity-)transform maakt de Reveal het containing block voor
        // position:sticky-kinderen, waardoor het woningzoeker-paneel niet
        // meer plakt. De overgang animeert identiek (none == identity).
        transform: on ? "none" : `translateY(${y}px)`,
        transition:
          animeert && !settled
            ? `opacity ${duration}s ${EASE} ${delay}s, transform ${duration}s ${EASE} ${delay}s`
            : undefined,
        willChange: on ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/* ─── RevealWords: gemaskeerde woord-reveal voor koppen en statements ─────
   Het signatuurpatroon van de referenties én de hero van de hoofdsite:
   elk woord schuift uit een overflow-hidden masker omhoog (y 115% → 0).
   Respecteert regeleinden (\n) in CMS-tekst met whitespace-pre-line. */
export function RevealWords({
  text,
  when,
  delay = 0,
  stagger = STAGGER,
  duration = 0.9,
}: {
  text: string;
  /** Expliciete trigger; zonder deze prop wordt de dichtstbijzijnde RevealGroup of een eigen observer gebruikt. */
  when?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
}) {
  const group = useContext(RevealGroupContext);
  const statisch = useContext(StatischContext);
  const reduced = useReducedMotion();
  const [ref, ownInView] = useInView<HTMLSpanElement>({
    startWhen: when === undefined && group === null && !statisch,
  });
  const on = reduced || statisch || (when ?? group ?? ownInView);
  const animeert = on && !reduced && !statisch;

  let wordIndex = 0;
  const lines = text.split("\n");

  return (
    <span ref={ref}>
      {lines.map((line, li) => (
        <span key={li}>
          {line
            .split(/[^\S\n]+/)
            .filter(Boolean)
            .map((word, wi, arr) => {
              const i = wordIndex++;
              return (
                <span key={wi}>
                  {/* pb/-mb: ruimte voor descenders binnen het masker.
                      indent-0: text-indent van de parent (bv. het statement)
                      is erfelijk en zou anders in élk inline-block masker
                      opnieuw toegepast worden. */}
                  <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] indent-0">
                    <span
                      className="inline-block will-change-transform"
                      style={{
                        transform: on ? "translateY(0)" : "translateY(115%)",
                        transition: animeert
                          ? `transform ${duration}s ${EASE} ${delay + i * stagger}s`
                          : "none",
                      }}
                    >
                      {word}
                    </span>
                  </span>
                  {wi < arr.length - 1 ? " " : ""}
                </span>
              );
            })}
          {li < lines.length - 1 ? "\n" : ""}
        </span>
      ))}
    </span>
  );
}

/* ─── RevealMedia: clip-gordijn voor foto's ───────────────────────────────
   De foto onthult zich van onder naar boven (inset(100% 0 0 0) → inset(0),
   dezelfde richting als de tekst-reveals) terwijl het beeld erin zachtjes
   uitzoomt van 1.15 → 1. Gebruik als vervanger van de bestaande
   foto-container: geef de layout-classes (aspect, overflow-hidden,
   absolute posities) aan `className`; kinderen zijn fill-images. */
export function RevealMedia({
  children,
  className,
  style,
  delay = 0,
  duration = 1.2,
  when,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  when?: boolean;
} & Omit<AllHTMLAttributes<HTMLDivElement>, "as" | "children" | "className" | "style">) {
  const group = useContext(RevealGroupContext);
  const statisch = useContext(StatischContext);
  const reduced = useReducedMotion();
  const [ref, ownInView] = useInView<HTMLDivElement>({
    startWhen: when === undefined && group === null && !statisch,
  });
  const on = reduced || statisch || (when ?? group ?? ownInView);
  const animeert = on && !reduced && !statisch;

  // De clip zit op een binnenlaag, niet op de geobserveerde container:
  // Chrome telt clip-path mee in IntersectionObserver, dus een volledig
  // dichtgeklapte container zou zijn eigen observer nooit triggeren.
  return (
    <div ref={ref} className={className} style={style} {...rest}>
      <div
        className="absolute inset-0"
        style={{
          clipPath: on ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
          transition: animeert ? `clip-path ${duration}s ${EASE} ${delay}s` : "none",
          willChange: on ? undefined : "clip-path",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: on ? "scale(1)" : "scale(1.15)",
            transition: animeert
              ? `transform ${duration + 0.7}s ${EASE} ${delay}s`
              : "none",
            willChange: on ? undefined : "transform",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── RevealLine: hairline die zichzelf tekent ────────────────────────────
   Vervanger voor border-t/-b op rijen (nieuws, FAQ, accordions, planning).
   Absoluut gepositioneerd zodat de rij-layout identiek blijft; geef de
   positie- en kleurclasses zelf mee. axis "x" tekent van links naar rechts
   (origin-left), axis "y" van boven naar beneden (origin-top). */
export function RevealLine({
  className = "absolute inset-x-0 top-0 h-px bg-off-black/40",
  axis = "x",
  delay = 0,
  duration = 1.1,
}: {
  className?: string;
  axis?: "x" | "y";
  delay?: number;
  duration?: number;
}) {
  const group = useContext(RevealGroupContext);
  const statisch = useContext(StatischContext);
  const reduced = useReducedMotion();
  const [ref, ownInView] = useInView<HTMLSpanElement>({
    startWhen: group === null && !statisch,
  });
  const on = reduced || statisch || (group ?? ownInView);
  const animeert = on && !reduced && !statisch;

  return (
    <span
      ref={ref}
      aria-hidden
      className={`${axis === "x" ? "origin-left" : "origin-top"} ${className}`}
      style={{
        transform: on ? "scale(1)" : axis === "x" ? "scaleX(0)" : "scaleY(0)",
        transition: animeert ? `transform ${duration}s ${EASE} ${delay}s` : "none",
      }}
    />
  );
}

/* ─── Parallax: subtiele dieptelaag voor grote fotovlakken ────────────────
   De binnenlaag is 12% hoger dan de container en schuift op scroll ±6%
   (Waterloo: yPercent −10 → +10). Alleen transform, één rAF per frame,
   en uit bij reduced motion. Nest 'm ín een RevealMedia of foto-container. */
export function Parallax({
  children,
  className = "absolute inset-0",
  strength = 0.06,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const layer = layerRef.current;
    if (!wrap || !layer || prefersReducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      // -1 (net onder beeld) … 1 (net boven beeld)
      const progress =
        (rect.top + rect.height / 2 - vh / 2) / ((vh + rect.height) / 2);
      layer.style.transform = `translateY(${(-progress * strength * 100).toFixed(3)}%)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={wrapRef} className={className}>
      <div
        ref={layerRef}
        className="absolute left-0 right-0 will-change-transform"
        style={{ top: "-6%", bottom: "-6%" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── HeroParallax: de herofoto zakt mee tijdens het scrollen ────────────
   De foto schuift met `strength` × de scrollafstand omlaag, zodat de
   pagina sneller omhoog beweegt dan het beeld en de hero diepte krijgt
   onder de sectie die eroverheen schuift. Alleen transform, één rAF per
   frame, stopt zodra de hero uit beeld is en staat uit bij reduced motion.
   Plaats 'm als laag ín de hero (binnen de zoom-out laag). */
export function HeroParallax({
  children,
  strength = 0.3,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Math.max: iOS rubber-band geeft een negatieve scrollY.
      const y = Math.max(0, window.scrollY);
      if (y > window.innerHeight * 1.2) return;
      el.style.transform = `translate3d(0, ${(y * strength).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      {children}
    </div>
  );
}
