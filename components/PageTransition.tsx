"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useEffect, useState, useRef } from "react";

type Phase = "idle" | "frozen" | "animating";

// Shared stores for cross-component coordination
declare global {
  interface Window {
    /**
     * Snapshot of the outgoing page used during transitions. We keep a live
     * DOM clone (not serialized HTML) so cached images don't re-decode when
     * the old page is re-rendered behind the sliding new page.
     */
    __pageSnapshot?: { node: HTMLElement; scrollY: number };
    __pageTransitioning?: boolean;
    __navInitialHidden?: boolean;
  }
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  const [phase, setPhase] = useState<Phase>("idle");
  const [hasSnapshot, setHasSnapshot] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  /** Reference to the live snapshot DOM node (attached by the nav caller). */
  const snapshotNodeRef = useRef<HTMLElement | null>(null);
  const prevPathname = useRef(pathname);
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useLayoutEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Een server-redirect (bijv. alias-slug → hoofdslug) laat de pathname een
    // twééde keer verspringen terwijl de transition nog loopt, zonder nieuw
    // snapshot (er was geen nieuwe klik). Laat dan de lopende animatie én
    // haar opruimtimer gewoon uitspelen: die annuleren liet de pagina
    // bevroren achter met body overflow:hidden en het snapshot in de DOM.
    if (!window.__pageSnapshot && snapshotNodeRef.current) return;

    // Cancel any ongoing transition
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Reduced motion — instant swap. If a snapshot was captured, remove it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const stale = window.__pageSnapshot;
      stale?.node.remove();
      window.__pageSnapshot = undefined;
      window.scrollTo(0, 0);
      return;
    }

    // Read the pre-captured snapshot (set by Menu/Navbar/usePageNavigation
    // which already appended it to <body>).
    const captured = window.__pageSnapshot;
    window.__pageSnapshot = undefined;

    if (!captured) {
      // No snapshot (e.g. browser back/forward) — skip transition
      window.scrollTo(0, 0);
      return;
    }

    snapshotNodeRef.current = captured.node;
    document.body.style.overflow = "hidden";
    window.__pageTransitioning = true;
    setHasSnapshot(true);
    setPhase("frozen");

    window.dispatchEvent(new CustomEvent("page-transition-start"));

    // Double rAF: paint frozen frame, then start animation.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setPhase("animating");

        // Animate the live snapshot node imperatively — it's already sitting
        // in <body>. No React re-render, no re-mount, no re-decode of imgs.
        const node = snapshotNodeRef.current;
        if (node) {
          node.style.transition = `transform ${dur} ${easing}`;
          node.style.transform = "translateY(-25vh)";
        }

        timerRef.current = setTimeout(() => {
          snapshotNodeRef.current?.remove();
          snapshotNodeRef.current = null;
          setHasSnapshot(false);
          setPhase("idle");
          window.__pageTransitioning = false;
          window.scrollTo(0, 0);
          document.body.style.overflow = "";
          window.dispatchEvent(new CustomEvent("page-transition-end"));
        }, 1000);
      });
    });
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      snapshotNodeRef.current?.remove();
      document.body.style.overflow = "";
    };
  }, []);

  const easing = "cubic-bezier(0.7, 0.05, 0.13, 1)";
  const dur = "1s";
  const active = phase !== "idle" && hasSnapshot;

  if (isStudio) return <>{children}</>;

  // The snapshot lives in <body> (inserted by the nav caller, animated
  // imperatively above). React only manages the new page + the dark
  // darkening overlay. This avoids re-mounting cloned <img>s inside a
  // React-managed subtree, which was causing the flicker.
  return (
    <div
      style={
        active
          ? { position: "fixed", inset: 0, overflow: "hidden", zIndex: 10 }
          : undefined
      }
    >
      {/* New page — always first child for stable React tree identity */}
      <div
        ref={containerRef}
        data-page-content
        style={
          active
            ? {
                position: "absolute",
                zIndex: 2,
                top: 0,
                left: 0,
                right: 0,
                minHeight: "100vh",
                backgroundColor: "#F7F5F0",
                transform:
                  phase === "animating"
                    ? "translateY(0)"
                    : "translateY(100vh)",
                transition:
                  phase === "animating"
                    ? `transform ${dur} ${easing}`
                    : "none",
              }
            : undefined
        }
      >
        {children}
      </div>

      {/* Dark darkening overlay sitting between the snapshot (in <body>) and
          the new sliding page. */}
      {active && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            inset: 0,
            backgroundColor: "#1D1F1A",
            opacity: phase === "animating" ? 0.5 : 0,
            transition:
              phase === "animating" ? `opacity 0.8s ${easing}` : "none",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
