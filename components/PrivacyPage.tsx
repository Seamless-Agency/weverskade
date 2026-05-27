"use client";

import { useEffect, useState } from "react";
import LineSplit from "@/components/LineSplit";
import ScrollHeroLineSplit from "@/components/ScrollHeroLineSplit";
import { useInView } from "@/hooks/useInView";

/**
 * Privacybeleid (privacy policy) page — static Dutch content, rendered with
 * the same hero/typography rhythm as ContactPage so it reads as part of the
 * same design system. All body content uses the same per-line mask-slide
 * reveal as the hero intro so the whole page animates with one visual idiom.
 */
export default function PrivacyPage() {
  const [animate, setAnimate] = useState(false);
  /**
   * Flips true once the hero H1 + intro paragraph reveal should be done.
   * Scroll-triggered body reveals wait on this so a section that happens
   * to be above the fold (tall desktops) can't start before the intro
   * finishes. Sections below the fold aren't affected because by the time
   * the user scrolls to them, bodyReady is long since true.
   */
  const [bodyReady, setBodyReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(true);
      setBodyReady(true);
      return;
    }

    if (window.__pageTransitioning) {
      const timer = setTimeout(() => setAnimate(true), 550);
      return () => clearTimeout(timer);
    }

    let rafOuter = 0;
    let rafInner = 0;
    rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
    };
  }, []);

  // Release body reveals ~1.5s after the hero starts animating — long enough
  // for the intro LineSplit (≈1.3s for 4 lines) to finish.
  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setBodyReady(true), 1500);
    return () => clearTimeout(timer);
  }, [animate]);

  return (
    <section className="bg-off-white min-h-screen">
      {/* Hero title */}
      <div className="pt-[24.375vw] pl-[2.431vw] pr-[2.431vw] max-md:pt-[28vw] max-md:px-5">
        <div className="overflow-hidden">
          <h1
            className="font-heading font-normal text-[5.556vw] leading-[1.05] tracking-[-0.111vw] text-off-black max-md:text-[40px] max-md:leading-[42px] max-md:tracking-[-0.8px] will-change-transform"
            style={{
              transform: animate ? "translateY(0)" : "translateY(110%)",
              transition: animate
                ? "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s"
                : "none",
            }}
          >
            Privacybeleid
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="px-[2.431vw] mt-[6.25vw] pb-[16.875vw] max-md:px-5 max-md:mt-10 max-md:pb-20">
        {/* Content column: left edge aligns with the H1 above. Capped width on
            desktop for readability, full-width on mobile. */}
        <div className="max-w-[58.333vw] max-md:max-w-none">
          {/* Intro paragraph — animated line-by-line, tied to the hero H1. */}
          <LineSplit
            animate={animate}
            delay={0.25}
            stagger={0.05}
            className={PARAGRAPH_CLASS}
          >
            {`Weverskade B.V. is verantwoordelijk voor de juiste opslag en verwerking van uw persoonsgegevens. Sinds 25 mei 2018 geldt de Algemene Verordening Persoonsgegevens (AVG). Wij vinden het belangrijk om zorgvuldig en legaal met uw persoonsgegevens om te gaan. Hierom informeren wij u graag over het gebruik van uw persoonsgegevens.`}
          </LineSplit>

          {/* Section: Gebruik van persoonsgegevens */}
          <Section title="Gebruik van persoonsgegevens" startWhen={bodyReady}>
            <Paragraph startWhen={bodyReady}>
              Persoonsgegevens zijn alle gegevens die informatie kunnen verschaffen om een
              persoon te kunnen identificeren. Wij vragen en verwerken uw gegevens door middel
              van ons inschrijfformulier en ons contactformulier. Wij dragen zorg voor een goede
              beveiliging van uw gegevens. Uw persoonsgegevens worden niet gebruikt voor andere
              doeleinden dan aangegeven en worden niet langer opgeslagen dan nodig.
            </Paragraph>
          </Section>

          {/* Section: 1.1 Contactformulier */}
          <Section title="1.1 Contactformulier" startWhen={bodyReady}>
            <Paragraph startWhen={bodyReady}>
              Als klant geeft u persoonsgegevens op in ons contactformulier. Wij vragen de
              volgende persoonsgegevens:
            </Paragraph>
            <BulletList
              startWhen={bodyReady}
              items={[
                "Voornaam",
                "Tussenvoegsel",
                "Achternaam",
                "E-mailadres",
                "Telefoonnummer",
              ]}
            />
            <Paragraph startWhen={bodyReady}>
              Uw gegevens worden door Weverskade B.V. opgeslagen ten behoeve van contact over
              vragen over het huurproces van de Dirigent.
            </Paragraph>
          </Section>

          {/* Section: Het gebruik van cookies */}
          <Section title="Het gebruik van cookies" startWhen={bodyReady}>
            <Paragraph startWhen={bodyReady}>
              Naast het opslaan van persoonsgegevens maken wij ook gebruik van technische en
              functionele cookies. Dit zijn kleine tekstbestanden die uw gedrag op de websites
              herkennen bij volgende bezoeken. De cookies worden gebruikt om de website goed te
              laten functioneren en voor uw gebruiksgemak. U kunt zich te allen tijde afmelden
              voor het gebruik van cookies op onze website.
            </Paragraph>
          </Section>

          {/* Section: Rechten van de klant */}
          <Section title="Rechten van de klant" startWhen={bodyReady}>
            <Paragraph startWhen={bodyReady}>
              Als klant heeft u een aantal rechten m.b.t. uw privacy en gegevensgebruik. U heeft
              bijvoorbeeld recht op:
            </Paragraph>
            <BulletList
              startWhen={bodyReady}
              items={[
                "het inzien, aanpassen en verwijderen van uw persoonsgegevens",
                "uw toestemming deels of compleet in te trekken",
                <>
                  een klacht in te dienen bij de Autoriteit Persoonsgegevens op de site{" "}
                  <a
                    href="https://autoriteitpersoonsgegevens.nl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-solid underline-offset-[0.2em] hover:opacity-70 transition-opacity"
                  >
                    autoriteitpersoonsgegevens.nl
                  </a>
                </>,
              ]}
            />
          </Section>

          {/* Section: Contactgegevens */}
          <Section title="Contactgegevens" startWhen={bodyReady}>
            <Paragraph startWhen={bodyReady}>
              Indien u een verzoek wilt indienen om uw persoonsgegevens op te vragen of te
              wijzigen, kunt u ons bereiken via:
            </Paragraph>
            <MaskReveal
              className={`${PARAGRAPH_CLASS} mt-[1.389vw] max-md:mt-4`}
              delay={0.25}
              startWhen={bodyReady}
            >
              <a
                href="mailto:info@weverskade.com"
                className="underline decoration-solid underline-offset-[0.2em] hover:opacity-70 transition-opacity"
              >
                info@weverskade.com
              </a>
            </MaskReveal>
          </Section>
        </div>
      </div>
    </section>
  );
}

/* ───── Internals ───── */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Shared typographic classes for body paragraphs. */
const PARAGRAPH_CLASS =
  "font-body font-medium text-[1.319vw] leading-[2vw] text-off-black max-md:text-[15px] max-md:leading-[22px]";

/** Section title class (h2). */
const SECTION_TITLE_CLASS =
  "font-heading font-normal text-[2.778vw] leading-[1.15] tracking-[-0.056vw] text-off-black max-md:text-[22px] max-md:leading-[26px]";

/**
 * Section: per-line mask-slide on the h2 title, then per-line mask-slide on
 * each paragraph/bullet inside — same effect as the intro `LineSplit` so the
 * whole page reads as one animated piece. Each Section carries its own
 * scroll trigger so content reveals as the reader arrives.
 */
function Section({
  title,
  children,
  startWhen = true,
}: {
  title: string;
  children: React.ReactNode;
  startWhen?: boolean;
}) {
  return (
    <div className="mt-[5.556vw] max-md:mt-12">
      <ScrollHeroLineSplit
        text={title}
        tag="h2"
        className={SECTION_TITLE_CLASS}
        delay={0}
        stagger={0.06}
        startWhen={startWhen}
      />
      <div className="mt-[1.944vw] max-md:mt-5">{children}</div>
    </div>
  );
}

/**
 * Paragraph: per-line mask-slide when content is plain text (uses
 * ScrollHeroLineSplit). For JSX children (links, spans) falls back to a
 * block-level mask-slide via MaskReveal so the visual still matches.
 */
function Paragraph({
  children,
  startWhen = true,
}: {
  children: React.ReactNode;
  startWhen?: boolean;
}) {
  const asString = extractString(children);
  const className = `${PARAGRAPH_CLASS} mt-[1.389vw] first:mt-0 max-md:mt-4`;

  if (asString !== null) {
    return (
      <ScrollHeroLineSplit
        text={asString}
        tag="p"
        className={className}
        delay={0.15}
        stagger={0.05}
        startWhen={startWhen}
      />
    );
  }

  return (
    <MaskReveal className={className} delay={0.15} startWhen={startWhen}>
      {children}
    </MaskReveal>
  );
}

/**
 * BulletList: each `<li>` mask-slides in with a per-item stagger, all
 * coordinated from a single IntersectionObserver on the `<ul>` so the
 * cascade feels like one continuous wave rather than each item animating
 * independently as it scrolls.
 */
function BulletList({
  items,
  startWhen = true,
}: {
  items: React.ReactNode[];
  startWhen?: boolean;
}) {
  const [ref, inView] = useInView<HTMLUListElement>({ startWhen });
  return (
    <ul
      ref={ref}
      className="mt-[1.389vw] max-md:mt-4 list-disc pl-[1.4vw] max-md:pl-5 marker:text-off-black"
    >
      {items.map((item, i) => (
        <li
          key={i}
          className={`${PARAGRAPH_CLASS} mt-[0.347vw] first:mt-0 max-md:mt-1`}
          style={{
            // Hide the disc marker until the item is "in" so the bullet doesn't
            // float next to an empty mask during the reveal.
            opacity: inView ? 1 : 0,
            transition: inView ? `opacity 0.01s linear ${0.15 + i * 0.05}s` : "none",
          }}
        >
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <span
              className="block will-change-transform"
              style={{
                transform: inView ? "translateY(0)" : "translateY(110%)",
                transition: inView
                  ? `transform 0.9s ${EASE} ${0.15 + i * 0.05}s`
                  : "none",
              }}
            >
              {item}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * MaskReveal: block-level mask-slide used for paragraphs whose content
 * can't be line-split (JSX, links, etc). Clip mask is `overflow-hidden`,
 * inner block translates from 110% → 0.
 */
function MaskReveal({
  children,
  className = "",
  delay = 0.15,
  startWhen = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  startWhen?: boolean;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ startWhen });
  return (
    <div ref={ref} className={`overflow-hidden pb-[0.1em] -mb-[0.1em] ${className}`}>
      <div
        className="will-change-transform"
        style={{
          transform: inView ? "translateY(0)" : "translateY(110%)",
          transition: inView
            ? `transform 0.9s ${EASE} ${delay}s`
            : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Flattens React children into a single string *only* when every child is a
 * string or number — otherwise returns null so the caller can fall back to a
 * non-line-split renderer. JSX in JSX text children (e.g. newlines between
 * tags) collapses to string children per React's JSX rules.
 */
function extractString(children: React.ReactNode): string | null {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    if (
      children.every(
        (c): c is string | number => typeof c === "string" || typeof c === "number"
      )
    ) {
      return children.join("");
    }
  }
  return null;
}
