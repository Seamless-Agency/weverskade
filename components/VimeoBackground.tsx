"use client";

import { useEffect, useRef, useState } from "react";

/** Minimale typing voor Vimeo's player.js (alleen wat we gebruiken). */
interface VimeoPlayer {
  ready(): Promise<void>;
  on(event: "timeupdate", cb: (d: { seconds: number }) => void): void;
  setCurrentTime(seconds: number): Promise<number>;
  destroy?(): Promise<void>;
}
declare global {
  interface Window {
    Vimeo?: { Player: new (el: HTMLIFrameElement) => VimeoPlayer };
  }
}

let vimeoApiBelofte: Promise<void> | null = null;
function laadVimeoApi(): Promise<void> {
  if (window.Vimeo) return Promise.resolve();
  if (!vimeoApiBelofte) {
    vimeoApiBelofte = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://player.vimeo.com/api/player.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Vimeo player API niet geladen"));
      document.head.appendChild(s);
    });
  }
  return vimeoApiBelofte;
}

export function parseVimeoUrl(url: string): { id: string; hash?: string } | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (!match) return null;
  return { id: match[1], hash: match[2] };
}

export default function VimeoBackground({
  url,
  poster,
  fit = "cover",
  meetContainer = false,
  fragmenten,
}: {
  url: string;
  poster?: string;
  /**
   * Meet de container met een ResizeObserver en zet de iframe-maat in px.
   * Onafhankelijk van container-query-units, die in sommige embed-omgevingen
   * (bijv. de MarkUp-preview) niet de containermaat opleveren. Standaard uit,
   * zodat de hoofdsite exact hetzelfde blijft.
   */
  meetContainer?: boolean;
  /**
   * Speel alleen deze stukken van de video af, in volgorde en herhalend
   * ([start, eind] in seconden). Voor een "montage" uit een bestaande video
   * zonder het bestand te knippen. Laadt dan Vimeo's player API; zonder deze
   * prop verandert er niets.
   */
  fragmenten?: [number, number][];
  /**
   * "cover" — iframe fills the container, overflow is cropped.
   * "contain" — iframe fits inside the container (letterbox if aspect mismatch).
   * Sizing is based on the parent container, not the viewport.
   */
  fit?: "cover" | "contain";
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Stabiele sleutel zodat een nieuw array-object geen herstart veroorzaakt.
  const fragmentSleutel = fragmenten?.length ? JSON.stringify(fragmenten) : "";
  // Met fragmenten blijft de poster staan tot de besturing actief is, zodat
  // er nooit een shot buiten de fragmenten in beeld komt.
  const [fragmentKlaar, setFragmentKlaar] = useState(false);

  useEffect(() => {
    if (!fragmentSleutel) return;
    const stukken = JSON.parse(fragmentSleutel) as [number, number][];
    let gestopt = false;
    laadVimeoApi()
      .then(async () => {
        const el = iframeRef.current;
        if (gestopt || !el || !window.Vimeo) return;
        const speler = new window.Vimeo.Player(el);
        await speler.ready();
        let stuk = 0;
        let springt = false;
        const spring = async (naar: number) => {
          springt = true;
          stuk = naar;
          try {
            await speler.setCurrentTime(stukken[naar][0]);
          } finally {
            springt = false;
          }
        };
        // timeupdate komt ~4x per seconde; de eindgrenzen hebben daarom
        // een marge vóór de volgende shot in de bronvideo.
        speler.on("timeupdate", ({ seconds }) => {
          if (gestopt || springt) return;
          const [start, eind] = stukken[stuk];
          if (seconds >= eind) void spring((stuk + 1) % stukken.length);
          else if (seconds < start - 0.3) void spring(stuk);
        });
        if (!gestopt) {
          await spring(0);
          if (!gestopt) setFragmentKlaar(true);
        }
      })
      .catch(() => {
        // Zonder API speelt gewoon de hele video; geen fout voor de bezoeker.
      });
    return () => {
      gestopt = true;
    };
  }, [fragmentSleutel]);
  const [gemeten, setGemeten] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!meetContainer) return;
    const el = containerRef.current;
    if (!el) return;
    const meet = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const ratio = 16 / 9;
      const cover = fit === "cover";
      // cover: minstens zo groot als de container; contain: er precies in.
      const breedte = cover ? Math.max(w, h * ratio) : Math.min(w, h * ratio);
      setGemeten({ w: Math.ceil(breedte), h: Math.ceil(breedte / ratio) });
    };
    meet();
    const ro = new ResizeObserver(meet);
    ro.observe(el);
    return () => ro.disconnect();
  }, [meetContainer, fit]);
  const parsed = parseVimeoUrl(url);
  if (!parsed) return null;
  const params = new URLSearchParams({
    background: "1",
    autoplay: "1",
    loop: "1",
    muted: "1",
    autopause: "0",
  });
  if (parsed.hash) params.set("h", parsed.hash);
  const src = `https://player.vimeo.com/video/${parsed.id}?${params.toString()}`;

  // Container-query based sizing: iframe is sized relative to its parent
  // (cqw/cqh) using a 16:9 video aspect ratio. Falls back to parent 100% if cq
  // units unsupported.
  const iframeSize =
    fit === "contain"
      ? {
          width: "min(100cqw, calc(100cqh * 16 / 9))",
          height: "min(100cqh, calc(100cqw * 9 / 16))",
        }
      : {
          width: "max(100cqw, calc(100cqh * 16 / 9))",
          height: "max(100cqh, calc(100cqw * 9 / 16))",
        };

  const posterObjectFit = fit === "contain" ? "contain" : "cover";
  const maat = gemeten ? { width: `${gemeten.w}px`, height: `${gemeten.h}px` } : iframeSize;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ containerType: "size" }}
    >
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: posterObjectFit }}
        />
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title="Hero video"
        // Decoratieve achtergrond: geen tab-stop en niet voorgelezen.
        tabIndex={-1}
        aria-hidden
        allow="autoplay; fullscreen; picture-in-picture"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        frameBorder={0}
        onLoad={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setVisible(true), 600);
        }}
        style={{
          ...maat,
          opacity: visible && (!fragmentSleutel || fragmentKlaar) ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />
    </div>
  );
}
