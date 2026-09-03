"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface MenuItem {
  label: string;
  href: string;
}

interface WonenBijMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  /** Wordt ná het sluiten aangeroepen (ankers scrollen, routes navigeren). */
  onNavigate: (href: string) => void;
}

/**
 * Het menu van de wonen-bij omgeving op tablet/mobiel: een één-op-één kopie
 * van components/Menu.tsx (hoofdsite) — donkere blur-overlay, blauw paneel
 * dat van rechts inschuift (fullscreen onder md), lijnen die gestaffeld van
 * links opengaan en links die opkomen. De kop blijft erboven staan, zodat
 * hetzelfde beeldmerk het menu ook weer sluit.
 */
export default function WonenBijMenu({
  isOpen,
  onClose,
  items,
  onNavigate,
}: WonenBijMenuProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let cancelled = false;
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          setVisible(true);
        });
      });
      return () => {
        cancelled = true;
      };
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 900);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Navigeer/scroll vroeg — het paneel sluit er overheen, zoals op de hoofdsite.
  useEffect(() => {
    if (!isOpen && pendingHref.current) {
      const href = pendingHref.current;
      pendingHref.current = null;
      const t = setTimeout(() => onNavigate(href), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, onNavigate]);

  // Body scroll lock (zelfde mechaniek als de hoofdsite)
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape + focus-trap; focus keert terug naar de menuknop bij sluiten.
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    pendingHref.current = href;
    onClose();
  };

  if (!mounted) return null;

  const n = items.length;

  return (
    <div className="fixed inset-0 z-30 lg:hidden">
      {/* Donkere blur-overlay */}
      <div
        className="absolute inset-0 bg-off-black/70 backdrop-blur-[2px]"
        style={{
          opacity: visible ? 1 : 0,
          transition: visible
            ? "opacity 0.5s cubic-bezier(0.4, 0, 0, 1)"
            : "opacity 0.35s cubic-bezier(0.4, 0, 0, 1) 0.12s",
        }}
        onClick={onClose}
      />

      {/* Blauw paneel — schuift van rechts in */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute top-[1.181vw] right-[1.042vw] bottom-[1.181vw] w-[39.444vw] bg-blue rounded-[0.556vw] overflow-hidden flex flex-col max-md:inset-0 max-md:w-auto max-md:rounded-none"
        style={{
          transform: visible
            ? "translateX(0)"
            : "translateX(calc(100% + 1.042vw))",
          transition: visible
            ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.05s"
            : "transform 0.6s cubic-bezier(0.4, 0, 0, 1) 0.15s",
        }}
      >
        {/* Links met gestaffelde lijnen */}
        <nav
          className="px-[2.222vw] pt-[9.722vw] max-md:px-5 max-md:pt-20"
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => {
            setIsNavHovered(false);
            setHoveredIndex(null);
          }}
        >
          {items.map((item, i) => {
            const isHovered = hoveredIndex === i;
            const isDimmed =
              isNavHovered && hoveredIndex !== null && !isHovered;
            // De lijn BOVEN dit item licht op als het item erboven gehoverd is
            const lineBelow = hoveredIndex !== null && hoveredIndex === i - 1;
            return (
              <div key={item.label} onMouseEnter={() => setHoveredIndex(i)}>
                {/* Scheidingslijn — groeit van links */}
                <div
                  className="h-px"
                  style={{
                    transformOrigin: "left",
                    transform: visible ? "scaleX(1)" : "scaleX(0)",
                    background: lineBelow
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.3)",
                    transition: visible
                      ? `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + i * 0.06}s, background 0.5s ease`
                      : `transform 0.3s cubic-bezier(0.4, 0, 0, 1) ${(n - i) * 0.02}s, background 0.5s ease`,
                  }}
                />
                <a
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className="block font-body font-medium text-[2.917vw] leading-[4.306vw] tracking-[-0.04em] text-off-white no-underline max-md:text-[32px] max-md:leading-[48px]"
                  style={{
                    opacity: visible ? (isDimmed ? 0.4 : 1) : 0,
                    transform: visible
                      ? "translateY(0)"
                      : "translateY(0.694vw)",
                    transition: visible
                      ? "opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                      : `opacity 0.25s ease ${(n - 1 - i) * 0.02}s, transform 0.25s ease ${(n - 1 - i) * 0.02}s`,
                  }}
                >
                  {item.label}
                </a>
              </div>
            );
          })}
          {/* Laatste lijn */}
          <div
            className="h-px"
            style={{
              transformOrigin: "left",
              transform: visible ? "scaleX(1)" : "scaleX(0)",
              background:
                hoveredIndex === n - 1
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.3)",
              transition: visible
                ? `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + n * 0.06}s, background 0.5s ease`
                : "transform 0.3s cubic-bezier(0.4, 0, 0, 1) 0s, background 0.5s ease",
            }}
          />
        </nav>

        <div className="flex-1" />

        {/* Onderin: Home (wonen-bij overzicht) + Privacy Policy */}
        <div className="relative px-[2.222vw] pb-[1.944vw] max-md:px-5 max-md:pb-8">
          <a
            href="/wonenbij"
            onClick={(e) => handleNavigation(e, "/wonenbij")}
            className="block font-body font-medium text-[2.917vw] leading-[4.306vw] tracking-[-0.04em] text-off-white no-underline hover:opacity-70 transition-opacity duration-200 max-md:text-[32px] max-md:leading-[48px]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(0.694vw)",
              transition: visible
                ? `opacity 0.5s ease ${0.45 + n * 0.06}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.45 + n * 0.06}s`
                : "opacity 0.2s ease 0s, transform 0.2s ease 0s",
            }}
          >
            Home
          </a>
          <a
            href="/privacybeleid"
            onClick={(e) => handleNavigation(e, "/privacybeleid")}
            className="absolute right-[1.458vw] bottom-[1.944vw] font-body font-medium text-[0.694vw] leading-normal tracking-[-0.04em] text-off-white no-underline hover:opacity-70 transition-opacity duration-200 max-md:right-5 max-md:bottom-8 max-md:text-[11px]"
            style={{
              opacity: visible ? 1 : 0,
              transition: visible
                ? `opacity 0.5s ease ${0.5 + n * 0.06}s`
                : "opacity 0.2s ease 0s",
            }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
