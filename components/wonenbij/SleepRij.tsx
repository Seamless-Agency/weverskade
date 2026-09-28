"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Horizontale sleeprij (MarkUp comment 43: "sleep menu van links naar
 * rechts" voor het woningaanbod). Zelfde bedientaal als de fotocarrousel op
 * de projectpagina (GebouwImageCarousel): slepen met muis of vinger, en een
 * dunne voortgangsbalk eronder die ook klikbaar is.
 *
 * Bewust op native overflow-scroll gebouwd: touch en trackpad krijgen zo
 * gratis momentum en snap; alleen muis-slepen wordt hier zelf afgehandeld.
 * Een sleepbeweging telt niet als klik, zodat kaarten (links) pas navigeren
 * bij een echte klik.
 */
export default function SleepRij({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  /** Toegankelijke naam van de rij, bijv. "Beschikbare woningen". */
  label: string;
  className?: string;
}) {
  const rijRef = useRef<HTMLDivElement>(null);
  const balkRef = useRef<HTMLDivElement>(null);
  const duimRef = useRef<HTMLDivElement>(null);
  const [scrollbaar, setScrollbaar] = useState(false);
  const [sleept, setSleept] = useState(false);
  const sleep = useRef({ actief: false, startX: 0, startScroll: 0, bewogen: false });

  // Voortgangsbalk: breedte = zichtbaar deel, positie = scrollpositie.
  const werkBalkBij = useCallback(() => {
    const rij = rijRef.current;
    const duim = duimRef.current;
    if (!rij) return;
    const kan = rij.scrollWidth - rij.clientWidth > 2;
    setScrollbaar(kan);
    if (!duim || !kan) return;
    const deel = rij.clientWidth / rij.scrollWidth;
    const voortgang = rij.scrollLeft / (rij.scrollWidth - rij.clientWidth);
    duim.style.width = `${deel * 100}%`;
    duim.style.transform = `translate3d(${voortgang * (1 / deel - 1) * 100}%,0,0)`;
  }, []);

  useEffect(() => {
    const rij = rijRef.current;
    if (!rij) return;
    werkBalkBij();
    const ro = new ResizeObserver(werkBalkBij);
    ro.observe(rij);
    rij.addEventListener("scroll", werkBalkBij, { passive: true });
    return () => {
      ro.disconnect();
      rij.removeEventListener("scroll", werkBalkBij);
    };
  }, [werkBalkBij]);

  // De balk verschijnt pas zodra de rij scrollbaar blijkt; dan meteen vullen.
  useEffect(() => {
    if (scrollbaar) werkBalkBij();
  }, [scrollbaar, werkBalkBij]);

  // Muis-slepen (touch/pen gebruikt native scroll).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !scrollbaar) return;
    const rij = rijRef.current;
    if (!rij) return;
    sleep.current = { actief: true, startX: e.clientX, startScroll: rij.scrollLeft, bewogen: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sleep.current;
    const rij = rijRef.current;
    if (!s.actief || !rij) return;
    const dx = e.clientX - s.startX;
    if (!s.bewogen && Math.abs(dx) > 5) {
      s.bewogen = true;
      setSleept(true);
      rij.setPointerCapture(e.pointerId);
    }
    if (s.bewogen) rij.scrollLeft = s.startScroll - dx;
  };
  const stopSlepen = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sleep.current;
    if (!s.actief) return;
    s.actief = false;
    if (rijRef.current?.hasPointerCapture(e.pointerId)) {
      rijRef.current.releasePointerCapture(e.pointerId);
    }
    // Snap weer aan; de browser schuift naar de dichtstbijzijnde kaart.
    setSleept(false);
  };
  // Na een sleepbeweging de klik op de kaart eronder onderdrukken.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sleep.current.bewogen) {
      e.preventDefault();
      e.stopPropagation();
      sleep.current.bewogen = false;
    }
  };

  // Klik op de balk: naar die positie scrollen.
  const onBalkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rij = rijRef.current;
    const balk = balkRef.current;
    if (!rij || !balk) return;
    const r = balk.getBoundingClientRect();
    const fractie = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    rij.scrollTo({ left: fractie * (rij.scrollWidth - rij.clientWidth), behavior: "smooth" });
  };

  // Pijltjestoetsen: één kaart verder.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rij = rijRef.current;
    if (!rij || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    const kaart = rij.firstElementChild as HTMLElement | null;
    const stap = kaart ? kaart.offsetWidth : rij.clientWidth / 3;
    rij.scrollBy({ left: e.key === "ArrowRight" ? stap : -stap, behavior: "smooth" });
    e.preventDefault();
  };

  return (
    <div className={className}>
      <div
        ref={rijRef}
        role="region"
        aria-label={`${label}, sleep of gebruik de pijltjestoetsen`}
        tabIndex={scrollbaar ? 0 : -1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopSlepen}
        onPointerCancel={stopSlepen}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        // Geen native link-/beeld-drag die het slepen overneemt.
        onDragStart={(e) => e.preventDefault()}
        className={[
          "flex gap-x-[1.389vw] overflow-x-auto overscroll-x-contain outline-none",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "max-lg:gap-x-4",
          sleept ? "cursor-grabbing select-none" : "snap-x snap-mandatory",
          scrollbaar && !sleept ? "cursor-grab" : "",
        ].join(" ")}
      >
        {children}
      </div>
      {scrollbaar ? (
        <div
          ref={balkRef}
          onClick={onBalkClick}
          aria-hidden
          className="relative h-[2px] mt-[1.389vw] bg-off-black/15 cursor-pointer max-lg:mt-4"
        >
          <div
            ref={duimRef}
            className="absolute top-0 left-0 h-full bg-off-black will-change-transform"
          />
        </div>
      ) : null}
    </div>
  );
}
