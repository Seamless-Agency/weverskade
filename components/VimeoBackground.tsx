"use client";

import { useEffect, useRef, useState } from "react";

function parseVimeoUrl(url: string): { id: string; hash?: string } | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (!match) return null;
  return { id: match[1], hash: match[2] };
}

export default function VimeoBackground({
  url,
  poster,
  fit = "cover",
  meetContainer = false,
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
   * "cover" — iframe fills the container, overflow is cropped.
   * "contain" — iframe fits inside the container (letterbox if aspect mismatch).
   * Sizing is based on the parent container, not the viewport.
   */
  fit?: "cover" | "contain";
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />
    </div>
  );
}
