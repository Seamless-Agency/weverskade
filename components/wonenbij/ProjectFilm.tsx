"use client";

import { useEffect, useRef } from "react";
import { RevealMedia, useReducedMotion } from "@/components/wonenbij/motion";

/* Projectfilm (wens Vivianne, 09-10): dronebeeld van het project en de
   omgeving als brede band van rand tot rand, vlak vóór "De locatie".
   Stil, herhalend en alleen afspelend zolang hij in beeld is; zo laadt de
   film niet voor bezoekers die er niet komen en kost hij niets als hij uit
   beeld is. Bij "verminderde beweging" blijft de poster staan. */
export default function ProjectFilm({
  src,
  poster,
  naam,
}: {
  src: string;
  poster?: string;
  naam: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    // Ruim vóór de band in beeld komt alvast laden, zodat hij direct speelt
    // in plaats van eerst als stilstaand beeld te blijven hangen.
    const laad = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = "auto";
          video.load();
          laad.disconnect();
        }
      },
      { rootMargin: "1200px 0px" }
    );
    const speel = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    laad.observe(video);
    speel.observe(video);
    return () => {
      laad.disconnect();
      speel.disconnect();
    };
  }, [reduced]);

  return (
    <div className="bg-white" data-nav-theme="dark">
      <RevealMedia className="relative w-full aspect-video overflow-hidden max-lg:aspect-[4/3]">
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`Dronebeelden van ${naam} en de omgeving`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </RevealMedia>
    </div>
  );
}
