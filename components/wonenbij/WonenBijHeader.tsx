"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { PijlIcon } from "@/components/wonenbij/icons";
import { EASE, useHeroIntro, useReducedMotion } from "@/components/wonenbij/motion";

interface AnchorLink {
  label: string;
  href: string;
}

interface WonenBijHeaderProps {
  /** "licht" = witte tekst (op foto/hero), "donker" = off-black tekst. */
  variant?: "licht" | "donker";
  /** Ankerlinks in het midden (projectpagina). */
  anchors?: AnchorLink[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Pijl links in de knop ("Terug naar overzicht"). */
  ctaArrow?: boolean;
}

/* ─── Kleurthema's per sectie ─────────────────────────────────────────────
   Zelfde mechaniek als de hoofdnavigatie: secties dragen `data-nav-theme`,
   de kop neemt de kleur over van de sectie die onder hem ligt. "dark" is
   de hero: transparant met witte tekst. */
type Thema = "dark" | "light" | "white" | "green" | "blue";

const THEMAS: Record<Thema, { bg: string; tekst: string }> = {
  dark: { bg: "transparent", tekst: "#F7F5F0" },
  light: { bg: "#F7F5F0", tekst: "#1D1F1A" },
  white: { bg: "#FFFFFF", tekst: "#1D1F1A" },
  green: { bg: "#848F71", tekst: "#F7F5F0" },
  blue: { bg: "#717F8B", tekst: "#F7F5F0" },
};

function isThema(waarde: string | undefined): waarde is Thema {
  return waarde !== undefined && waarde in THEMAS;
}

function detecteerThema(grens: number, fallback: Thema): Thema {
  const secties = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
  let huidig = fallback;
  for (const sectie of secties) {
    if (sectie.getBoundingClientRect().top <= grens) {
      const thema = sectie.dataset.navTheme;
      if (isThema(thema)) huidig = thema;
    }
  }
  return huidig;
}

/**
 * Vaste kop van de wonen-bij omgeving: wordmark links, optionele ankerlinks
 * in het midden en een groene pill rechts. Bovenaan ligt hij over de hero
 * heen; daarna gedraagt hij zich als de hoofdnavigatie: hij schuift uit
 * beeld bij omlaag scrollen en komt terug zodra je omhoog scrolt, in de
 * kleur van de sectie waar je bent. Onder lg vervangen een menu-knop +
 * overlay de ankerlinks.
 */
export default function WonenBijHeader({
  variant = "donker",
  anchors,
  ctaLabel,
  ctaHref,
  ctaArrow = false,
}: WonenBijHeaderProps) {
  const navigate = usePageNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const kopRef = useRef<HTMLElement>(null);

  // Entrance: wordmark, links en pill zakken gestaffeld in beeld zodra de
  // hero-intro start (na de page transition, of kort na een directe load).
  const intro = useHeroIntro();
  const reduced = useReducedMotion();
  const introTransition = (delay: number) =>
    `opacity 0.8s ${EASE} ${delay}s, transform 0.8s ${EASE} ${delay}s`;
  const introStyle = (delay: number, extra = ""): CSSProperties => ({
    opacity: intro ? 1 : 0,
    transform: intro ? "translateY(0)" : "translateY(-12px)",
    transition:
      intro && !reduced ? `${introTransition(delay)}${extra}` : "none",
  });

  // ─── Scrollgedrag: verbergen bij omlaag, tonen bij omhoog ───
  // Het thema volgt de sectie onder de kop; "compact" (kleinere marges +
  // achtergrond) zodra de kop buiten zijn hero-positie terugkomt.
  const startThema: Thema = variant === "licht" ? "dark" : "light";
  const [zichtbaar, setZichtbaar] = useState(true);
  const [thema, setThema] = useState<Thema>(startThema);
  const [compact, setCompact] = useState(false);
  const vorigeY = useRef(0);

  // Direct op het scroll-event (zoals de hoofdnavigatie): React batcht de
  // setStates, en de thema-detectie is een handvol getBoundingClientRects.
  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const delta = y - vorigeY.current;
      if (y <= 0) {
        setZichtbaar(true);
      } else if (Math.abs(delta) > 5) {
        setZichtbaar(delta < 0);
      }
      vorigeY.current = y;

      const grens = (kopRef.current?.offsetHeight ?? 80) / 2;
      const nieuw = detecteerThema(grens, startThema);
      setThema(nieuw);
      setCompact(y > 40 && nieuw !== "dark");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [startThema]);

  // Open menu: pagina-scroll bevriezen; Escape, focus-trap en focus-restore
  // komen uit useFocusTrap.
  const menuRef = useFocusTrap<HTMLDivElement>(menuOpen, () =>
    setMenuOpen(false)
  );
  useEffect(() => {
    if (!menuOpen) return;
    const vorige = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = vorige;
    };
  }, [menuOpen]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMenuOpen(false);
      document
        .getElementById(href.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(e, href);
  };

  // Met ankerlinks (projectpagina) staat de kop hoger (wordmark op 35px, rij op
  // 40px) en hangen de links rechts vóór de pill met vaste 50px-tussenruimtes.
  // Met terugpijl (woningpagina) staan wordmark én pill op 41px en is de pill
  // 46 hoog met ABC Arizona 17px. Compact (teruggekeerd na scrollen) staat
  // alles op 20px met evenveel ruimte eronder; de rij-offset blijft gelijk.
  const metNav = Boolean(anchors && anchors.length > 0);
  const metTerug = ctaArrow && !metNav;
  const kopBoven = metNav ? "2.431vw" : metTerug ? "2.847vw" : "4.097vw";
  const rijOffset = metNav ? "mt-[0.347vw]" : metTerug ? "mt-0" : "mt-[0.972vw]";

  const { bg, tekst } = THEMAS[thema];
  const isVisible = zichtbaar || menuOpen;
  // Op de groene band zou een groene pill wegvallen: daar wordt hij off-white.
  const pillLicht = thema === "green";
  const pillKleur = pillLicht
    ? "bg-off-white text-off-black"
    : "bg-green text-off-white";

  return (
    <>
      <header
        ref={kopRef}
        className="fixed top-0 left-0 right-0 z-20"
        style={{
          color: tekst,
          transform: isVisible ? "none" : "translateY(-100%)",
          transition: `transform 0.5s ${EASE}, color 0.3s ease`,
        }}
      >
        {/* Achtergrond in de sectiekleur; onzichtbaar over de hero. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundColor: bg,
            opacity: thema === "dark" ? 0 : 1,
            transition: "opacity 0.3s ease, background-color 0.3s ease",
          }}
        />
        <div
          className="relative flex items-start justify-between px-[2.431vw] pt-[var(--kop-boven)] pb-[var(--kop-onder)] transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-lg:px-5 max-lg:pt-5 max-lg:pb-[var(--kop-onder-m)] max-lg:items-center max-lg:gap-3"
          style={
            {
              "--kop-boven": compact ? "1.389vw" : kopBoven,
              "--kop-onder": compact ? "1.389vw" : "0px",
              "--kop-onder-m": compact ? "20px" : "0px",
            } as CSSProperties
          }
        >
          <a
            href="/wonenbij"
            onClick={(e) => navigate(e, "/wonenbij")}
            style={introStyle(0.05)}
            className="font-body font-medium text-[2.5vw] leading-[2.9vw] tracking-[-0.05vw] whitespace-nowrap no-underline max-lg:text-[15px] max-lg:leading-none"
          >
            Wonen bij Weverskade
          </a>

          <div
            className={`${rijOffset} flex items-center gap-[3.472vw] max-lg:mt-0 max-lg:gap-2`}
          >
            {metNav ? (
              <nav className="flex items-center gap-[3.472vw] max-lg:hidden">
                {anchors!.map((anchor, i) => (
                  <a
                    key={anchor.label}
                    href={anchor.href}
                    onClick={(e) => handleAnchor(e, anchor.href)}
                    style={introStyle(0.15 + i * 0.05)}
                    className="font-body font-medium text-[1.111vw] leading-[1.292vw] link-underline-hover"
                  >
                    {anchor.label}
                  </a>
                ))}
              </nav>
            ) : null}

            {ctaLabel && ctaHref ? (
              <a
                href={ctaHref}
                onClick={(e) => handleAnchor(e, ctaHref)}
                style={introStyle(
                  metNav ? 0.15 + anchors!.length * 0.05 : 0.2,
                  ", background-color 0.3s ease, color 0.3s ease"
                )}
                className={`pill-hover flex items-center no-underline rounded-full ${pillKleur} ${
                  metTerug
                    ? "h-[3.194vw] gap-[1.319vw] pl-[1.111vw] pr-[1.736vw]"
                    : `h-[2.847vw] gap-[0.694vw] ${metNav ? "pl-[2.014vw] pr-[1.806vw]" : "px-[1.597vw]"}`
                } max-lg:h-11 max-lg:px-3 max-lg:py-0`}
              >
                {ctaArrow ? (
                  <PijlIcon className="w-[1.528vw] h-auto rotate-180 max-lg:w-[16px]" />
                ) : null}
                <span
                  className={`whitespace-nowrap ${
                    metTerug
                      ? "font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:text-[13px] max-lg:leading-none"
                      : "font-body font-medium text-[0.903vw] leading-[1.047vw] max-lg:text-[13px] max-lg:leading-none"
                  }`}
                >
                  {metTerug ? (
                    <>
                      <span className="max-lg:hidden">{ctaLabel}</span>
                      <span className="hidden max-lg:inline">Terug</span>
                    </>
                  ) : (
                    ctaLabel
                  )}
                </span>
              </a>
            ) : null}

            {/* Menu-knop voor de ankerlinks op tablet/mobiel */}
            {metNav ? (
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Menu openen"
                aria-expanded={menuOpen}
                style={introStyle(0.25)}
                className="hidden max-lg:flex items-center justify-center size-11 rounded-full border-none cursor-pointer bg-current/15 text-current"
              >
                <svg viewBox="0 0 18 12" className="w-[18px] h-auto" aria-hidden>
                  <path
                    d="M0 1h18M0 6h18M0 11h18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Fullscreen ankermenu (tablet/mobiel). Buiten de <header>: die heeft
          een transform en zou anders het containing block van deze
          fixed overlay worden. */}
      {metNav && menuOpen ? (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 bg-off-black text-off-white overflow-y-auto lg:hidden menu-overlay-in"
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="font-body font-medium text-[17px] leading-none">
              Wonen bij Weverskade
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Menu sluiten"
              className="flex items-center justify-center size-11 rounded-full bg-off-white/15 text-off-white border-none cursor-pointer"
            >
              <svg viewBox="0 0 14 14" className="w-[14px] h-auto" aria-hidden>
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 pt-12 pb-8">
            {anchors!.map((anchor, i) => (
              <a
                key={anchor.label}
                href={anchor.href}
                onClick={(e) => handleAnchor(e, anchor.href)}
                style={{ "--menu-delay": `${0.1 + i * 0.05}s` } as CSSProperties}
                className="py-3 font-heading font-normal text-[28px] leading-[34px] tracking-[-0.56px] text-off-white no-underline border-b border-off-white/15 menu-item-in"
              >
                {anchor.label}
              </a>
            ))}
            {ctaLabel && ctaHref ? (
              <a
                href={ctaHref}
                onClick={(e) => handleAnchor(e, ctaHref)}
                style={
                  {
                    "--menu-delay": `${0.1 + anchors!.length * 0.05 + 0.1}s`,
                  } as CSSProperties
                }
                className="mt-8 inline-flex items-center justify-center self-start h-11 px-6 bg-green text-off-white rounded-full font-body font-medium text-[15px] no-underline menu-item-in"
              >
                {ctaLabel}
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  );
}
