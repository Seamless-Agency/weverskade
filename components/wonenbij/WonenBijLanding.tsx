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
    <section className="bg-white min-h-screen">
      {/* Hero - full-bleed beeld met donkere overlay */}
      <div className="relative h-[62.014vw] max-md:h-[120vw]" data-nav-theme="dark">
        <Image
          src={heroImage}
          alt="Wonen bij Weverskade"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-off-black/30" />
        <WonenBijHeader
          variant="licht"
          ctaLabel={d.heroKnop}
          ctaHref="#aanbod"
        />
      </div>

      {/* Statement */}
      <div className="pt-[6.806vw] px-[2.569vw] max-md:pt-12 max-md:px-5">
        <p className="font-body font-medium text-[4.028vw] leading-[4.097vw] text-off-black indent-[10vw] max-w-[83.264vw] max-md:text-[28px] max-md:leading-[30px] max-md:max-w-none">
          {introStatement}
        </p>
        <a
          href="#aanbod"
          onClick={scrollNaarAanbod}
          className="inline-block mt-[2.014vw] ml-[27.083vw] bg-green text-off-white no-underline rounded-full px-[1.667vw] py-[0.694vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:mt-6 max-md:ml-0 max-md:px-6 max-md:py-2.5 max-md:text-[15px]"
        >
          {d.introKnop}
        </a>
      </div>

      {/* Over Wonen bij Weverskade */}
      <div className="mt-[9.514vw] bg-off-white py-[10.417vw] max-md:mt-14 max-md:py-14">
        <div className="px-[2.778vw] max-md:px-5">
          <div className="grid grid-cols-12 gap-x-[1.389vw] max-md:grid-cols-1 max-md:gap-y-8">
            <div className="col-span-5">
              <h2 className="font-heading font-normal text-[4.931vw] leading-[5.625vw] tracking-[-0.099vw] text-off-black whitespace-pre-line max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px]">
                {d.overTitel}
              </h2>
            </div>
            <div className="col-span-7">
              <div className="relative w-full aspect-[785/632] overflow-hidden">
                <Image
                  src={d.overFoto}
                  alt="Interieur van een Weverskade woning"
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-[6.25vw] grid grid-cols-12 gap-x-[1.389vw] max-md:mt-10 max-md:grid-cols-1 max-md:gap-y-8">
            <div className="col-span-4">
              <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px]">
                {overTekst}
              </p>
            </div>
            <div className="col-span-8 mt-[13vw] grid grid-cols-8 gap-x-[1.389vw] -ml-[33.5vw] w-[calc(100%+33.5vw)] max-md:mt-0 max-md:ml-0 max-md:w-full max-md:grid-cols-1 max-md:gap-y-8">
              <div className="col-span-5">
                <div className="relative w-full aspect-[791/559] overflow-hidden">
                  <Image
                    src={d.overFoto2}
                    alt="Woonkamer van een Weverskade woning"
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="col-span-3 self-end pb-[1vw] max-md:pb-0">
                <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px]">
                  {overTekstRechts}
                </p>
                <a
                  href="#aanbod"
                  onClick={scrollNaarAanbod}
                  className="inline-block mt-[1.736vw] bg-green text-off-white no-underline rounded-full px-[1.667vw] py-[0.694vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:mt-5 max-md:px-6 max-md:py-2.5 max-md:text-[15px]"
                >
                  {d.introKnop}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kwaliteit en gebruiksgemak */}
      <div className="bg-green py-[6.875vw] max-md:py-14" data-nav-theme="green">
        <div className="pl-[18.542vw] pr-[2.431vw] max-md:px-5">
          <h2 className="font-heading font-normal text-[4.653vw] leading-none tracking-[-0.093vw] text-off-white max-md:text-[32px] max-md:tracking-[-0.64px]">
            {data?.kwaliteitTitel ?? d.kwaliteitTitel}
          </h2>
          <div className="mt-[3.75vw] grid grid-cols-3 gap-x-[7vw] gap-y-[2.5vw] max-w-[68vw] max-md:mt-8 max-md:grid-cols-1 max-md:gap-y-6 max-md:max-w-none">
            {kwaliteitItems.map((item) => (
              <div key={item.label + item.waarde}>
                <p className="font-body font-normal text-[1.042vw] leading-[1.806vw] text-off-white max-md:text-[13px] max-md:leading-[20px]">
                  {item.label}
                </p>
                <p className="font-heading font-normal text-[1.458vw] leading-[1.806vw] text-off-white max-md:text-[18px] max-md:leading-[24px]">
                  {item.waarde}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Beschikbare woningen - geaggregeerd aanbod van alle projecten */}
      {aanbod.length > 0 ? (
        <div id="aanbod" className="pt-[6.458vw] px-[2.431vw] max-md:pt-12 max-md:px-5 scroll-mt-[2vw]">
          <h2 className="font-heading font-normal text-[4.931vw] leading-none tracking-[-0.099vw] text-off-black max-md:text-[36px] max-md:tracking-[-0.72px]">
            {d.aanbodTitel}
          </h2>
          <div className="mt-[2.222vw] grid grid-cols-3 gap-x-[1.389vw] gap-y-[1.389vw] max-md:mt-6 max-md:grid-cols-1 max-md:gap-y-5">
            {aanbod.map((kaart) => {
              const href = `/wonenbij/${kaart.projectSlug}/${kaart.typeSlug}`;
              return (
                <a
                  key={kaart.projectSlug + kaart.typeSlug}
                  href={href}
                  onClick={(e) => navigate(e, href)}
                  className="block bg-off-white p-[1.25vw] pb-[1.6vw] no-underline group max-md:p-4"
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
                  <div className="mt-[1.25vw] flex items-start justify-between gap-4 max-md:mt-3">
                    <p className="font-heading font-normal text-[1.667vw] leading-[1.05] text-off-black max-md:text-[18px]">
                      {kaart.typeNaam}
                    </p>
                    <p className="shrink-0 font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-md:text-[12px]">
                      {kaart.status === "inschrijven" ? "Inschrijven" : "Te huur"}
                    </p>
                  </div>
                  <p className="mt-[0.278vw] font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-md:text-[12px]">
                    {kaart.plaats}
                  </p>
                  <div className="mt-[1.111vw] flex items-end justify-between max-md:mt-3">
                    <div className="flex items-start gap-[0.694vw] max-md:gap-2">
                      <div className="flex flex-col items-center gap-[0.417vw] mt-[0.3vw]">
                        <Image
                          src="/images/wonenbij/icons/key-klein.svg"
                          alt=""
                          width={12}
                          height={12}
                          className="w-[0.833vw] h-auto max-md:w-[11px]"
                        />
                        <Image
                          src="/images/wonenbij/icons/bed-klein.svg"
                          alt=""
                          width={14}
                          height={9}
                          className="w-[0.972vw] h-auto max-md:w-[13px]"
                        />
                      </div>
                      <div className="font-body font-medium text-[0.833vw] leading-[1.806vw] text-off-black max-md:text-[12px] max-md:leading-[19px]">
                        <p>{formatPrijs(kaart.prijsVan)} p/m</p>
                        <p>{kaart.slaapkamers} slaapkamers</p>
                        <p>{kaart.oppervlakte} m²</p>
                      </div>
                    </div>
                    <span className="inline-block bg-green text-off-white rounded-full px-[1.111vw] py-[0.417vw] font-heading font-normal text-[0.764vw] tracking-[-0.015vw] max-md:px-3 max-md:py-1.5 max-md:text-[11px]">
                      Naar deze woning
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Onze woonprojecten */}
      {projecten.length > 0 ? (
        <div className="pt-[6.458vw] px-[2.431vw] max-md:pt-12 max-md:px-5">
          <h2 className="font-heading font-normal text-[4.931vw] leading-none tracking-[-0.099vw] text-off-black max-md:text-[36px] max-md:tracking-[-0.72px]">
            {d.projectenTitel}
          </h2>
          <div className="mt-[2.222vw] grid grid-cols-3 gap-x-[1.389vw] max-md:mt-6 max-md:grid-cols-1 max-md:gap-y-6">
            {projecten.map((project) => {
              const href = project.heeftWonenBijPagina
                ? `/wonenbij/${project.slug}`
                : `/gebouw/${project.slug}`;
              return (
                <a
                  key={project.slug + project.naam}
                  href={href}
                  onClick={(e) => navigate(e, href)}
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
                      <span className="font-body font-medium text-[1.944vw] text-off-white underline decoration-solid max-md:text-[20px]">
                        Naar project pagina
                      </span>
                    </div>
                  </div>
                  <div className="mt-[0.486vw] max-md:mt-2">
                    <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[16px]">
                      {project.naam}
                    </p>
                    <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[16px]">
                      {project.plaats}
                    </p>
                  </div>
                </a>
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
      "w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none max-md:text-[15px] max-md:pb-2",
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
    <div className="px-[2.431vw] mt-[8.125vw] pb-[10vw] max-md:px-5 max-md:mt-16 max-md:pb-16">
      <div className="flex items-start max-md:flex-col max-md:gap-4">
        <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black shrink-0 w-[31.458vw] pl-[8.333vw] max-md:w-auto max-md:text-[17px] max-md:pl-0">
          {landingDefaults.contactLabel}
        </p>
        <div className="flex-1 max-md:w-full">
          <h2 className="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[62.569vw] mb-[4.514vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none max-md:mb-6">
            {tekst}
          </h2>

          <form onSubmit={handleSubmit} className="max-w-[46.944vw] max-md:max-w-none">
            <div className="grid grid-cols-2 gap-x-[1.389vw] gap-y-[2.639vw] max-md:grid-cols-1 max-md:gap-y-6">
              <input
                type="text"
                name="name"
                placeholder="Naam"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={veldClass}
              />
              <input
                type="email"
                name="email"
                placeholder="Emailadres"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={veldClass}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefoonnummer"
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
              className={`mt-[2.014vw] resize-none max-md:mt-6 ${veldClass}`}
            />

            <TurnstileWidget
              ref={turnstileRef}
              action="wonenbij-contact"
              onVerify={setTurnstileToken}
              className="mt-[2.014vw] max-md:mt-6"
            />

            <div className="flex items-start justify-between mt-[1.389vw] max-md:flex-col max-md:gap-6 max-md:mt-6">
              <label className="flex items-start gap-[0.694vw] cursor-pointer max-md:gap-3">
                <input
                  type="checkbox"
                  name="agreed"
                  required
                  checked={form.agreed}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, agreed: e.target.checked }))
                  }
                  className="shrink-0 mt-[0.208vw] w-[0.764vw] h-[0.764vw] border border-off-black appearance-none checked:bg-green checked:border-green cursor-pointer max-md:w-[16px] max-md:h-[16px] max-md:mt-[2px]"
                />
                <span className="font-body font-normal text-[0.764vw] leading-normal text-off-black max-w-[27.431vw] max-md:text-[11px] max-md:max-w-none">
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
                className="bg-green text-off-white font-heading font-normal text-[1.181vw] tracking-[-0.024vw] px-[1.667vw] py-[0.694vw] rounded-full cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed max-md:text-[15px] max-md:px-6 max-md:py-2.5"
              >
                {submitState === "submitting"
                  ? "Versturen..."
                  : "Formulier versturen"}
              </button>
            </div>
            {submitMessage ? (
              <p
                className={`mt-4 font-body text-[0.972vw] leading-[1.25] max-md:text-[13px] ${
                  submitState === "error" ? "text-red-700" : "text-green"
                }`}
              >
                {submitMessage}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
