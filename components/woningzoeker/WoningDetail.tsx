"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import TurnstileWidget, {
  isTurnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { submitFormSubmission } from "@/lib/formSubmissionClient";
import { STATUS_META, formatHuur, type Woning } from "@/data/woningzoeker";

interface WoningDetailProps {
  woning: Woning;
  projectName: string;
  projectSlug: string;
  onClose: () => void;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[1vw] border-b border-off-black/10 py-[0.55vw] max-lg:gap-4 max-lg:py-2">
      <dt className="font-body text-[0.9vw] font-normal text-off-black/50 max-lg:text-[13px]">
        {label}
      </dt>
      <dd className="text-right font-body text-[0.95vw] font-medium text-off-black max-lg:text-[14px]">
        {value}
      </dd>
    </div>
  );
}

export default function WoningDetail({
  woning,
  projectName,
  projectSlug,
  onClose,
}: WoningDetailProps) {
  const meta = STATUS_META[woning.status];
  const isBeschikbaar = woning.status === "beschikbaar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    agreed: false,
  });
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await submitFormSubmission({
        formType: "woningzoeker",
        sourceLabel: `Woningzoeker - ${projectName} ${woning.nummer}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        agreed: formData.agreed,
        interestedProject: `${woning.nummer} - ${woning.woningType}`,
        projectName,
        projectSlug,
        pageUrl: window.location.href,
        turnstileToken,
      });
      setFormData({ name: "", email: "", phone: "", message: "", agreed: false });
      setSubmitState("success");
      setSubmitMessage(
        `Bedankt, je interesse in ${woning.nummer} is doorgegeven.`
      );
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Het formulier kon niet worden verstuurd."
      );
    } finally {
      // Een Turnstile-token is eenmalig; na elke poging een nieuwe aanvragen.
      setTurnstileToken("");
      turnstileRef.current?.reset();
    }
  };

  const inputClass =
    "w-full border-b border-off-black/30 bg-transparent pb-[0.5vw] font-body text-[0.95vw] font-medium text-off-black outline-none placeholder:text-off-black/40 focus-visible:border-off-black max-lg:pb-2 max-lg:text-[15px]";

  return (
    <div>
      {/* ─── Kop ─── */}
      <button
        type="button"
        onClick={onClose}
        className="link-underline mb-[1.2vw] font-body text-[0.9vw] font-medium text-off-black/60 max-lg:mb-5 max-lg:text-[13px]"
      >
        ← Terug naar alle woningen
      </button>

      <div className="flex items-start justify-between gap-[1vw] max-lg:gap-4">
        <div>
          <h3 className="font-body text-[2.2vw] font-medium leading-[1.1] text-off-black max-lg:text-[28px]">
            {woning.nummer}
          </h3>
          <p className="mt-[0.2vw] font-heading text-[1.1vw] font-normal leading-tight text-off-black/60 max-lg:mt-1 max-lg:text-[16px]">
            {woning.woningType}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-[0.9vw] py-[0.4vw] font-heading text-[0.85vw] font-normal max-lg:px-3.5 max-lg:py-1.5 max-lg:text-[12px]"
          style={{ backgroundColor: meta.color, color: meta.textOnColor }}
        >
          {meta.label}
        </span>
      </div>

      {/* ─── Plattegrond ─── */}
      {woning.plattegrond ? (
        <div className="relative mt-[1.2vw] aspect-[4/3] w-full overflow-hidden border border-off-black/12 max-lg:mt-5">
          <Image
            src={woning.plattegrond}
            alt={`Plattegrond ${woning.nummer}`}
            fill
            sizes="(max-width: 768px) 100vw, 32vw"
            className="object-contain"
          />
        </div>
      ) : null}

      {/* ─── Specificaties ─── */}
      <dl className="mt-[1.2vw] max-lg:mt-5">
        <SpecRow label="Oppervlakte" value={`${woning.oppervlakte} m²`} />
        <SpecRow label="Slaapkamers" value={String(woning.slaapkamers)} />
        <SpecRow
          label="Verdieping"
          value={woning.verdieping === 0 ? "Begane grond" : `${woning.verdieping}e`}
        />
        {woning.orientatie ? (
          <SpecRow label="Oriëntatie" value={woning.orientatie} />
        ) : null}
        {woning.buitenruimte ? (
          <SpecRow label="Buitenruimte" value={woning.buitenruimte} />
        ) : null}
        <SpecRow
          label="Huurprijs"
          value={`${formatHuur(woning.huurprijs)} per maand`}
        />
      </dl>

      {/* ─── Interesseformulier ─── */}
      {isBeschikbaar ? (
        <div className="mt-[1.8vw] max-lg:mt-8">
          <h4 className="font-body text-[1.3vw] font-medium leading-tight text-off-black max-lg:text-[19px]">
            Interesse in deze woning?
          </h4>
          <p className="mt-[0.35vw] font-body text-[0.9vw] font-normal leading-snug text-off-black/55 max-lg:mt-1.5 max-lg:text-[13px]">
            Laat je gegevens achter, dan nemen we contact met je op over{" "}
            {woning.nummer}.
          </p>

          <form onSubmit={handleSubmit} className="mt-[1.2vw] max-lg:mt-5">
            <div className="grid grid-cols-2 gap-x-[1.2vw] gap-y-[1.2vw] max-lg:grid-cols-1 max-lg:gap-y-5">
              <input
                type="text"
                name="name"
                placeholder="Naam"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className={inputClass}
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
                className={inputClass}
              />
            </div>

            <input
              type="tel"
              name="phone"
              placeholder="Telefoonnummer"
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value }))
              }
              className={`${inputClass} mt-[1.2vw] max-lg:mt-5`}
            />

            <textarea
              name="message"
              placeholder="Eventuele vraag of opmerking"
              rows={3}
              value={formData.message}
              onChange={(e) =>
                setFormData((p) => ({ ...p, message: e.target.value }))
              }
              className={`${inputClass} mt-[1.2vw] resize-none max-lg:mt-5`}
            />

            <TurnstileWidget
              ref={turnstileRef}
              action="woningzoeker"
              onVerify={setTurnstileToken}
              className="mt-[1.2vw] max-lg:mt-5"
            />

            <label className="mt-[1.2vw] flex cursor-pointer items-start gap-[0.55vw] max-lg:mt-5 max-lg:gap-3">
              <input
                type="checkbox"
                name="agreed"
                required
                checked={formData.agreed}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, agreed: e.target.checked }))
                }
                className="mt-[0.2vw] h-[0.75vw] w-[0.75vw] shrink-0 cursor-pointer appearance-none border border-off-black checked:border-green checked:bg-green max-lg:mt-0.5 max-lg:h-4 max-lg:w-4"
              />
              <span className="font-body text-[0.78vw] font-normal leading-snug text-off-black/70 max-lg:text-[11px]">
                Ik ga akkoord met het{" "}
                <a href="/privacybeleid" className="underline decoration-solid">
                  privacybeleid
                </a>{" "}
                en het gebruiken van mijn gegevens om contact met mij op te nemen.
              </span>
            </label>

            <button
              type="submit"
              disabled={
                submitState === "submitting" ||
                (isTurnstileEnabled && !turnstileToken)
              }
              className="mt-[1.2vw] cursor-pointer rounded-full border-none bg-green px-[1.5vw] py-[0.65vw] font-heading text-[1vw] font-normal tracking-[-0.02vw] text-off-white disabled:cursor-not-allowed disabled:opacity-40 max-lg:mt-5 max-lg:px-6 max-lg:py-2.5 max-lg:text-[15px]"
            >
              {submitState === "submitting"
                ? "Versturen..."
                : "Interesse doorgeven"}
            </button>

            {submitMessage ? (
              <p
                className={`mt-[0.8vw] font-body text-[0.85vw] leading-snug max-lg:mt-3 max-lg:text-[13px] ${
                  submitState === "error" ? "text-red-700" : "text-green"
                }`}
                role="status"
              >
                {submitMessage}
              </p>
            ) : null}
          </form>
        </div>
      ) : (
        <div className="mt-[1.8vw] border border-off-black/15 p-[1.2vw] max-lg:mt-8 max-lg:p-5">
          <p className="font-body text-[0.95vw] font-medium leading-snug text-off-black max-lg:text-[14px]">
            {woning.status === "in-optie"
              ? "Deze woning is momenteel in optie."
              : "Deze woning is verhuurd."}
          </p>
          <p className="mt-[0.35vw] font-body text-[0.9vw] font-normal leading-snug text-off-black/55 max-lg:mt-1.5 max-lg:text-[13px]">
            Bekijk de beschikbare woningen in het overzicht, of neem contact op
            voor de wachtlijst.
          </p>
        </div>
      )}
    </div>
  );
}
