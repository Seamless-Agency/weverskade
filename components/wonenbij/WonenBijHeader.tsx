"use client";

import { usePageNavigation } from "@/hooks/usePageNavigation";
import { PijlIcon } from "@/components/wonenbij/icons";

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
 */
export default function WonenBijHeader({
  variant = "donker",
  anchors,
  ctaLabel,
  ctaHref,
  ctaArrow = false,
}: WonenBijHeaderProps) {
  const navigate = usePageNavigation();
  const textColor = variant === "licht" ? "text-off-white" : "text-off-black";

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
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
    <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-[2.431vw] max-md:px-5 max-md:pt-5 max-md:items-center">
      <a
        href="/wonenbij"
        onClick={(e) => navigate(e, "/wonenbij")}
        className={`${metNav ? "mt-[2.431vw]" : metTerug ? "mt-[2.847vw]" : "mt-[4.097vw]"} font-body font-medium text-[2.5vw] leading-[2.9vw] tracking-[-0.05vw] no-underline ${textColor} max-md:mt-0 max-md:text-[22px] max-md:leading-none`}
      >
        Wonen bij Weverskade
      </a>

      <div
        className={`${metNav ? "mt-[2.778vw]" : metTerug ? "mt-[2.847vw]" : "mt-[5.069vw]"} flex items-center gap-[3.472vw] max-md:mt-0`}
      >
        {metNav ? (
          <nav className="flex items-center gap-[3.472vw] max-lg:hidden">
            {anchors!.map((anchor) => (
              <a
                key={anchor.label}
                href={anchor.href}
                onClick={(e) => handleAnchor(e, anchor.href)}
                className={`font-body font-medium text-[1.111vw] leading-[1.292vw] no-underline ${textColor} hover:opacity-70 transition-opacity duration-200`}
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
            className={`flex items-center bg-green text-off-white no-underline rounded-full ${
              metTerug
                ? "h-[3.194vw] gap-[1.319vw] pl-[1.111vw] pr-[1.736vw]"
                : `h-[2.847vw] gap-[0.694vw] ${metNav ? "pl-[2.014vw] pr-[1.806vw]" : "px-[1.597vw]"}`
            } max-md:h-auto max-md:px-4 max-md:py-2`}
          >
            {ctaArrow ? (
              <PijlIcon className="w-[1.528vw] h-auto rotate-180 max-md:w-[16px]" />
            ) : null}
            <span
              className={
                metTerug
                  ? "font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-md:text-[13px] max-md:leading-none"
                  : "font-body font-medium text-[0.903vw] leading-[1.047vw] max-md:text-[13px] max-md:leading-none"
              }
            >
              {ctaLabel}
            </span>
          </a>
        ) : null}
      </div>
    </header>
  );
}
