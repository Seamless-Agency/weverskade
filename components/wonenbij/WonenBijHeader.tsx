"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePageNavigation } from "@/hooks/usePageNavigation";
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

/**
 * Vaste kop van de wonen-bij omgeving: wordmark links, optionele ankerlinks
 * in het midden en een groene pill rechts. Absoluut over de hero heen.
 * Onder lg vervangen een menu-knop + overlay de ankerlinks.
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
  const textColor = variant === "licht" ? "text-off-white" : "text-off-black";

  // Entrance: wordmark, links en pill zakken gestaffeld in beeld zodra de
  // hero-intro start (na de page transition, of kort na een directe load).
  const intro = useHeroIntro();
  const reduced = useReducedMotion();
  const introStyle = (delay: number): CSSProperties => ({
    opacity: intro ? 1 : 0,
    transform: intro ? "translateY(0)" : "translateY(-12px)",
    transition:
      intro && !reduced
        ? `opacity 0.8s ${EASE} ${delay}s, transform 0.8s ${EASE} ${delay}s`
        : "none",
  });

  // Open menu: pagina-scroll bevriezen en met Escape kunnen sluiten.
  useEffect(() => {
    if (!menuOpen) return;
    const vorige = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const opToets = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", opToets);
    return () => {
      document.documentElement.style.overflow = vorige;
      window.removeEventListener("keydown", opToets);
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
  // 46 hoog met ABC Arizona 17px.
  const metNav = Boolean(anchors && anchors.length > 0);
  const metTerug = ctaArrow && !metNav;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-[2.431vw] max-lg:px-5 max-lg:pt-5 max-lg:items-center max-lg:gap-3">
      <a
        href="/wonenbij"
        onClick={(e) => navigate(e, "/wonenbij")}
        style={introStyle(0.05)}
        className={`${metNav ? "mt-[2.431vw]" : metTerug ? "mt-[2.847vw]" : "mt-[4.097vw]"} font-body font-medium text-[2.5vw] leading-[2.9vw] tracking-[-0.05vw] whitespace-nowrap no-underline ${textColor} max-lg:mt-0 max-lg:text-[15px] max-lg:leading-none`}
      >
        Wonen bij Weverskade
      </a>

      <div
        className={`${metNav ? "mt-[2.778vw]" : metTerug ? "mt-[2.847vw]" : "mt-[5.069vw]"} flex items-center gap-[3.472vw] max-lg:mt-0 max-lg:gap-2`}
      >
        {metNav ? (
          <nav className="flex items-center gap-[3.472vw] max-lg:hidden">
            {anchors!.map((anchor, i) => (
              <a
                key={anchor.label}
                href={anchor.href}
                onClick={(e) => handleAnchor(e, anchor.href)}
                style={introStyle(0.15 + i * 0.05)}
                className={`font-body font-medium text-[1.111vw] leading-[1.292vw] link-underline-hover ${textColor}`}
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
            style={introStyle(metNav ? 0.15 + anchors!.length * 0.05 : 0.2)}
            className={`pill-hover flex items-center bg-green text-off-white no-underline rounded-full ${
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
            className={`hidden max-lg:flex items-center justify-center size-11 rounded-full border-none cursor-pointer ${
              variant === "licht"
                ? "bg-off-white/20 text-off-white"
                : "bg-off-black/10 text-off-black"
            }`}
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

      {/* Fullscreen ankermenu (tablet/mobiel) */}
      {metNav && menuOpen ? (
        <div className="fixed inset-0 z-50 bg-off-black text-off-white overflow-y-auto lg:hidden menu-overlay-in">
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="font-body font-medium text-[17px] leading-none">
              Wonen bij Weverskade
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Menu sluiten"
              autoFocus
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
    </header>
  );
}
