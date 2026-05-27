"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import LineSplit from "@/components/LineSplit";
import ScrollHeroLineSplit from "@/components/ScrollHeroLineSplit";
import CTASection from "@/components/CTASection";
import GebouwMap from "@/components/GebouwMap";
import VimeoBackground from "@/components/VimeoBackground";
import GebouwImageCarousel from "@/components/GebouwImageCarousel";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { submitFormSubmission } from "@/lib/formSubmissionClient";
import type { GebouwProject } from "@/data/gebouwen";

interface GebouwPageProps {
  project: GebouwProject;
}

type WonenFormData = {
  name: string;
  email: string;
  phone: string;
  interestedProject: string;
  message: string;
  agreed: boolean;
};

/* ─── Detail line mask-slide helper ─── */
function DetailLine({
  children,
  animate,
  delay,
}: {
  children: React.ReactNode;
  animate: boolean;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden">
      <span
        className="block will-change-transform"
        style={{
          transform: animate ? "translateY(0)" : "translateY(110%)",
          transition: animate
            ? `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
            : "none",
        }}
      >
        {children}
      </span>
    </span>
  );
}

export default function GebouwPage({ project }: GebouwPageProps) {
  const navigate = usePageNavigation();
  const [animate, setAnimate] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [formData, setFormData] = useState<WonenFormData>({
    name: "",
    email: "",
    phone: "",
    interestedProject: "",
    message: "",
    agreed: false,
  });

  // Parallax for hero image
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
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

  // Hero image parallax (same as AerialParallax — progress-based -10% to +10%)
  useEffect(() => {
    const section = heroSectionRef.current;
    const img = heroImgRef.current;
    if (!section || !img) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const rect = section!.getBoundingClientRect();
          const viewH = window.innerHeight;
          const progress = Math.max(
            0,
            Math.min(1, (viewH - rect.top) / (viewH + rect.height))
          );
          const translate = (progress - 0.5) * 20;
          img!.style.transform = `translateY(${translate}%)`;
          ticking = false;
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitFormSubmission({
        formType: "gebouw_wonen",
        sourceLabel: `Woningen beschikbaar - ${project.name}`,
        ...formData,
        projectName: project.name,
        projectSlug: project.slug,
        pageUrl: window.location.href,
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
    }
  };

  // Build detail lines array for staggered animation. Empty fields are
  // omitted so editors see exactly what they've entered in Sanity.
  const detailLines: string[] = [];
  if (project.wonenBeschikbaar) {
    const wonenSize = project.wonenSize || project.size;
    [project.address, project.status, wonenSize, project.epc].forEach((v) => {
      if (v) detailLines.push(v);
    });
  } else {
    [
      project.address,
      project.type,
      project.status,
      project.size,
      project.breeam,
      project.epc,
    ].forEach((v) => {
      if (v) detailLines.push(v);
    });
  }

  const partnerLines: string[] = [];
  if (project.partners) partnerLines.push(project.partners);
  if (project.year) partnerLines.push(project.year);

  const BASE_DETAIL_DELAY = 0.35;
  const DETAIL_STAGGER = 0.06;

  return (
    <section className="bg-off-white min-h-screen">
      {/* ─── Terug naar overzicht ─── */}
      <div className="pt-[18.889vw] pl-[2.361vw] max-md:pt-[24vw] max-md:px-5">
        <a
          href="/portefeuille"
          onClick={(e) => navigate(e, "/portefeuille")}
          className="link-underline font-body font-medium text-[1.389vw] leading-normal text-off-black pb-[0.347vw] max-md:text-[14px] max-md:pb-1"
          style={{
            opacity: animate ? 1 : 0,
            transition: animate
              ? "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
              : "none",
          }}
        >
          Terug naar overzicht
        </a>
      </div>

      {/* ─── Hero: Name + Tagline ─── */}
      <div className="pt-[3.889vw] px-[2.431vw] max-md:pt-4 max-md:px-5">
        <div className="grid grid-cols-2 gap-x-[2.431vw] max-md:grid-cols-1 max-md:gap-x-0 max-md:gap-y-2">
          {/* Project name — mask-slide */}
          <div className="overflow-hidden">
            <h1
              className="font-body font-medium text-[4.931vw] leading-[1.1] tracking-[-0.099vw] text-off-black will-change-transform max-md:text-[36px] max-md:tracking-[-0.72px]"
              style={{
                transform: animate ? "translateY(0)" : "translateY(110%)",
                transition: animate
                  ? "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s"
                  : "none",
              }}
            >
              {project.name}
            </h1>
          </div>
          {/* Tagline — line-by-line mask reveal */}
          <LineSplit
            animate={animate}
            delay={0.25}
            className="font-heading font-normal text-[4.931vw] leading-[1.1] tracking-[-0.099vw] text-off-black max-md:text-[36px] max-md:tracking-[-0.72px]"
          >
            {project.tagline}
          </LineSplit>
        </div>
      </div>

      {/* ─── Details block — left-aligned with tagline at 50% ─── */}
      <div className="px-[2.431vw] mt-[12.292vw] max-md:mt-10 max-md:px-5">
        <div className="grid grid-cols-2 max-md:grid-cols-1 max-md:gap-6">
          {/* Left column — wonen pill or empty */}
          <div className="flex flex-col justify-end">
            {project.wonenBeschikbaar && (
              <div className="overflow-hidden max-md:mt-0">
                <div
                  className="will-change-transform"
                  style={{
                    transform: animate ? "translateY(0)" : "translateY(110%)",
                    transition: animate
                      ? "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.35s"
                      : "none",
                  }}
                >
                  <span className="inline-block bg-green text-off-white font-heading font-normal text-[1.181vw] tracking-[-0.024vw] px-[1.667vw] py-[0.694vw] rounded-full max-md:text-[15px] max-md:px-6 max-md:py-2">
                    Woningen beschikbaar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right column — details, left-aligned at same 50% as tagline */}
          <div className="flex gap-[8.333vw] max-md:flex-col max-md:gap-4">
            {/* Main details column */}
            <div className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px]">
              {detailLines.map((line, i) => (
                <DetailLine
                  key={i}
                  animate={animate}
                  delay={BASE_DETAIL_DELAY + i * DETAIL_STAGGER}
                >
                  {line}
                </DetailLine>
              ))}
            </div>
            {/* Partners / year column — aligned at bottom */}
            <div className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px] flex flex-col justify-end max-md:justify-start">
              {partnerLines.map((line, i) => (
                <DetailLine
                  key={i}
                  animate={animate}
                  delay={BASE_DETAIL_DELAY + (detailLines.length - partnerLines.length + i) * DETAIL_STAGGER}
                >
                  {line}
                </DetailLine>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero image — clip-path reveal + parallax ─── */}
      <div className="px-[2.361vw] mt-[4.861vw] max-md:px-5 max-md:mt-6">
        <div
          ref={heroSectionRef}
          className="relative w-full h-[52.083vw] overflow-hidden max-md:h-[70vw]"
          style={{
            clipPath: animate ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
            transition: animate
              ? "clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.05s"
              : "none",
          }}
        >
          {project.heroVideoUrl ? (
            <VimeoBackground url={project.heroVideoUrl} poster={project.heroImage} />
          ) : (
            <Image
              ref={heroImgRef}
              src={project.heroImage}
              alt={project.name}
              width={2400}
              height={1800}
              sizes="95vw"
              className="absolute inset-0 w-full h-[120%] object-cover will-change-transform"
              style={{ transform: "translateY(-10%)" }}
              priority
            />
          )}
        </div>
      </div>

      {/* ─── Over het project ─── */}
      <div className="px-[2.361vw] mt-[4.861vw] max-md:px-5 max-md:mt-8">
        <div className="grid grid-cols-12 gap-[1.389vw] max-md:grid-cols-1 max-md:gap-6">
          {/* Label */}
          <div className="col-span-4 max-md:col-span-1">
            <p className="font-body font-medium text-[1.389vw] leading-normal text-off-black max-md:text-[17px]">
              Over het project
            </p>
          </div>
          {/* Description col 1 */}
          <div className="col-span-4 max-md:col-span-1">
            <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px]">
              {project.descriptionLeft}
            </p>
          </div>
          {/* Description col 2 */}
          <div className="col-span-4 max-md:col-span-1">
            <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px]">
              {project.descriptionRight}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Full-width image ─── */}
      <div className="px-[2.431vw] mt-[6.944vw] max-md:px-5 max-md:mt-8">
        <div className="relative w-full h-[52.153vw] overflow-hidden max-md:h-[70vw]">
          <Image
            src={project.fullWidthImage}
            alt={`${project.name} overzicht`}
            fill
            sizes="95vw"
            className="object-cover"
            quality={100}
          />
        </div>
      </div>

      {/* ─── Image gallery ───
          Exactly 2 images → keep the original two-column layout (stacks on mobile).
          3 or more       → switch to a horizontal scroll-snap carousel. */}
      {project.smallImages.length === 2 ? (
        <div className="px-[2.431vw] mt-[1.389vw] flex gap-[1.389vw] max-md:px-5 max-md:mt-3 max-md:flex-col max-md:gap-3">
          <div className="relative flex-1 h-[31.111vw] overflow-hidden max-md:h-[60vw]">
            <Image
              src={project.smallImages[0]}
              alt={`${project.name} detail 1`}
              fill
              sizes="(max-width: 768px) 100vw, 47vw"
              className="object-cover"
              quality={100}
            />
          </div>
          <div className="relative flex-1 h-[31.042vw] overflow-hidden max-md:h-[60vw]">
            <Image
              src={project.smallImages[1]}
              alt={`${project.name} detail 2`}
              fill
              sizes="(max-width: 768px) 100vw, 47vw"
              className="object-cover"
              quality={100}
            />
          </div>
        </div>
      ) : project.smallImages.length > 2 ? (
        <GebouwImageCarousel images={project.smallImages} projectName={project.name} />
      ) : null}

      {/* ─── Google Map ─── */}
      <div className="px-[2.431vw] mt-[4.167vw] max-md:px-5 max-md:mt-6">
        <div className="relative w-full h-[53.194vw] overflow-hidden max-md:h-[80vw]">
          <GebouwMap
            lat={project.mapCoordinates.lat}
            lng={project.mapCoordinates.lng}
            projectName={project.name}
          />
        </div>
      </div>

      {/* ─── Quote section (non-wonen) OR Contact form (wonen) ─── */}
      {project.wonenBeschikbaar ? (
        <WonenFormSection
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          submitState={submitState}
          submitMessage={submitMessage}
        />
      ) : (
        <QuoteSection project={project} />
      )}

      {/* ─── Bottom: Terug naar overzicht ─── */}
      <div className="pl-[2.361vw] pb-[5.833vw] max-md:px-5 max-md:pb-10">
        <a
          href="/portefeuille"
          onClick={(e) => navigate(e, "/portefeuille")}
          className="link-underline font-body font-medium text-[1.389vw] leading-normal text-off-black pb-[0.347vw] max-md:text-[14px] max-md:pb-1"
        >
          Terug naar overzicht
        </a>
      </div>
    </section>
  );
}

/* ─── Quote section — blue background with scroll-triggered line animation ─── */
function QuoteSection({ project }: { project: GebouwProject }) {
  const hasTestimonial = Boolean(project.quote);
  return (
    <>
      {hasTestimonial && (
        <div className="mt-[4.167vw] bg-blue py-[11.528vw] px-[2.431vw] max-md:mt-6 max-md:py-16 max-md:px-5">
          <div className="flex flex-col items-center">
            <ScrollHeroLineSplit
              text={project.quote!}
              tag="p"
              delay={0.15}
              stagger={0.08}
              className="font-heading font-normal text-[4.028vw] leading-[4.097vw] text-off-white text-center max-w-[70.139vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none"
            />
            {project.quoteAuthorImage && (
              <div className="relative w-[14.583vw] h-[18.403vw] overflow-hidden mt-[4.167vw] max-md:w-[140px] max-md:h-[180px] max-md:mt-8">
                <Image
                  src={project.quoteAuthorImage}
                  alt={project.quoteAuthor || ""}
                  fill
                  sizes="(max-width: 768px) 140px, 14.583vw"
                  className="object-cover"
                />
              </div>
            )}
            {project.quoteAuthor && (
              <p className="font-heading font-normal text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-white mt-[1.528vw] max-md:text-[17px] max-md:mt-3">
                {project.quoteAuthor}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-[2.431vw] mt-[8.125vw] pb-[16.875vw] max-md:px-5 max-md:mt-16 max-md:pb-16">
        <CTASection
          label="Neem contact op"
          linkText="Naar de contactpagina"
          linkHref="/contact"
          labelClassName="pl-[8.333vw] max-md:pl-0"
          headingClassName="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[62.569vw] mb-[2.778vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none max-md:mb-6"
        >
          Heeft u een vraag over dit project of wilt u meer informatie over onze
          werkzaamheden? Stuur een email naar{" "}
          <a
            href="mailto:info@weverskade.com"
            className="text-off-black underline decoration-solid"
          >
            info@weverskade.com
          </a>{" "}
          of klik op onderstaande link.
        </CTASection>
      </div>
    </>
  );
}

/* ─── Wonen form section ─── */
function WonenFormSection({
  onSubmit,
  formData,
  setFormData,
  submitState,
  submitMessage,
}: {
  onSubmit: (e: React.FormEvent) => void;
  formData: WonenFormData;
  setFormData: React.Dispatch<React.SetStateAction<WonenFormData>>;
  submitState: "idle" | "submitting" | "success" | "error";
  submitMessage: string;
}) {
  return (
    <div className="px-[2.431vw] mt-[8.125vw] pb-[16.875vw] max-md:px-5 max-md:mt-16 max-md:pb-16">
      <div className="flex items-start max-md:flex-col max-md:gap-4">
        <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black shrink-0 w-[31.458vw] pl-[8.333vw] max-md:w-auto max-md:text-[17px] max-md:pl-0">
          Woningen beschikbaar
        </p>
        <div className="flex-1 max-md:w-full">
          <h2 className="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[54.931vw] mb-[2.778vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none max-md:mb-6">
            Er zijn momenteel woningen beschikbaar voor dit project. Interesse?
            Vul dan onderstaand formulier in.
          </h2>

          <form onSubmit={onSubmit} className="max-w-[46.944vw] max-md:max-w-none">
            <div className="grid grid-cols-2 gap-x-[2.431vw] gap-y-[2.083vw] max-md:grid-cols-1 max-md:gap-y-6">
              {/* Name */}
              <div>
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
              </div>
              {/* Email */}
              <div>
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
              </div>
              {/* Phone */}
              <div>
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
              </div>
              {/* Project interest */}
              <div>
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
            </div>

            {/* Message */}
            <div className="mt-[2.083vw] max-md:mt-6">
              <textarea
                name="message"
                placeholder="Eventuele vraag of opmerking"
                value={formData.message}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, message: e.target.value }))
                }
                rows={4}
                className="w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.319vw] text-off-black placeholder:text-off-black outline-none resize-none max-md:text-[15px] max-md:pb-2"
              />
            </div>

            {/* Checkbox + Submit */}
            <div className="flex items-start justify-between mt-[2.083vw] max-md:flex-col max-md:gap-6 max-md:mt-6">
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
                  Ik ga akkoord met het{" "}
                  <a href="/privacybeleid" className="underline decoration-solid">
                    privacybeleid
                  </a>{" "}
                  en het gebruiken van mijn gegevens gebruiken om contact met op
                  te nemen.
                </span>
              </label>
              <button
                type="submit"
                disabled={submitState === "submitting"}
                className="bg-green text-off-white font-heading font-normal text-[1.181vw] tracking-[-0.024vw] px-[1.667vw] py-[0.694vw] rounded-full cursor-pointer border-none max-md:text-[15px] max-md:px-6 max-md:py-2.5"
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
