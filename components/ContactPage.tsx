"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LineSplit from "@/components/LineSplit";
import { submitFormSubmission } from "@/lib/formSubmissionClient";

const DEFAULT_INTRO_TEXT =
  "We gaan graag in gesprek over projecten, samenwerkingen of andere vragen. Neem gerust contact met ons op.";

interface ContactPageData {
  heroTitle?: string;
  heroImage?: string;
  introText?: string;
  contactItems?: { label: string; value: string; linkUrl?: string }[];
}

export default function ContactPage({ data }: { data?: ContactPageData } = {}) {
  const [animate, setAnimate] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitFormSubmission({
        formType: "contact",
        sourceLabel: "Contactpagina",
        name: formData.name,
        email: formData.email,
        message: formData.message,
        pageUrl: window.location.href,
      });
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      setSubmitState("success");
      setSubmitMessage("Bedankt, uw bericht is verstuurd.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Het formulier kon niet worden verstuurd."
      );
    }
  };

  return (
    <section className="bg-off-white min-h-screen">
      {/* Title — Figma: x=35, y=351 */}
      <div className="pt-[24.375vw] pl-[2.431vw] max-md:pt-[28vw] max-md:pl-5">
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
            {data?.heroTitle ?? "Contact"}
          </h1>
        </div>
      </div>

      {/* Content area — image sits absolute left, everything else flows right */}
      <div className="relative mt-[9.375vw] max-md:mt-8 max-md:px-5">
        {/* Image — Figma: x=35, w=451, h=677 — clip-path reveal */}
        <div className="absolute left-[2.431vw] top-0 w-[31.319vw] max-md:relative max-md:left-auto max-md:w-full max-md:mb-8">
          <div
            className="relative w-full h-[47.014vw] overflow-hidden max-md:h-[100vw] will-change-[clip-path]"
            style={{
              clipPath: animate ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
              transition: animate
                ? "clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.05s"
                : "none",
            }}
          >
            <Image
              src={data?.heroImage ?? "/images/contact-team.webp"}
              alt="Team Weverskade"
              fill
              sizes="(max-width: 768px) 100vw, 31.319vw"
              className="object-cover will-change-transform"
              style={{
                transform: animate ? "scale(1)" : "scale(1.2)",
                transition: animate
                  ? "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s"
                  : "none",
              }}
            />
          </div>
        </div>

        {/* Right column — all content at calc(41.67%+14px) = 42.639vw */}
        <div className="pl-[42.639vw] pr-[2.431vw] max-md:pl-0 max-md:pr-0">
          {/* Intro text — Figma: 38px, leading=38px, w=790 */}
          <LineSplit
            animate={animate}
            delay={0.2}
            stagger={0.06}
            className="font-body font-medium text-[2.639vw] leading-[2.639vw] text-off-black w-[54.861vw] max-md:text-[24px] max-md:leading-[28px] max-md:w-full"
          >
            {data?.introText ?? DEFAULT_INTRO_TEXT}
          </LineSplit>

          {/* Form — Figma: fields 444px (30.833vw) wide */}
          <form className="mt-[2.5vw] max-md:mt-6" onSubmit={handleSubmit}>
            {/* Uw naam */}
            <div
              className="will-change-transform"
              style={{
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                transition: animate
                  ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.45s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.45s"
                  : "none",
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Uw naam"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-[30.833vw] max-md:w-full bg-transparent border-b border-off-black/20 pb-[0.694vw] max-md:pb-2 font-heading font-normal text-[1.25vw] max-md:text-[16px] text-off-black placeholder:text-off-black outline-none block"
              />
            </div>

            {/* Email */}
            <div
              className="mt-[1.042vw] max-md:mt-3 will-change-transform"
              style={{
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                transition: animate
                  ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s"
                  : "none",
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-[30.833vw] max-md:w-full bg-transparent border-b border-off-black/20 pb-[0.694vw] max-md:pb-2 font-heading font-normal text-[1.25vw] max-md:text-[16px] text-off-black placeholder:text-off-black outline-none block"
              />
            </div>

            {/* Vraag of opmerking */}
            <div
              className="mt-[0.625vw] max-md:mt-3 will-change-transform"
              style={{
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                transition: animate
                  ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.65s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.65s"
                  : "none",
              }}
            >
              <textarea
                name="message"
                placeholder="Vraag of opmerking"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={3}
                className="w-[30.833vw] max-md:w-full bg-transparent border-b border-off-black/20 pb-[0.694vw] max-md:pb-2 font-heading font-normal text-[1.25vw] max-md:text-[16px] text-off-black placeholder:text-off-black outline-none resize-none block"
              />
            </div>

            {/* Verzenden — Figma: at calc(75%-2px) from page = 74.861vw */}
            <div
              className="mt-[0.694vw] max-md:mt-4 will-change-transform"
              style={{
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                transition: animate
                  ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.75s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.75s"
                  : "none",
              }}
            >
              <div className="w-[30.833vw] flex justify-end max-md:w-full">
                <button
                  type="submit"
                  disabled={submitState === "submitting"}
                  className="bg-off-black text-off-white font-heading font-normal text-[1.25vw] max-md:text-[16px] px-[1.389vw] py-[0.417vw] max-md:px-5 max-md:py-2 cursor-pointer border-none"
                >
                  {submitState === "submitting" ? "Versturen..." : "Verzenden"}
                </button>
              </div>
            </div>
            {submitMessage ? (
              <p
                className={`mt-4 w-[30.833vw] max-md:w-full font-body text-[0.972vw] leading-[1.25] max-md:text-[13px] ${
                  submitState === "error" ? "text-red-700" : "text-off-black"
                }`}
              >
                {submitMessage}
              </p>
            ) : null}
          </form>

          {/* Contact info — inside right column, Figma: y=1040, gap from form ~77px */}
          <div className="mt-[5.347vw] max-md:mt-12">
            <div className="grid grid-cols-3 gap-x-[1.389vw] max-md:grid-cols-1 max-md:gap-y-8">
              {/* Bezoek ons */}
              <div
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                  transition: animate
                    ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.85s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.85s"
                    : "none",
                }}
              >
                <p className="font-heading font-normal text-[1.389vw] leading-normal text-off-black mb-[4.236vw] max-md:text-[17px] max-md:mb-4">
                  Bezoek ons
                </p>
                <div className="font-body font-medium text-[1.181vw] leading-[1.458vw] text-off-black max-md:text-[14px] max-md:leading-[20px]">
                  <p>Cornelis van der Lelylaan 4</p>
                  <p>3147 PB Maassluis</p>
                  <p>Netherlands</p>
                </div>
              </div>

              {/* Neem contact op */}
              <div
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                  transition: animate
                    ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.95s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.95s"
                    : "none",
                }}
              >
                <p className="font-heading font-normal text-[1.389vw] leading-normal text-off-black mb-[4.236vw] max-md:text-[17px] max-md:mb-4">
                  Neem contact op
                </p>
                <div className="font-body font-medium text-[1.181vw] leading-[1.458vw] text-off-black max-md:text-[14px] max-md:leading-[20px]">
                  <p>+31 (0)10 599 6300</p>
                  <p>info@weverskade.com</p>
                  <p>Onze LinkedIn pagina</p>
                </div>
              </div>

              {/* Werken bij */}
              <div
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? "translateY(0)" : "translateY(1.389vw)",
                  transition: animate
                    ? "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.05s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.05s"
                    : "none",
                }}
              >
                <p className="font-heading font-normal text-[1.389vw] leading-normal text-off-black mb-[4.236vw] max-md:text-[17px] max-md:mb-4">
                  Werken bij
                </p>
                <div className="font-body font-medium text-[1.181vw] leading-[1.458vw] text-off-black max-md:text-[14px] max-md:leading-[20px]">
                  <p>werkenbij@weverskade.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="pb-[11.111vw] max-md:pb-16" />
    </section>
  );
}
