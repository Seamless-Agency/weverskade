"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import TurnstileWidget, {
  isTurnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { submitFormSubmission } from "@/lib/formSubmissionClient";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import {
  EASE,
  Parallax,
  Reveal,
  RevealGroup,
  RevealMedia,
  RevealWords,
  useHeroIntro,
  useReducedMotion,
} from "@/components/wonenbij/motion";
import {
  STATUS_TYPE_META,
  formatPrijs,
  landingDefaults,
  type AanbodKaart,
  type KwaliteitItem,
  type LandingProjectKaart,
} from "@/data/wonenbij";

export interface WonenBijLandingData {
  heroImage?: string;
  introStatement?: string;
  overTekst?: string;
  overTekstRechts?: string;
  kwaliteitTitel?: string;
  kwaliteitItems?: KwaliteitItem[];
  contactTekst?: string;
  aanbod?: AanbodKaart[];
  projecten?: LandingProjectKaart[];
}

/**
 * De one-pager van wonenbij.weverskade.com - Figma "Portefeuille wonen"
 * (update 23 juli 2026): hero, statement, over-sectie, kwaliteitsband,
 * geaggregeerd woningaanbod, projectoverzicht en contactformulier.
 */
export default function WonenBijLanding({ data }: { data?: WonenBijLandingData }) {
  const navigate = usePageNavigation();
  const intro = useHeroIntro();
  const reduced = useReducedMotion();
  const d = landingDefaults;

  const heroImage = data?.heroImage ?? d.heroImage;
  const introStatement = data?.introStatement ?? d.introStatement;
  const overTekst = data?.overTekst ?? d.overTekst;
  const overTekstRechts = data?.overTekstRechts ?? d.overTekstRechts;
  const kwaliteitItems = data?.kwaliteitItems?.length
    ? data.kwaliteitItems
    : d.kwaliteitItems;
  const contactTekst = data?.contactTekst ?? d.contactTekst;
  const aanbod = data?.aanbod ?? [];
  const projecten = data?.projecten ?? [];

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const scrollNaarAanbod = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById("aanbod")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative bg-white min-h-screen">
      {/* Hero — net als de projectpagina altijd exact één viewport hoog
          (bewuste afwijking van het 893px-Figma-frame) */}
      <div className="relative h-svh overflow-hidden" data-nav-theme="dark">
        {/* Zoom-out entrance, zelfde geste als de hero van de hoofdsite */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: intro ? "scale(1)" : "scale(1.18)",
            transition: intro && !reduced ? `transform 2.4s ${EASE}` : "none",
          }}
        >
          <Image
            src={heroImage}
            alt="Wonen bij Weverskade"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-off-black/30" />
        <WonenBijHeader
          variant="licht"
          ctaLabel={d.heroKnop}
          ctaHref="#aanbod"
        />
      </div>

      {/* Statement — de knop staat inline achter de laatste regel; vaste paddings
          (geen hoogte) zodat langere CMS-tekst de sectie laat meegroeien */}
      <RevealGroup className="pt-[6.181vw] pb-[16.667vw] px-[2.569vw] max-lg:pt-12 max-lg:px-5 max-lg:pb-12">
        <p className="font-body font-medium text-[4.028vw] leading-[4.097vw] text-off-black indent-[10.278vw] max-w-[83.264vw] max-lg:indent-10 max-lg:text-[28px] max-lg:leading-[33px] max-lg:max-w-none">
          <RevealWords text={introStatement} stagger={0.04} duration={1} />
          <Reveal
            as="a"
            href="#aanbod"
            onClick={scrollNaarAanbod}
            delay={0.75}
            y={14}
            className="pill-hover relative -top-[0.104vw] inline-flex items-center justify-center align-middle indent-0 leading-none whitespace-nowrap ml-[2.465vw] w-[12.083vw] h-[2.847vw] bg-green text-off-white no-underline rounded-full font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-lg:top-0 max-lg:ml-3 max-lg:w-auto max-lg:h-auto max-lg:px-6 max-lg:py-2.5 max-lg:text-[15px]"
          >
            {d.introKnop}
          </Reveal>
        </p>
      </RevealGroup>

      {/* Over Wonen bij Weverskade — flow met vaste ankers i.p.v. een band met
          vaste hoogte: de Figma-witruimtes (252 boven, 285 tussen de blokken,
          248 onder) blijven exact, maar langere CMS-tekst laat de band groeien
          in plaats van over de foto's heen te lopen */}
      <div className="bg-off-white pt-[17.5vw] pb-[17.222vw] max-lg:py-14 max-lg:px-5">
        <div className="px-[2.778vw] max-lg:px-0">
          {/* Blok 1: titel + foto rechts; tekst links onder-verankerd 22 boven de foto-onderkant */}
          <div className="relative min-h-[43.889vw] max-lg:min-h-0">
            <h2 className="max-w-[38.194vw] font-heading font-normal text-[4.931vw] leading-[5.625vw] tracking-[-0.099vw] text-off-black whitespace-pre-line max-lg:max-w-none max-lg:text-[36px] max-lg:leading-[40px] max-lg:tracking-[-0.72px]">
              <RevealWords text={d.overTitel} />
            </h2>
            <RevealMedia className="absolute top-0 right-[-0.347vw] w-[54.514vw] h-[43.889vw] overflow-hidden max-lg:relative max-lg:inset-auto max-lg:w-full max-lg:h-auto max-lg:aspect-[785/632] max-lg:mt-8">
              <Parallax>
                <Image
                  src={d.overFoto}
                  alt="Interieur van een Weverskade woning"
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </Parallax>
            </RevealMedia>
            <Reveal
              as="p"
              delay={0.15}
              className="absolute left-0 bottom-[1.528vw] w-[29.792vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:static max-lg:w-full max-lg:mt-8 max-lg:text-[17px] max-lg:leading-[24px]"
            >
              {overTekst}
            </Reveal>
          </div>

          {/* Blok 2: foto links; tekst + knop rechts, knop-onderkant = foto-onderkant */}
          <div className="relative mt-[19.792vw] max-lg:mt-8">
            <RevealMedia className="relative ml-[0.069vw] w-[54.931vw] aspect-[791/559] overflow-hidden max-lg:ml-0 max-lg:w-full">
              <Parallax>
                <Image
                  src={d.overFoto2}
                  alt="Woonkamer van een Weverskade woning"
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </Parallax>
            </RevealMedia>
            {/* Onder-verankerd: de knop-onderkant valt samen met de foto-onderkant
                (Figma: beide op 3245), langere tekst groeit naar boven */}
            <Reveal
              delay={0.15}
              className="absolute left-[64.444vw] bottom-0 w-[27.986vw] max-lg:static max-lg:w-full max-lg:mt-8"
            >
          <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:text-[17px] max-lg:leading-[24px]">
            {overTekstRechts}
          </p>
          <a
            href="#aanbod"
            onClick={scrollNaarAanbod}
            className="pill-hover inline-flex items-center justify-center mt-[3.75vw] -ml-[0.139vw] w-[12.083vw] h-[2.847vw] bg-green text-off-white no-underline rounded-full font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-lg:mt-5 max-lg:ml-0 max-lg:w-auto max-lg:h-auto max-lg:px-6 max-lg:py-2.5 max-lg:text-[15px]"
          >
              {d.overKnop}
            </a>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Kwaliteit en gebruiksgemak */}
      {/* Figma-band is 521 hoog bij éénregelige placeholders; de maat die telt is
          de witruimte (99 boven, 131 onder) — de band groeit mee met de inhoud */}
      <div className="bg-green pt-[6.875vw] pb-[9.097vw] max-lg:py-14" data-nav-theme="green">
        <div className="pl-[18.542vw] pr-[2.431vw] max-lg:px-5">
          <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-white max-lg:text-[32px] max-lg:leading-[1.1] max-lg:tracking-[-0.64px]">
            <RevealWords text={data?.kwaliteitTitel ?? d.kwaliteitTitel} />
          </h2>
          {/* kolommen staan in Figma op 270/623/965 — ongelijke breedtes, geen uniform grid */}
          <RevealGroup className="mt-[4.264vw] ml-[0.208vw] grid grid-cols-[24.514vw_23.75vw_20.486vw] gap-y-[3.125vw] max-lg:mt-8 max-lg:ml-0 max-lg:grid-cols-1 max-lg:gap-y-6">
            {kwaliteitItems.map((item, i) => (
              <Reveal
                key={item.label + item.waarde}
                delay={0.1 + i * 0.075}
                className="max-w-[20.486vw] max-lg:max-w-none"
              >
                <p className="font-body font-normal text-[1.042vw] leading-[1.806vw] text-off-white max-lg:text-[13px] max-lg:leading-[20px]">
                  {item.label}
                </p>
                <p className="font-heading font-normal text-[1.458vw] leading-[1.806vw] text-off-white max-lg:text-[18px] max-lg:leading-[24px]">
                  {item.waarde}
                </p>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </div>

      {/* Beschikbare woningen - geaggregeerd aanbod van alle projecten */}
      {aanbod.length > 0 ? (
        <div id="aanbod" className="pt-[6.875vw] px-[2.431vw] max-lg:pt-12 max-lg:px-5 scroll-mt-[2vw]">
          {/* koppen staan in Figma op x=40, de kaarten op x=35 */}
          <h2 className="ml-[0.347vw] font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:ml-0 max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
            <RevealWords text={d.aanbodTitel} />
          </h2>
          <div className="mt-[2.431vw] grid grid-cols-3 gap-x-[1.389vw] gap-y-[1.389vw] max-lg:mt-6 max-lg:grid-cols-1 max-lg:gap-y-5">
            {aanbod.map((kaart, i) => {
              const href = `/wonenbij/${kaart.projectSlug}/${kaart.typeSlug}`;
              return (
                <Reveal
                  as="a"
                  key={kaart.projectSlug + kaart.typeSlug}
                  href={href}
                  delay={(i % 3) * 0.09}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => navigate(e, href)}
                  className="block bg-off-white pt-[1.389vw] px-[1.25vw] pb-[1.944vw] no-underline group max-lg:p-4"
                >
                  <div className="relative w-full aspect-[407/275] overflow-hidden">
                    <Image
                      src={kaart.foto}
                      alt={kaart.typeNaam}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-[0.625vw] flex items-start justify-between gap-4 max-lg:mt-3">
                    <p className="font-heading font-normal text-[1.667vw] leading-[2.056vw] text-off-black max-lg:text-[18px] max-lg:leading-[1.05]">
                      {kaart.typeNaam}
                    </p>
                    <p className="shrink-0 mt-[0.417vw] font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-lg:mt-0 max-lg:text-[12px] max-lg:leading-[17px]">
                      {kaart.status === "inschrijven" ? "Inschrijven" : "Te huur"}
                    </p>
                  </div>
                  <p className="mt-[0.306vw] font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-lg:text-[12px] max-lg:leading-[17px]">
                    {kaart.plaats}
                  </p>
                  <div className="mt-[1.319vw] flex items-end justify-between max-lg:mt-3">
                    <div className="flex items-start gap-[1.25vw] max-lg:gap-2">
                      <div className="flex flex-col items-center gap-[1.181vw] ml-[0.139vw] mt-[0.417vw] max-lg:gap-[14px] max-lg:ml-0">
                        <Image
                          src="/images/wonenbij/icons/key-klein.svg"
                          alt=""
                          width={12}
                          height={12}
                          className="w-[0.833vw] h-auto max-lg:w-[11px]"
                        />
                        <Image
                          src="/images/wonenbij/icons/bed-klein.svg"
                          alt=""
                          width={14}
                          height={9}
                          className="w-[0.972vw] h-auto max-lg:w-[13px]"
                        />
                        <Image
                          src="/images/wonenbij/icons/m2-klein.svg"
                          alt=""
                          width={11}
                          height={11}
                          className="w-[0.764vw] h-auto max-lg:w-[10px]"
                        />
                      </div>
                      <div className="font-body font-medium text-[0.833vw] leading-[1.806vw] text-off-black max-lg:text-[12px] max-lg:leading-[19px]">
                        <p>{formatPrijs(kaart.prijsVan)} p/m</p>
                        <p>{kaart.slaapkamers} slaapkamers</p>
                        <p>{kaart.oppervlakte} m²</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center w-[8.056vw] h-[1.875vw] mb-[0.417vw] bg-green text-off-white rounded-full font-heading font-normal text-[0.764vw] tracking-[-0.015vw] max-lg:w-auto max-lg:h-auto max-lg:mb-0 max-lg:px-3 max-lg:py-1.5 max-lg:text-[11px]">
                      Naar deze woning
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Onze woonprojecten */}
      {projecten.length > 0 ? (
        <div className="pt-[5.903vw] px-[2.431vw] max-lg:pt-12 max-lg:px-5">
          <h2 className="ml-[0.347vw] font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:ml-0 max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
            <RevealWords text={d.projectenTitel} />
          </h2>
          <div className="mt-[2.917vw] grid grid-cols-3 gap-x-[1.389vw] gap-y-[1.389vw] max-lg:mt-6 max-lg:grid-cols-1 max-lg:gap-y-6">
            {projecten.map((project, i) => {
              const href = project.heeftWonenBijPagina
                ? `/wonenbij/${project.slug}`
                : `/gebouw/${project.slug}`;
              return (
                <Reveal
                  as="a"
                  key={project.slug + project.naam}
                  href={href}
                  delay={(i % 3) * 0.09}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => navigate(e, href)}
                  className="block no-underline"
                  onMouseEnter={() => setHoveredCard(project.slug)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative w-full aspect-[443/479] overflow-hidden cursor-pointer">
                    <Image
                      src={project.image}
                      alt={project.naam}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{
                        transform:
                          hoveredCard === project.slug ? "scale(1.05)" : "scale(1)",
                      }}
                    />
                    <div
                      className={`absolute inset-0 bg-off-black transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        hoveredCard === project.slug ? "opacity-57" : "opacity-0"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        hoveredCard === project.slug ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span className="mt-[1.424vw] font-body font-medium text-[1.944vw] leading-[2.257vw] text-off-white underline decoration-solid max-lg:mt-0 max-lg:text-[20px] max-lg:leading-[24px]">
                        Naar project pagina
                      </span>
                    </div>
                  </div>
                  <div className="mt-[0.486vw] flex items-start justify-between max-lg:mt-2">
                    <div>
                      <p className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:text-[16px] max-lg:leading-[1.2]">
                        {project.naam}
                      </p>
                      <p className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:text-[16px] max-lg:leading-[1.2]">
                        {project.plaats}
                      </p>
                    </div>
                    {project.statusLabel ? (
                      <span className="inline-flex items-center justify-center shrink-0 mt-[0.556vw] mr-[0.139vw] w-[8.056vw] h-[1.875vw] bg-green text-off-white rounded-full font-heading font-normal text-[0.764vw] tracking-[-0.015vw] max-lg:mt-0 max-lg:mr-0 max-lg:w-auto max-lg:h-auto max-lg:px-3 max-lg:py-1.5 max-lg:text-[11px]">
                        {project.statusLabel}
                      </span>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      ) : null}

      <ContactSectie tekst={contactTekst} />
    </section>
  );
}

/* ─── Contactformulier (zelfde velden als het bestaande wonen_bij-formulier) ── */

function ContactSectie({ tekst }: { tekst: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interestedProject: "",
    message: "",
    agreed: false,
  });
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);

  const veldClass = useMemo(
    () =>
      "w-full bg-transparent border-b border-off-black pb-[1.458vw] font-body font-medium text-[1.319vw] leading-[1.528vw] text-off-black placeholder:text-off-black/55 outline-none max-lg:text-[16px] max-lg:leading-normal max-lg:pt-2 max-lg:pb-3",
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitFormSubmission({
        formType: "wonen_bij",
        sourceLabel: "Wonen bij Weverskade - one-pager",
        ...form,
        pageUrl: window.location.href,
        turnstileToken,
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        interestedProject: "",
        message: "",
        agreed: false,
      });
      setSubmitState("success");
      setSubmitMessage("Bedankt, uw formulier is verstuurd.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Het formulier kon niet worden verstuurd."
      );
    } finally {
      // Een token is eenmalig, dus na elke poging een nieuwe aanvragen.
      setTurnstileToken("");
      turnstileRef.current?.reset();
    }
  };

  return (
    <div className="px-[2.431vw] mt-[14.583vw] pb-[15.833vw] max-lg:px-5 max-lg:mt-16 max-lg:pb-16">
      <div className="flex items-start max-lg:flex-col max-lg:gap-4">
        <Reveal
          as="p"
          className="mt-[0.694vw] font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black shrink-0 w-[31.458vw] pl-[8.056vw] max-lg:mt-0 max-lg:w-auto max-lg:text-[17px] max-lg:leading-[22px] max-lg:pl-0"
        >
          {landingDefaults.contactLabel}
        </Reveal>
        <div className="flex-1 max-lg:w-full">
          <h2 className="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[62.569vw] mb-[4.653vw] max-lg:text-[28px] max-lg:leading-[32px] max-lg:max-w-none max-lg:mb-6">
            <RevealWords text={tekst} stagger={0.04} />
          </h2>

          <Reveal delay={0.2}>
          <form onSubmit={handleSubmit} className="ml-[0.208vw] max-w-[46.944vw] max-lg:ml-0 max-lg:max-w-none">
            <div className="grid grid-cols-2 gap-x-[1.389vw] gap-y-[2.639vw] max-lg:grid-cols-1 max-lg:gap-y-6">
              <input
                type="text"
                name="name"
                placeholder="Naam"
                aria-label="Naam"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={veldClass}
              />
              <input
                type="email"
                name="email"
                placeholder="Emailadres"
                aria-label="Emailadres"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={veldClass}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefoonnummer"
                aria-label="Telefoonnummer"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={veldClass}
              />
              <input
                type="text"
                name="interestedProject"
                placeholder="In welk project heeft u interesse?"
                value={form.interestedProject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, interestedProject: e.target.value }))
                }
                className={veldClass}
              />
            </div>

            <textarea
              name="message"
              placeholder="Eventuele vraag of opmerking"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={4}
              className={`mt-[2.014vw] h-[8.889vw] resize-none max-lg:mt-6 max-lg:h-auto ${veldClass}`}
            />

            <TurnstileWidget
              ref={turnstileRef}
              action="wonenbij-contact"
              onVerify={setTurnstileToken}
              className="mt-[2.014vw] max-lg:mt-6"
            />

            <div className="flex items-start justify-between mt-[2.153vw] max-lg:flex-col max-lg:gap-6 max-lg:mt-6">
              <label className="flex items-start gap-[1.042vw] cursor-pointer max-lg:gap-3">
                <input
                  type="checkbox"
                  name="agreed"
                  required
                  checked={form.agreed}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, agreed: e.target.checked }))
                  }
                  className="shrink-0 mt-[0.347vw] w-[0.764vw] h-[0.764vw] border border-off-black appearance-none checked:bg-green checked:border-green cursor-pointer max-lg:w-[16px] max-lg:h-[16px] max-lg:mt-[2px]"
                />
                <span className="font-body font-normal text-[0.764vw] leading-[0.889vw] text-off-black max-w-[27.431vw] max-lg:text-[11px] max-lg:leading-normal max-lg:max-w-none">
                  Ik ga akkoord met de{" "}
                  <a href="/privacybeleid" className="underline decoration-solid">
                    algemene voorwaarden
                  </a>{" "}
                  en het gebruiken van mijn gegevens om contact met mij op te
                  nemen.
                </span>
              </label>
              <button
                type="submit"
                disabled={
                  submitState === "submitting" ||
                  (isTurnstileEnabled && !turnstileToken)
                }
                className="pill-hover inline-flex items-center justify-center shrink-0 -mt-[0.694vw] w-[14.722vw] h-[3.194vw] bg-green text-off-white font-heading font-normal text-[1.181vw] tracking-[-0.024vw] rounded-full cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed max-lg:mt-0 max-lg:w-auto max-lg:h-auto max-lg:text-[15px] max-lg:px-6 max-lg:py-3"
              >
                {submitState === "submitting"
                  ? "Versturen..."
                  : "Formulier versturen"}
              </button>
            </div>
            {isTurnstileEnabled && !turnstileToken ? (
              <p className="mt-2 font-body font-medium text-[0.833vw] leading-[1.25] text-off-black/50 max-lg:text-[12px]">
                Beveiligingscheck wordt geladen…
              </p>
            ) : null}
            {submitMessage ? (
              <p
                className={`mt-4 font-body text-[0.972vw] leading-[1.25] max-lg:text-[13px] ${
                  submitState === "error" ? "text-red-700" : "text-green"
                }`}
              >
                {submitMessage}
              </p>
            ) : null}
          </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
