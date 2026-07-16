"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import LineSplit from "@/components/LineSplit";
import ScrollHeroLineSplit from "@/components/ScrollHeroLineSplit";
import TurnstileWidget, {
  isTurnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { submitFormSubmission } from "@/lib/formSubmissionClient";

interface WonenProject {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  type: string;
  location: string;
  image: string;
}

interface WonenBijPageData {
  heroLabel?: string;
  heroTitle?: string;
  introLabel?: string;
  introText?: string;
  ctaLabel?: string;
  ctaHeading?: string;
  ctaLinkText?: string;
  ctaLinkUrl?: string;
  projects?: WonenProject[];
}

type InterestFormData = {
  name: string;
  email: string;
  phone: string;
  interestedProject: string;
  message: string;
  agreed: boolean;
};

const defaultProjects: WonenProject[] = [
  {
    id: 1,
    slug: "nieuwemarkt-rotterdam",
    name: "Nieuwemarkt Rotterdam",
    tagline: "In het hart van de stad",
    type: "Beschikbaar",
    location: "Rotterdam",
    image: "/images/wonen-bij-card-1-2ad8f2.png",
  },
  {
    id: 2,
    slug: "the-new-citizen",
    name: "The new citizen",
    tagline: "Dichtbij alles",
    type: "Beschikbaar",
    location: "Heereveen",
    image: "/images/wonen-bij-card-2-16b8e4.png",
  },
  {
    id: 3,
    slug: "de-drie-lelies",
    name: "De Drie Lelies",
    tagline: "Historie in het Maaslands erfgoed",
    type: "Beschikbaar",
    location: "Maassluis",
    image: "/images/wonen-bij-card-3-57e8ff.png",
  },
  {
    id: 4,
    slug: "weverstede",
    name: "Weverstede",
    tagline: "Wonen aan het water",
    type: "In ontwikkeling",
    location: "Nieuwegein",
    image: "/images/wonen-bij-card-1-2ad8f2.png",
  },
  {
    id: 5,
    slug: "parkzicht",
    name: "Parkzicht",
    tagline: "Wonen in het groen",
    type: "In ontwikkeling",
    location: "Heereveen",
    image: "/images/wonen-bij-card-2-16b8e4.png",
  },
  {
    id: 6,
    slug: "maaspoort",
    name: "Maaspoort",
    tagline: "Nieuwbouw aan de Maas",
    type: "In ontwikkeling",
    location: "Maassluis",
    image: "/images/wonen-bij-card-3-57e8ff.png",
  },
  {
    id: 7,
    slug: "nieuwemarkt-rotterdam",
    name: "Nieuwemarkt Rotterdam",
    tagline: "In het hart van de stad",
    type: "Beschikbaar",
    location: "Rotterdam",
    image: "/images/wonen-bij-card-1-2ad8f2.png",
  },
  {
    id: 8,
    slug: "the-new-citizen",
    name: "The new citizen",
    tagline: "Dichtbij alles",
    type: "Beschikbaar",
    location: "Heereveen",
    image: "/images/wonen-bij-card-2-16b8e4.png",
  },
  {
    id: 9,
    slug: "de-drie-lelies",
    name: "De Drie Lelies",
    tagline: "Historie in het Maaslands erfgoed",
    type: "Beschikbaar",
    location: "Maassluis",
    image: "/images/wonen-bij-card-3-57e8ff.png",
  },
];

const DEFAULT_HERO_TEXT =
  "Onze woningen worden met aandacht ontwikkeld en compleet opgeleverd, inclusief keuken, vloer- en wandafwerking. Zo ontstaat een comfortabele woonomgeving waarin bewoners zich direct thuis voelen.";

const DEFAULT_INTRO_TEXT =
  "Van stedelijke appartementen tot woonconcepten met extra service: kwaliteit, gebruiksgemak en een prettige leefomgeving staan centraal binnen de projecten van Weverskade.";

const DEFAULT_CONTACT_TEXT =
  "Heeft u een vraag over een specifiek project of wilt u meer informatie over onze werkzaamheden? Bezoek dan onze contactpagina of vul onderstaand formulier in.";

const LEGACY_HERO_TEXT =
  "Onze woningprojecten zijn plekken waar mensen zich thuis kunnen voelen. Hier vindt u een overzicht van woningen in ontwikkeling en in eigendom, met aandacht voor kwaliteit, comfort en de omgeving waarin ze staan.";

const LEGACY_CONTACT_TEXT = "Heeft u een vraag over een specifiek project?";

export default function WonenBijPage({ data }: { data?: WonenBijPageData } = {}) {
  const projects = data?.projects ?? defaultProjects;
  const heroText =
    data?.heroTitle && data.heroTitle !== LEGACY_HERO_TEXT
      ? data.heroTitle
      : DEFAULT_HERO_TEXT;
  const introLabel =
    data?.introLabel ??
    (data?.heroLabel && data.heroLabel !== "Wonen bij"
      ? data.heroLabel
      : "Wonen bij Weverskade");
  const introText = data?.introText ?? DEFAULT_INTRO_TEXT;
  const contactText =
    data?.ctaHeading && data.ctaHeading !== LEGACY_CONTACT_TEXT
      ? data.ctaHeading
      : DEFAULT_CONTACT_TEXT;
  const [activeType, setActiveType] = useState("Alle");
  const [activeLocation, setActiveLocation] = useState("Alle");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [formData, setFormData] = useState<InterestFormData>({
    name: "",
    email: "",
    phone: "",
    interestedProject: "",
    message: "",
    agreed: false,
  });
  const navigate = usePageNavigation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setIntroReady(true));
      return () => cancelAnimationFrame(raf);
    }

    const timer = setTimeout(() => setIntroReady(true), 1450);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const typeOptions = useMemo(() => {
    const types = [...new Set(projects.map((p) => p.type))];
    return [
      { label: "Alle", count: projects.length },
      ...types.map((t) => ({
        label: t,
        count: projects.filter((p) => p.type === t).length,
      })),
    ];
  }, [projects]);

  const locationOptions = useMemo(() => {
    const locations = [...new Set(projects.map((p) => p.location))];
    return [
      { label: "Alle", count: projects.length },
      ...locations.map((l) => ({
        label: l,
        count: projects.filter((p) => p.location === l).length,
      })),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const typeMatch = activeType === "Alle" || p.type === activeType;
      const locationMatch =
        activeLocation === "Alle" || p.location === activeLocation;
      return typeMatch && locationMatch;
    });
  }, [projects, activeType, activeLocation]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitFormSubmission({
        formType: "wonen_bij",
        sourceLabel: "Wonen bij Weverskade",
        ...formData,
        pageUrl: window.location.href,
        turnstileToken,
      });
      setFormData({
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
    <section className="bg-off-white min-h-screen">
      {/* Hero — text only */}
      <div className="pt-[20.417vw] px-[2.569vw] max-md:pt-[30vw] max-md:px-5">
        <ScrollHeroLineSplit
          text={heroText}
          tag="h1"
          indent="10vw"
          delay={0.15}
          stagger={0.08}
          className="font-body font-medium text-[4.028vw] leading-[4.097vw] text-off-black max-md:text-[28px] max-md:leading-[30px]"
        />
      </div>

      {/* Intro */}
      <div className="px-[2.639vw] mt-[7.986vw] max-md:px-5 max-md:mt-12">
        <div className="grid grid-cols-12 gap-x-[1.389vw] max-md:grid-cols-1 max-md:gap-y-4">
          <div className="col-span-4">
            <LineSplit
              animate={introReady}
              delay={0}
              stagger={0.06}
              className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black max-md:text-[17px]"
            >
              {introLabel}
            </LineSplit>
          </div>
          <div className="col-span-5">
            <LineSplit
              animate={introReady}
              delay={0.08}
              stagger={0.06}
              className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px] max-md:tracking-[-0.34px]"
            >
              {introText}
            </LineSplit>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-[2.431vw] mt-[14.514vw] max-md:px-5 max-md:mt-12">
        <div className="grid grid-cols-3 max-md:grid-cols-1 max-md:gap-8">
          {/* Type filters */}
          <div className="col-span-1">
            <button
              onClick={() => setTypeOpen((v) => { if (v) setActiveType("Alle"); return !v; })}
              className="flex items-center gap-[0.556vw] mb-[1.389vw] max-md:mb-3 cursor-pointer bg-transparent border-none p-0"
            >
              <p className="font-body font-medium text-[1.25vw] leading-[2.153vw] tracking-[-0.025vw] text-off-black max-md:text-[15px]">
                Type
              </p>
              <svg
                width="14"
                height="12"
                viewBox="0 0 14 12"
                fill="none"
                className="w-[0.972vw] h-[0.833vw] max-md:w-[14px] max-md:h-[12px]"
              >
                <path d="M1 0V2.32511H8.96908L14 7V4.66872L8.96908 0H1Z" fill="currentColor" />
                <path d="M13 12L13 9.67489L5.03092 9.67489L6.11959e-07 5L4.08153e-07 7.33128L5.03092 12L13 12Z" fill="currentColor" />
              </svg>
            </button>
            <div
              className="grid"
              style={{
                gridTemplateRows: typeOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="overflow-hidden pb-[2vw] -mb-[2vw] max-md:pb-[16px] max-md:-mb-[16px]">
                <div className="flex flex-wrap gap-x-[0.444vw] gap-y-[1.111vw] max-md:gap-x-[10px] max-md:gap-y-[6px]">
                  {typeOptions.map((opt, i) => (
                    <span key={opt.label} className="overflow-hidden block pt-[0.4vw] pb-[2vw] -mt-[0.4vw] -mb-[2vw] max-md:pt-[2px] max-md:pb-[16px] max-md:-mt-[2px] max-md:-mb-[16px]">
                      <button
                        onClick={() => setActiveType(opt.label)}
                        className="font-heading font-normal tracking-[-0.056vw] text-off-black cursor-pointer bg-transparent border-none p-0 text-left will-change-transform"
                        style={{
                          transform: typeOpen ? "translateY(0)" : "translateY(200%)",
                          transition: typeOpen
                            ? `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 + i * 0.08}s`
                            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      >
                        <span
                          className={`text-[2.778vw] leading-[2.153vw] max-md:text-[28px] max-md:leading-normal ${
                            activeType === opt.label
                              ? "underline decoration-solid"
                              : ""
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[1.792vw] leading-[2.153vw] max-md:text-[18px] max-md:leading-normal">
                          {` (${opt.count})`}
                        </span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Locatie filters */}
          <div className="col-start-2 col-span-1 max-md:col-span-1 max-md:col-start-1">
            <button
              onClick={() => setLocationOpen((v) => { if (v) setActiveLocation("Alle"); return !v; })}
              className="flex items-center gap-[0.556vw] mb-[1.389vw] max-md:mb-3 cursor-pointer bg-transparent border-none p-0"
            >
              <p className="font-body font-medium text-[1.25vw] leading-[2.153vw] tracking-[-0.025vw] text-off-black max-md:text-[15px]">
                Locatie
              </p>
              <svg
                width="14"
                height="12"
                viewBox="0 0 14 12"
                fill="none"
                className="w-[0.972vw] h-[0.833vw] max-md:w-[14px] max-md:h-[12px]"
              >
                <path d="M1 0V2.32511H8.96908L14 7V4.66872L8.96908 0H1Z" fill="currentColor" />
                <path d="M13 12L13 9.67489L5.03092 9.67489L6.11959e-07 5L4.08153e-07 7.33128L5.03092 12L13 12Z" fill="currentColor" />
              </svg>
            </button>
            <div
              className="grid"
              style={{
                gridTemplateRows: locationOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="overflow-hidden pb-[2vw] -mb-[2vw] max-md:pb-[16px] max-md:-mb-[16px]">
                <div className="flex flex-wrap gap-x-[0.444vw] gap-y-[1.111vw] max-md:gap-x-[10px] max-md:gap-y-[6px]">
                  {locationOptions.map((opt, i) => (
                    <span key={opt.label} className="overflow-hidden block pt-[0.4vw] pb-[2vw] -mt-[0.4vw] -mb-[2vw] max-md:pt-[2px] max-md:pb-[16px] max-md:-mt-[2px] max-md:-mb-[16px]">
                      <button
                        onClick={() => setActiveLocation(opt.label)}
                        className="font-heading font-normal tracking-[-0.056vw] text-off-black cursor-pointer bg-transparent border-none p-0 text-left will-change-transform"
                        style={{
                          transform: locationOpen ? "translateY(0)" : "translateY(200%)",
                          transition: locationOpen
                            ? `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 + i * 0.08}s`
                            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      >
                        <span
                          className={`text-[2.778vw] leading-[2.153vw] max-md:text-[28px] max-md:leading-normal ${
                            activeLocation === opt.label
                              ? "underline decoration-solid"
                              : ""
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[1.792vw] leading-[2.153vw] max-md:text-[18px] max-md:leading-normal">
                          {` (${opt.count})`}
                        </span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project grid */}
      <div className="px-[2.431vw] mt-[2.431vw] max-md:px-5 max-md:mt-8">
        <div className="grid grid-cols-3 gap-x-[1.389vw] max-md:grid-cols-1">
          {filteredProjects.map((project) => (
            <a
              key={project.id}
              href={`/gebouw/${project.slug}`}
              onClick={(e) => navigate(e, `/gebouw/${project.slug}`)}
              className="block mb-[3.333vw] max-md:mb-6 no-underline"
            >
              {/* Card image with hover overlay */}
              <div
                className="relative w-full h-[33.264vw] overflow-hidden cursor-pointer max-md:h-[80vw]"
                onMouseEnter={() => setHoveredCard(project.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: hoveredCard === project.id ? "scale(1.05)" : "scale(1)",
                  }}
                />
                {/* Hover overlay */}
                <div
                  className={`absolute inset-0 bg-off-black transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    hoveredCard === project.id ? "opacity-57" : "opacity-0"
                  }`}
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    hoveredCard === project.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Top-right arrow */}
                  <svg
                    width="43"
                    height="23"
                    viewBox="0 0 43 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-[1.389vw] right-[1.389vw] w-[2.986vw] h-[1.597vw] max-md:top-4 max-md:right-4 max-md:w-[32px] max-md:h-[17px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: hoveredCard === project.id
                        ? "translate(0, 0) rotate(0deg)"
                        : "translate(-2vw, 2vw) rotate(-8deg)",
                    }}
                  >
                    <path d="M0 0V7.63965H26.3593L43 23V15.3401L26.3593 0H0Z" fill="#F7F5F0" />
                  </svg>
                  {/* Bottom-left arrow */}
                  <svg
                    width="42"
                    height="23"
                    viewBox="0 0 42 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute bottom-[1.389vw] left-[1.389vw] w-[2.917vw] h-[1.597vw] max-md:bottom-4 max-md:left-4 max-md:w-[32px] max-md:h-[17px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: hoveredCard === project.id
                        ? "rotate(180deg) translate(0, 0)"
                        : "rotate(180deg) translate(-2vw, 2vw) rotate(-8deg)",
                    }}
                  >
                    <path d="M0 0V7.63965H25.7462L42 23V15.3401L25.7462 0H0Z" fill="#F7F5F0" />
                  </svg>
                  <span className="font-body font-medium text-[1.944vw] text-off-white underline decoration-solid max-md:text-[20px]">
                    Naar project pagina
                  </span>
                </div>
              </div>
              {/* Card text */}
              <div className="mt-[0.486vw] max-md:mt-2">
                <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[16px]">
                  {project.name}
                </p>
                <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[16px]">
                  {project.tagline}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <ContactFormSection
        text={contactText}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        submitState={submitState}
        submitMessage={submitMessage}
        turnstileRef={turnstileRef}
        turnstileToken={turnstileToken}
        onTurnstileVerify={setTurnstileToken}
      />
    </section>
  );
}

function ContactFormSection({
  text,
  formData,
  setFormData,
  onSubmit,
  submitState,
  submitMessage,
  turnstileRef,
  turnstileToken,
  onTurnstileVerify,
}: {
  text: string;
  formData: InterestFormData;
  setFormData: React.Dispatch<React.SetStateAction<InterestFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitState: "idle" | "submitting" | "success" | "error";
  submitMessage: string;
  turnstileRef: React.Ref<TurnstileHandle>;
  turnstileToken: string;
  onTurnstileVerify: (token: string) => void;
}) {
  return (
    <div className="px-[2.431vw] mt-[8.125vw] pb-[16.875vw] max-md:px-5 max-md:mt-16 max-md:pb-16">
      <div className="flex items-start max-md:flex-col max-md:gap-4">
        <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black shrink-0 w-[31.458vw] pl-[8.333vw] max-md:w-auto max-md:text-[17px] max-md:pl-0">
          Neem contact op
        </p>
        <div className="flex-1 max-md:w-full">
          <h2 className="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[62.569vw] mb-[4.514vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none max-md:mb-6">
            {renderContactText(text)}
          </h2>

          <form onSubmit={onSubmit} className="max-w-[46.944vw] max-md:max-w-none">
            <div className="grid grid-cols-2 gap-x-[1.389vw] gap-y-[2.639vw] max-md:grid-cols-1 max-md:gap-y-6">
              <input
                type="text"
                name="name"
                placeholder="Naam"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none max-md:text-[15px] max-md:pb-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Emailadres"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none max-md:text-[15px] max-md:pb-2"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefoonnummer"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none max-md:text-[15px] max-md:pb-2"
              />
              <input
                type="text"
                name="interestedProject"
                placeholder="In welk project heeft u interesse?"
                value={formData.interestedProject}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, interestedProject: e.target.value }))
                }
                className="w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none max-md:text-[15px] max-md:pb-2"
              />
            </div>

            <textarea
              name="message"
              placeholder="Eventuele vraag of opmerking"
              value={formData.message}
              onChange={(e) =>
                setFormData((p) => ({ ...p, message: e.target.value }))
              }
              rows={4}
              className="mt-[2.014vw] w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none resize-none max-md:mt-6 max-md:text-[15px] max-md:pb-2"
            />

            <TurnstileWidget
              ref={turnstileRef}
              action="wonen-bij"
              onVerify={onTurnstileVerify}
              className="mt-[2.014vw] max-md:mt-6"
            />

            <div className="flex items-start justify-between mt-[1.389vw] max-md:flex-col max-md:gap-6 max-md:mt-6">
              <label className="flex items-start gap-[0.694vw] cursor-pointer max-md:gap-3">
                <input
                  type="checkbox"
                  name="agreed"
                  required
                  checked={formData.agreed}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, agreed: e.target.checked }))
                  }
                  className="shrink-0 mt-[0.208vw] w-[0.764vw] h-[0.764vw] border border-off-black appearance-none checked:bg-green checked:border-green cursor-pointer max-md:w-[16px] max-md:h-[16px] max-md:mt-[2px]"
                />
                <span className="font-body font-normal text-[0.764vw] leading-normal text-off-black max-w-[27.431vw] max-md:text-[11px] max-md:max-w-none">
                  Ik ga akkoord met de{" "}
                  <a href="/privacybeleid" className="underline decoration-solid">
                    algemene voorwaarden
                  </a>{" "}
                  en het gebruiken van mijn gegevens gebruiken om contact met op
                  te nemen.
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

function renderContactText(text: string) {
  const linkText = "contactpagina";
  const [before, after] = text.split(linkText);

  if (after === undefined) {
    return text;
  }

  return (
    <>
      {before}
      <a href="/contact" className="text-off-black underline decoration-solid">
        {linkText}
      </a>
      {after}
    </>
  );
}
