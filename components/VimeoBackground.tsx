"use client";

import { useRef, useState } from "react";

function parseVimeoUrl(url: string): { id: string; hash?: string } | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (!match) return null;
  return { id: match[1], hash: match[2] };
}

export default function VimeoBackground({
  url,
  poster,
  fit = "cover",
}: {
  url: string;
  poster?: string;
  /**
   * "cover" — iframe fills the container, overflow is cropped.
   * "contain" — iframe fits inside the container (letterbox if aspect mismatch).
   * Sizing is based on the parent container, not the viewport.
   */
  fit?: "cover" | "contain";
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  return (
    <div
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
          ...iframeSize,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />
    </div>
  );
}
