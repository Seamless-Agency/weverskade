"use client";

import { useRef, useState } from "react";
import TurnstileWidget, {
  isTurnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { submitFormSubmission } from "@/lib/formSubmissionClient";
import { ChevronIcon } from "@/components/wonenbij/icons";

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
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);

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

  const veldClass =
    "w-full bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.042vw] text-off-black placeholder:text-off-black outline-none max-md:text-[15px] max-md:pb-2";

  return (
    <section
      id="inschrijven"
      className="bg-off-white py-[9.028vw] max-md:py-14"
      data-nav-theme="light"
    >
      <div className="flex items-start px-[2.431vw] max-md:flex-col max-md:px-5 max-md:gap-4">
        <p className="shrink-0 w-[30.903vw] font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black max-md:w-auto max-md:text-[17px]">
          {label}
        </p>
        <div className="flex-1 max-md:w-full">
          <h2 className="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[51.528vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none">
            {heading}
          </h2>
          <p className="mt-[1.667vw] max-w-[47.153vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.016vw] text-off-black max-md:mt-4 max-md:max-w-none max-md:text-[16px] max-md:leading-[23px]">
            {intro}
          </p>

          <form onSubmit={handleSubmit} className="mt-[3.472vw] max-w-[46.944vw] max-md:mt-8 max-md:max-w-none">
            {/* Voorkeursveld tussen twee lijnen, zoals in het design */}
            <div className="border-y border-off-black/60 py-[1.111vw] max-md:py-3">
              <label className="block font-body font-semibold text-[1.042vw] text-off-black max-md:text-[14px]">
                {voorkeurLabel}
              </label>
              <div className="relative mt-[0.417vw] max-md:mt-1">
                <select
                  name="voorkeur"
                  value={form.voorkeur}
                  onChange={(e) => set("voorkeur", e.target.value)}
                  className="w-full appearance-none bg-transparent font-body font-medium text-[1.042vw] text-off-black outline-none cursor-pointer max-md:text-[14px]"
                >
                  <option value="">Geen voorkeur</option>
                  {voorkeurOpties.map((optie) => (
                    <option key={optie} value={optie}>
                      {optie}
                    </option>
                  ))}
                </select>
                <ChevronIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[1.111vw] h-auto text-off-black max-md:w-[13px]" />
              </div>
            </div>

            <div className="mt-[2.639vw] grid grid-cols-2 gap-x-[1.389vw] gap-y-[2.431vw] max-md:mt-6 max-md:grid-cols-1 max-md:gap-y-6">
              <input
                type="text"
                name="voornaam"
                placeholder="Voornaam"
                required
                value={form.voornaam}
                onChange={(e) => set("voornaam", e.target.value)}
                className={veldClass}
              />
              <input
                type="text"
                name="achternaam"
                placeholder="Achternaam"
                required
                value={form.achternaam}
                onChange={(e) => set("achternaam", e.target.value)}
                className={veldClass}
              />
              <input
                type="email"
                name="email"
                placeholder="E-mailadres"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={veldClass}
              />
              <input
                type="tel"
                name="telefoon"
                placeholder="Telefoonnummer"
                value={form.telefoon}
                onChange={(e) => set("telefoon", e.target.value)}
                className={veldClass}
              />
              <input
                type="text"
                name="leeftijd"
                inputMode="numeric"
                placeholder="Leeftijd"
                value={form.leeftijd}
                onChange={(e) => set("leeftijd", e.target.value)}
                className={veldClass}
              />
              <input
                type="text"
                name="beroep"
                placeholder="Werkgever / beroep"
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
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              rows={3}
              className={`mt-[2.431vw] resize-none max-md:mt-6 ${veldClass}`}
            />

            <TurnstileWidget
              ref={turnstileRef}
              action="wonenbij-inschrijving"
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
                  onChange={(e) => set("agreed", e.target.checked)}
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent border-b border-off-black pb-[0.694vw] font-body font-medium text-[1.042vw] text-off-black outline-none cursor-pointer max-md:text-[15px] max-md:pb-2"
      >
        <option value="">{placeholder}</option>
        {opties.map((optie) => (
          <option key={optie} value={optie}>
            {optie}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-0 top-[30%] w-[1.111vw] h-auto text-off-black max-md:w-[13px]" />
    </div>
  );
}
