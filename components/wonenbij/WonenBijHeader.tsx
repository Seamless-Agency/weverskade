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

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-[2.431vw] max-md:px-5 max-md:pt-5 max-md:items-center">
      <a
        href="/wonenbij"
        onClick={(e) => navigate(e, "/wonenbij")}
        className={`mt-[4.097vw] font-body font-medium text-[2.5vw] leading-[2.9vw] tracking-[-0.05vw] no-underline ${textColor} max-md:mt-0 max-md:text-[22px] max-md:leading-none`}
      >
        Wonen bij Weverskade
      </a>

      {anchors && anchors.length > 0 ? (
        <nav className="absolute left-1/2 -translate-x-1/2 mt-[5.069vw] h-[2.847vw] flex items-center gap-[1.667vw] max-lg:hidden">
          {anchors.map((anchor) => (
            <a
              key={anchor.label}
              href={anchor.href}
              onClick={(e) => handleAnchor(e, anchor.href)}
              className={`font-body font-medium text-[1.111vw] no-underline ${textColor} hover:opacity-70 transition-opacity duration-200`}
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
          className="mt-[5.069vw] flex items-center gap-[0.694vw] bg-green text-off-white no-underline rounded-full h-[2.847vw] px-[1.597vw] max-md:mt-0 max-md:h-auto max-md:px-4 max-md:py-2"
        >
          {ctaArrow ? (
            <PijlIcon className="w-[1.528vw] h-auto rotate-180 max-md:w-[16px]" />
          ) : null}
          <span className="font-body font-medium text-[0.903vw] leading-[1.047vw] max-md:text-[13px] max-md:leading-none">
            {ctaLabel}
          </span>
        </a>
      ) : null}
    </header>
  );
}
