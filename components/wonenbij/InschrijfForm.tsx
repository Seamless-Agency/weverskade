"use client";

import { useEffect, useId, useRef, useState } from "react";
import TurnstileWidget, {
  isTurnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { submitFormSubmission } from "@/lib/formSubmissionClient";
import { ChevronIcon } from "@/components/wonenbij/icons";
import { Reveal, RevealWords } from "@/components/wonenbij/motion";

const INKOMEN_OPTIES = [
  "Tot €40.000",
  "€40.000 - €60.000",
  "€60.000 - €80.000",
  "€80.000 - €100.000",
  "Meer dan €100.000",
  "Zeg ik liever niet",
];

const GEZIN_OPTIES = [
  "Alleenstaand",
  "Samenwonend / stel",
  "Gezin met kinderen",
  "Anders",
];

interface InschrijfFormProps {
  /** "project" (wit, ruime onderrand) of "woning" (off-white, terugknop volgt). */
  variant?: "project" | "woning";
  /** Kleine kop linksboven de sectie. */
  label?: string;
  heading: string;
  intro: string;
  projectName: string;
  projectSlug: string;
  /** Opties voor het voorkeursveld (woningtypes of specifieke woningen). */
  voorkeurOpties: string[];
  /** Kop boven het voorkeursveld. */
  voorkeurLabel?: string;
  /** Vooraf geselecteerde voorkeur (vanaf de woningpagina of render). */
  voorkeurPreselect?: string;
}

/**
 * Het uitgebreide inschrijfformulier uit de Figma-frames: voorkeurstype
 * plus persoonsgegevens (leeftijd, werkgever, inkomen, gezinssamenstelling).
 */
export default function InschrijfForm({
  variant = "project",
  label = "Vrijblijvend inschrijven",
  heading,
  intro,
  projectName,
  projectSlug,
  voorkeurOpties,
  voorkeurLabel = "Selecteer voorkeurstype woning",
  voorkeurPreselect,
}: InschrijfFormProps) {
  const [form, setForm] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    telefoon: "",
    leeftijd: "",
    beroep: "",
    inkomen: "",
    gezin: "",
    voorkeur: voorkeurPreselect ?? "",
    message: "",
    agreed: false,
  });

  // De preselectie kan ná de eerste render binnenkomen (?woning= wordt
  // client-side gelezen op de statische typepagina). Volg die wijziging
  // alleen zolang de bezoeker het veld zelf nog niet heeft aangepast.
  const vorigePreselect = useRef(voorkeurPreselect ?? "");
  useEffect(() => {
    const nieuw = voorkeurPreselect ?? "";
    if (nieuw === vorigePreselect.current) return;
    setForm((f) =>
      f.voorkeur === vorigePreselect.current ? { ...f, voorkeur: nieuw } : f
    );
    vorigePreselect.current = nieuw;
  }, [voorkeurPreselect]);

  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileFout, setTurnstileFout] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const turnstileHintId = useId();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitFormSubmission({
        formType: "wonenbij_inschrijving",
        sourceLabel: `Inschrijving - ${projectName}`,
        name: `${form.voornaam} ${form.achternaam}`.trim(),
        email: form.email,
        phone: form.telefoon,
        interestedProject: form.voorkeur,
        age: form.leeftijd,
        occupation: form.beroep,
        householdIncome: form.inkomen,
        householdComposition: form.gezin,
        message: form.message,
        agreed: form.agreed,
        projectName,
        projectSlug,
        pageUrl: window.location.href,
        turnstileToken,
      });
      setForm({
        voornaam: "",
        achternaam: "",
        email: "",
        telefoon: "",
        leeftijd: "",
        beroep: "",
        inkomen: "",
        gezin: "",
        voorkeur: voorkeurPreselect ?? "",
        message: "",
        agreed: false,
      });
      setSubmitState("success");
      setSubmitMessage("Bedankt, uw inschrijving is verstuurd.");
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

  // focus-visible verdubbelt de onderlijn optisch (shadow, geen layoutshift)
  // zodat toetsenbordfocus zichtbaar is ondanks outline-none.
  const veldClass =
    "w-full bg-transparent border-b border-off-black pb-[1.292vw] font-body font-medium text-[1.042vw] leading-[1.208vw] text-off-black placeholder:text-off-black/55 outline-none focus-visible:shadow-[0_1px_0_0_currentColor] max-lg:text-[16px] max-lg:leading-normal max-lg:pt-2 max-lg:pb-3";

  return (
    // Figma projectpagina: op wit, 134 boven het label, 298 onder de knop.
    // Figma woningpagina: op off-white, 212 boven de kop, 137 onder de knop
    // (daar volgt nog een terugknop vóór de footer).
    <section
      id="inschrijven"
      className={`${
        variant === "woning"
          ? "bg-off-white pt-[14.722vw] pb-[9.514vw]"
          : "bg-white pt-[9.306vw] pb-[20.694vw]"
      } max-lg:py-14`}
      data-nav-theme="light"
    >
      <div className="flex items-start pl-[2.569vw] pr-[2.431vw] max-lg:flex-col max-lg:px-5 max-lg:gap-4">
        <Reveal
          as="p"
          className="shrink-0 w-[31.875vw] font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-lg:w-auto max-lg:text-[17px] max-lg:leading-[22px]"
        >
          {label}
        </Reveal>
        <div className="flex-1 max-lg:w-full">
          <h2 className="ml-[0.764vw] font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[51.528vw] max-lg:ml-0 max-lg:text-[28px] max-lg:leading-[32px] max-lg:max-w-none">
            <RevealWords text={heading} />
          </h2>
          <Reveal
            as="p"
            delay={0.15}
            className="mt-[2.361vw] ml-[0.625vw] max-w-[47.153vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.016vw] text-off-black max-lg:mt-4 max-lg:ml-0 max-lg:max-w-none max-lg:text-[16px] max-lg:leading-[23px]"
          >
            {intro}
          </Reveal>

          <Reveal delay={0.25}>
          <form onSubmit={handleSubmit} className="mt-[5.139vw] max-w-[46.944vw] max-lg:mt-8 max-lg:max-w-none">
            {/* Voorkeursveld tussen twee lijnen, zoals in het design */}
            <div className="relative border-y border-off-black pt-[1.736vw] pb-[1.847vw] max-lg:py-3">
              <select
                name="voorkeur"
                aria-label={voorkeurLabel}
                value={form.voorkeur}
                onChange={(e) => set("voorkeur", e.target.value)}
                className={`block w-full h-[1.208vw] appearance-none bg-transparent font-body ${
                  voorkeurPreselect ? "font-semibold" : "font-medium"
                } text-[1.042vw] leading-[1.208vw] text-off-black outline-none focus-visible:shadow-[0_1px_0_0_currentColor] cursor-pointer max-lg:h-11 max-lg:text-[16px] max-lg:leading-normal`}
              >
                <option value="">{voorkeurLabel}</option>
                {voorkeurOpties.map((optie) => (
                  <option key={optie} value={optie}>
                    {optie}
                  </option>
                ))}
              </select>
              <ChevronIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[1.528vw] h-auto text-off-black max-lg:w-[13px]" />
            </div>

            <div className="mt-[1.944vw] grid grid-cols-2 gap-x-[1.389vw] gap-y-[2.014vw] max-lg:mt-6 max-lg:grid-cols-1 max-lg:gap-y-6">
              <input
                type="text"
                name="voornaam"
                placeholder="Voornaam"
                aria-label="Voornaam"
                autoComplete="given-name"
                required
                value={form.voornaam}
                onChange={(e) => set("voornaam", e.target.value)}
                className={veldClass}
              />
              <input
                type="text"
                name="achternaam"
                placeholder="Achternaam"
                aria-label="Achternaam"
                autoComplete="family-name"
                required
                value={form.achternaam}
                onChange={(e) => set("achternaam", e.target.value)}
                className={veldClass}
              />
              <input
                type="email"
                name="email"
                placeholder="E-mailadres"
                aria-label="E-mailadres"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={veldClass}
              />
              <input
                type="tel"
                name="telefoon"
                placeholder="Telefoonnummer"
                aria-label="Telefoonnummer"
                autoComplete="tel"
                value={form.telefoon}
                onChange={(e) => set("telefoon", e.target.value)}
                className={veldClass}
              />
              <input
                type="text"
                name="leeftijd"
                inputMode="numeric"
                placeholder="Leeftijd"
                aria-label="Leeftijd"
                value={form.leeftijd}
                onChange={(e) => set("leeftijd", e.target.value)}
                className={veldClass}
              />
              <input
                type="text"
                name="beroep"
                placeholder="Werkgever / beroep"
                aria-label="Werkgever / beroep"
                value={form.beroep}
                onChange={(e) => set("beroep", e.target.value)}
                className={veldClass}
              />
              <SelectVeld
                name="inkomen"
                placeholder="Bruto huishoudinkomen"
                value={form.inkomen}
                opties={INKOMEN_OPTIES}
                onChange={(v) => set("inkomen", v)}
              />
              <SelectVeld
                name="gezin"
                placeholder="Gezinssamenstelling"
                value={form.gezin}
                opties={GEZIN_OPTIES}
                onChange={(v) => set("gezin", v)}
              />
            </div>

            <textarea
              name="message"
              placeholder="Eventuele vraag of opmerking"
              aria-label="Eventuele vraag of opmerking"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              rows={3}
              className={`mt-[2.222vw] h-[6.528vw] resize-none max-lg:mt-6 max-lg:h-auto ${veldClass}`}
            />

            <TurnstileWidget
              ref={turnstileRef}
              action="wonenbij-inschrijving"
              onVerify={(token) => {
                setTurnstileToken(token);
                if (token) setTurnstileFout(false);
              }}
              onError={() => setTurnstileFout(true)}
              className="mt-[2.014vw] max-lg:mt-6"
            />

            <div className="flex items-start justify-between mt-[1.458vw] max-lg:flex-col max-lg:gap-6 max-lg:mt-6">
              <label className="flex items-start gap-[1.042vw] cursor-pointer max-lg:gap-3">
                <input
                  type="checkbox"
                  name="agreed"
                  required
                  checked={form.agreed}
                  onChange={(e) => set("agreed", e.target.checked)}
                  className="shrink-0 mt-[1.111vw] w-[0.764vw] h-[0.764vw] border border-off-black appearance-none checked:bg-green checked:border-green cursor-pointer focus-visible:outline-2 focus-visible:outline-off-black focus-visible:outline-offset-2 max-lg:w-[16px] max-lg:h-[16px] max-lg:mt-[2px]"
                />
                <span className="mt-[0.764vw] font-body font-normal text-[0.764vw] leading-[0.889vw] text-off-black max-w-[27.431vw] max-lg:mt-0 max-lg:text-[11px] max-lg:leading-normal max-lg:max-w-none">
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
                aria-describedby={
                  isTurnstileEnabled && !turnstileToken
                    ? turnstileHintId
                    : undefined
                }
                className="pill-hover inline-flex items-center justify-center w-[14.722vw] h-[3.194vw] bg-green text-off-white font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] rounded-full cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed max-lg:w-auto max-lg:h-auto max-lg:text-[15px] max-lg:px-6 max-lg:py-3 max-lg:leading-normal"
              >
                {submitState === "submitting"
                  ? "Versturen..."
                  : "Formulier versturen"}
              </button>
            </div>
            {isTurnstileEnabled && !turnstileToken ? (
              <p
                id={turnstileHintId}
                role={turnstileFout ? "alert" : "status"}
                className={`mt-2 font-body font-normal text-[12px] leading-normal ${
                  turnstileFout ? "text-red-700" : "text-off-black/50"
                }`}
              >
                {turnstileFout
                  ? "De beveiligingscheck kon niet worden geladen. Herlaad de pagina of probeer het later opnieuw."
                  : "Beveiligingscheck wordt geladen…"}
              </p>
            ) : null}
            {submitMessage ? (
              <p
                role={submitState === "error" ? "alert" : "status"}
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
    </section>
  );
}

function SelectVeld({
  name,
  placeholder,
  value,
  opties,
  onChange,
}: {
  name: string;
  placeholder: string;
  value: string;
  opties: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full appearance-none bg-transparent border-b border-off-black pb-[1.292vw] font-body font-medium text-[1.042vw] leading-[1.208vw] text-off-black outline-none focus-visible:shadow-[0_1px_0_0_currentColor] cursor-pointer max-lg:text-[16px] max-lg:leading-normal max-lg:pt-2 max-lg:pb-3"
      >
        <option value="">{placeholder}</option>
        {opties.map((optie) => (
          <option key={optie} value={optie}>
            {optie}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-0 top-[30%] w-[1.111vw] h-auto text-off-black max-lg:w-[13px]" />
    </div>
  );
}
