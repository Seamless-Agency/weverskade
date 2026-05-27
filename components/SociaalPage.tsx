"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParallax } from "@/hooks/useParallax";
import ScrollHeroLineSplit from "@/components/ScrollHeroLineSplit";
const DEFAULT_APPROACH_ITEMS = [
  {
    number: "01",
    title: "Aandacht voor mens",
    text: "We werken aan plekken waar mensen prettig kunnen wonen en werken, met aandacht voor kwaliteit, comfort en gebruik op de lange termijn. Vastgoed moet niet alleen functioneren, maar ook goed aanvoelen en bijdragen aan een omgeving waar mensen zich thuis voelen.",
  },
  {
    number: "02",
    title: "Aandacht voor natuur",
    text: "We maken keuzes die bijdragen aan een gezonde en toekomstbestendige leefomgeving. Dat betekent investeren in duurzame oplossingen en een portefeuille die op lange termijn waarde houdt voor zowel gebruikers als omgeving.",
  },
  {
    number: "03",
    title: "Aandacht voor ruimte",
    text: "We gaan zorgvuldig om met de plek en de context waarin we werken. Door zelf te ontwikkelen én te beheren blijven we betrokken bij hoe gebouwen functioneren en hoe de ruimte eromheen wordt gebruikt. Zo bouwen we stap voor stap aan omgevingen die blijven werken en met de tijd beter worden.",
  },
];

interface SociaalPageData {
  heroImage?: string;
  statementHeading?: string;
  approachLabel?: string;
  approachItems?: { number: string; title: string; description: string }[];
  impactBlocks?: { title: string; description: string; image?: string }[];
  teamImage?: string;
  cta?: { label?: string; heading?: string; linkText?: string; linkUrl?: string };
}

export default function SociaalPage({ data }: { data?: SociaalPageData } = {}) {
  const approachItems = data?.approachItems?.map((item) => ({
    number: item.number,
    title: item.title,
    text: item.description,
  })) ?? DEFAULT_APPROACH_ITEMS;
  const [animate, setAnimate] = useState(false);
  const { bgRef, heroRef } = useParallax();
  const circleRef = useRef<HTMLDivElement>(null);
  const impactBlock1Ref = useRef<HTMLDivElement>(null);
  const impactBlock2Ref = useRef<HTMLDivElement>(null);
  const impactBlock3Ref = useRef<HTMLDivElement>(null);
  const impactCtaRef = useRef<HTMLDivElement>(null);
  const [visibleBlocks, setVisibleBlocks] = useState<Set<string>>(new Set());

  // Entry animation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(true);
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

  // Circle rotation on scroll — smooth lerp for fluid, slow feel
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetRotation = 0;
    let currentRotation = 0;
    let rafId = 0;

    function getTarget() {
      const rect = circle!.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (viewH - rect.top) / (viewH + rect.height))
      );
      return progress * 180;
    }

    function onScroll() {
      targetRotation = getTarget();
    }

    function tick() {
      // Lerp factor — lower = slower/more lag (0.03 = very smooth & slow)
      currentRotation += (targetRotation - currentRotation) * 0.03;
      circle!.style.transform = `rotate(${currentRotation}deg)`;
      rafId = requestAnimationFrame(tick);
    }

    targetRotation = getTarget();
    currentRotation = targetRotation;

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Impact blocks scroll-triggered reveal
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleBlocks(new Set(["block1", "block2", "block3", "cta"]));
      return;
    }

    const entries = [
      { ref: impactBlock1Ref, key: "block1" },
      { ref: impactBlock2Ref, key: "block2" },
      { ref: impactBlock3Ref, key: "block3" },
      { ref: impactCtaRef, key: "cta" },
    ];

    const observers: IntersectionObserver[] = [];

    entries.forEach(({ ref, key }) => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleBlocks((prev) => new Set([...prev, key]));
            observer.disconnect();
          }
        },
        { threshold: 0.3, rootMargin: "-10% 0px" },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      {/* ═══ HERO — transparent nav, zoom-out + parallax like home ═══ */}
      <div data-nav-theme="dark">
        <section
          ref={heroRef}
          className="relative w-full h-[62.014vw] overflow-hidden bg-green max-md:h-[85vw]"
        >
          <div
            className="absolute inset-0 z-0 will-change-transform"
            style={{
              transform: animate ? "scale(1)" : "scale(1.3)",
              transition: animate
                ? "transform 3s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          >
            <Image
              ref={bgRef}
              src={data?.heroImage ?? "/images/sociaal-hero.webp"}
              alt="Luchtfoto molen en landschap"
              fill
              sizes="100vw"
              quality={100}
              className="object-cover object-center"
              priority
            />
          </div>
        </section>
      </div>

      {/* ═══ STATEMENT — green ═══ */}
      <div data-nav-theme="green">
        <section className="bg-green px-[2.639vw] pt-[6.597vw] pb-[2.778vw] max-md:px-5 max-md:pt-10 max-md:pb-6">
          <ScrollHeroLineSplit
            text={data?.statementHeading ?? "Bij Weverskade geloven we dat vastgoed alleen waarde heeft als het bijdraagt aan een leefomgeving die klopt. Met aandacht voor ruimte kijken we verder dan het gebouw en nemen we verantwoordelijkheid voor de omgeving eromheen."}
            indent="32.083vw"
            delay={0.15}
            stagger={0.08}
            className="font-body font-medium text-[4.028vw] leading-[4.097vw] text-off-white max-md:text-[28px] max-md:leading-[30px]"
          />

        </section>
      </div>

      {/* ═══ ONZE AANPAK — green ═══ */}
      <div data-nav-theme="green">
        <section className="bg-green px-[2.639vw] pt-[6.944vw] pb-[10.417vw] max-md:px-5 max-md:pt-10 max-md:pb-12">
          <div className="flex items-start max-md:flex-col max-md:gap-8">
            {/* Label */}
            <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-white shrink-0 w-[30.694vw] max-md:w-auto max-md:text-[17px]">
              {data?.approachLabel ?? "Onze aanpak"}
            </p>

            {/* Items */}
            <div className="flex-1 max-md:w-full">
              {approachItems.map((item, i) => (
                <div
                  key={item.number}
                  className={`flex items-start gap-[8.333vw] max-md:flex-col max-md:gap-3 ${
                    i > 0 ? "mt-[5.903vw] max-md:mt-10" : ""
                  }`}
                >
                  <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-white shrink-0 w-[6.042vw] max-md:text-[20px] max-md:leading-normal max-md:w-auto">
                    {item.number}
                  </p>
                  <div className="max-w-[37.153vw] max-md:max-w-none">
                    <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-white mb-[2.153vw] max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px] max-md:mb-4">
                      {item.title}
                    </p>
                    <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-white max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px]">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══ CIRCLE SECTION — dark ═══ */}
      <div data-nav-theme="dark">
        <section className="bg-off-black relative overflow-hidden pt-[3.819vw] pb-[3.472vw] px-[2.639vw] max-md:py-10 max-md:px-5">
          {/* Quote text — top left */}
          <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-white max-w-[22.639vw] max-md:text-[17px] max-md:max-w-none max-md:mb-6 max-md:pr-20">
            Aandacht voor ruimte is een continu proces. Van ontwikkeling tot
            beheer blijven we betrokken, zodat gebouwen en hun omgeving blijven
            werken en met de tijd beter worden.
          </p>

          {/* Rotating circle — centered */}
          <div className="flex justify-center mt-[2.083vw] mb-[2.083vw] max-md:mt-6 max-md:mb-6">
            <div
              ref={circleRef}
              className="w-[43.681vw] h-[44.792vw] will-change-transform max-md:w-[75vw] max-md:h-[77vw]"
            >
              <Image
                src="/images/weverskade-cirkel.svg"
                alt="Aandacht voor ruimte"
                width={629}
                height={645}
                unoptimized
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Top-right Weverskade bracket */}
          <svg
            viewBox="0 0 97 51"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-[3.819vw] right-[2.639vw] w-[4.097vw] h-[3.472vw] max-md:w-[40px] max-md:h-[22px] max-md:top-10 max-md:right-5"
          >
            <path
              d="M0 0V16.9401H59.4616L97 51V34.015L59.4616 0H0Z"
              fill="#F7F5F0"
            />
          </svg>

          {/* Bottom-left Weverskade bracket */}
          <svg
            viewBox="0 0 97 51"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-[3.472vw] left-[2.639vw] w-[4.097vw] h-[3.472vw] max-md:w-[40px] max-md:h-[22px] max-md:bottom-10 max-md:left-5"
          >
            <path
              d="M0 16.955L37.5384 51H97V34.045H37.5384L0 0V16.955Z"
              fill="#F7F5F0"
            />
          </svg>
        </section>
      </div>

      {/* ═══ IMPACT — brown ═══ */}
      <div data-nav-theme="brown">
        <section className="bg-brown pt-[9.931vw] pb-[11.111vw] px-[2.431vw] max-md:pt-12 max-md:pb-12 max-md:px-5">
          {/* Big heading — scroll-triggered line split */}
          <div className="pl-[14.236vw] max-md:pl-0">
            <ScrollHeroLineSplit
              text="Het goede doen, ook als niemand daarom vraagt"
              tag="h2"
              className="font-body font-medium text-[5.556vw] leading-[5.556vw] text-off-black max-w-[59.514vw] max-md:text-[32px] max-md:leading-[34px] max-md:max-w-none"
            />
          </div>

          {/* ── Block 1: Samen naar een CO₂-neutrale wereld ── */}
          <div ref={impactBlock1Ref} className="flex mt-[6.528vw] max-md:block max-md:mt-8">
            {/* Left spacer + small image stacked */}
            <div className="w-[27.5vw] shrink-0 max-md:w-full">
              <div
                className="mt-[14.444vw] w-full h-[27.083vw] overflow-hidden max-md:mt-6 max-md:h-[65vw] will-change-[clip-path]"
                style={{
                  clipPath: visibleBlocks.has("block1") ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                  transition: visibleBlocks.has("block1")
                    ? "clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s"
                    : "none",
                }}
              >
                <Image
                  src="/images/sociaal-mensen.webp"
                  alt="Mensen bij Weverskade"
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 27.5vw"
                  className="w-full h-full object-cover will-change-transform"
                  style={{
                    transform: visibleBlocks.has("block1") ? "scale(1)" : "scale(1.2)",
                    transition: visibleBlocks.has("block1")
                      ? "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s"
                      : "none",
                  }}
                />
              </div>
            </div>

            {/* Right column: label + text + image */}
            <div className="ml-auto max-w-[41.25vw] max-md:max-w-none max-md:ml-0">
              <p
                className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black mb-[1.389vw] max-md:text-[17px] max-md:mb-3 max-md:mt-6"
                style={{
                  opacity: visibleBlocks.has("block1") ? 1 : 0,
                  transform: visibleBlocks.has("block1") ? "translateY(0)" : "translateY(20px)",
                  transition: visibleBlocks.has("block1")
                    ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              >
                Samen naar een CO₂-neutrale wereld
              </p>
              <p
                className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-w-[33.819vw] max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px] max-md:max-w-none"
                style={{
                  opacity: visibleBlocks.has("block1") ? 1 : 0,
                  transform: visibleBlocks.has("block1") ? "translateY(0)" : "translateY(20px)",
                  transition: visibleBlocks.has("block1")
                    ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
                    : "none",
                }}
              >
                We werken stap voor stap aan een portefeuille die op lange
                termijn CO₂-neutraal kan opereren. Door gebouwen te verbeteren,
                te verduurzamen en toekomstbestendig te maken, nemen we
                verantwoordelijkheid voor de impact van ons vastgoed. Niet als
                losse ambitie, maar als vanzelfsprekend onderdeel van hoe we
                ontwikkelen en beheren. Voor nu en de generaties na ons.
              </p>
              <div
                className="w-[38.819vw] h-[25.833vw] overflow-hidden mt-[6.944vw] max-md:w-full max-md:h-[65vw] max-md:mt-6 will-change-[clip-path]"
                style={{
                  clipPath: visibleBlocks.has("block1") ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                  transition: visibleBlocks.has("block1")
                    ? "clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s"
                    : "none",
                }}
              >
                <Image
                  src="/images/sociaal-co2.webp"
                  alt="Duurzaam gebouw"
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 38.819vw"
                  className="w-full h-full object-cover will-change-transform"
                  style={{
                    transform: visibleBlocks.has("block1") ? "scale(1)" : "scale(1.2)",
                    transition: visibleBlocks.has("block1")
                      ? "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s"
                      : "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Block 2: Kwalitatieve huisvesting ── */}
          <div ref={impactBlock2Ref} className="mt-[-6.667vw] max-md:mt-10">
            <div className="pl-[5.903vw] max-md:pl-0">
              <p
                className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black mb-[1.389vw] max-md:text-[17px] max-md:mb-3"
                style={{
                  opacity: visibleBlocks.has("block2") ? 1 : 0,
                  transform: visibleBlocks.has("block2") ? "translateY(0)" : "translateY(20px)",
                  transition: visibleBlocks.has("block2")
                    ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              >
                Kwalitatieve huisvesting wanneer het nodig is
              </p>
              <p
                className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-w-[33.819vw] max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px] max-md:max-w-none"
                style={{
                  opacity: visibleBlocks.has("block2") ? 1 : 0,
                  transform: visibleBlocks.has("block2") ? "translateY(0)" : "translateY(20px)",
                  transition: visibleBlocks.has("block2")
                    ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
                    : "none",
                }}
              >
                We bieden huisvesting voor een breed publiek. Ook wanneer
                snelheid gevraagd wordt, doen we geen concessies aan kwaliteit.
                Bij de woningen voor Oekraïense ontheemden vonden we het
                belangrijk dat deze niet als opvang zouden voelen, maar als
                volwaardige woonomgeving. Met aandacht voor privacy,
                leefbaarheid en comfort realiseerden we plekken waar mensen zich
                thuis kunnen voelen, juist in een periode van onzekerheid.
              </p>
            </div>
          </div>

          {/* ── Block 3: Verduurzamen ── */}
          <div ref={impactBlock3Ref} className="flex items-start mt-[8.333vw] max-md:flex-col max-md:gap-6 max-md:mt-10">
            {/* Large image left */}
            <div
              className="w-[38.819vw] h-[41.944vw] overflow-hidden shrink-0 max-md:w-full max-md:h-[85vw] will-change-[clip-path]"
              style={{
                clipPath: visibleBlocks.has("block3") ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                transition: visibleBlocks.has("block3")
                  ? "clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              }}
            >
              <Image
                src="/images/sociaal-verduurzamen.webp"
                alt="Verduurzaming gebouwen"
                width={1200}
                height={900}
                sizes="(max-width: 768px) 100vw, 38.819vw"
                className="w-full h-full object-cover will-change-transform"
                style={{
                  transform: visibleBlocks.has("block3") ? "scale(1)" : "scale(1.2)",
                  transition: visibleBlocks.has("block3")
                    ? "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              />
            </div>

            {/* Text right — pushed to the 58.33% column position */}
            <div className="ml-auto max-w-[38.819vw] max-md:ml-0 max-md:max-w-none max-md:w-full">
              <p
                className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black mb-[1.389vw] max-md:text-[17px] max-md:mb-3"
                style={{
                  opacity: visibleBlocks.has("block3") ? 1 : 0,
                  transform: visibleBlocks.has("block3") ? "translateY(0)" : "translateY(20px)",
                  transition: visibleBlocks.has("block3")
                    ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s"
                    : "none",
                }}
              >
                Verduurzamen van wat er al is
              </p>
              <p
                className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-w-[33.819vw] max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px] max-md:max-w-none"
                style={{
                  opacity: visibleBlocks.has("block3") ? 1 : 0,
                  transform: visibleBlocks.has("block3") ? "translateY(0)" : "translateY(20px)",
                  transition: visibleBlocks.has("block3")
                    ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s"
                    : "none",
                }}
              >
                We geloven dat goed vastgoed niet altijd nieuw hoeft te zijn.
                Door bestaande gebouwen zorgvuldig te verbeteren en te
                verduurzamen, verlengen we hun levensduur en versterken we hun
                waarde voor gebruikers, locatie en cultureel erfgoed. Zo
                verbinden we duurzame keuzes aan de identiteit van een plek.
              </p>
            </div>
          </div>

          {/* ── Team image ── */}
          {data?.teamImage && (
            <div className="mt-[8.333vw] max-md:mt-10">
              <div className="relative w-full h-[41.667vw] overflow-hidden max-md:h-[65vw]">
                <Image
                  src={data.teamImage}
                  alt="Team Weverskade"
                  fill
                  sizes="95vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* ── CTA — brown inline ── */}
          <div
            ref={impactCtaRef}
            className="pt-[11.389vw] pb-[5.556vw] max-md:pt-16 max-md:pb-8"
            style={{
              opacity: visibleBlocks.has("cta") ? 1 : 0,
              transform: visibleBlocks.has("cta") ? "translateY(0)" : "translateY(20px)",
              transition: visibleBlocks.has("cta")
                ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          >
            <div className="flex items-start max-md:flex-col max-md:gap-4">
              <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black shrink-0 w-[31.458vw] pl-[8.333vw] max-md:w-auto max-md:text-[17px] max-md:pl-0">
                Neem contact op
              </p>
              <div>
                <h2 className="font-body font-medium text-[4.028vw] leading-[4.097vw] text-off-black max-w-[62.569vw] mb-[2.778vw] max-md:text-[28px] max-md:leading-[30px] max-md:max-w-none max-md:mb-6">
                  Wilt u meer weten over onze maatschappelijke en sociale
                  betrokkenheid? Neem gerust contact met ons op.
                </h2>
                <a
                  href="/contact"
                  className="link-underline font-body font-medium text-[1.389vw] leading-[1.2] text-off-black pb-[0.486vw] max-md:text-[17px] max-md:pb-1.5"
                >
                  Naar de contactpagina
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
