"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

type PageNavigate = ((
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string
) => void) & {
  /** Programmatische variant voor navigatie zonder anchor-event. */
  to: (href: string) => void;
};

export function usePageNavigation(): PageNavigate {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = useCallback(
    (href: string) => {
      if (href === pathname) return;

      // Capture old page DOM as a live node clone and attach it to
      // <body> *before* router.push. Keeping the clone in the DOM while
      // React unmounts the originals means the browser never discards the
      // decoded image bitmaps — there's literally no frame between "old
      // removed" and "clone visible". That was the source of the flicker.
      // Remove any stale snapshot from a still-in-flight previous nav.
      document.querySelectorAll("[data-page-snapshot]").forEach((n) => n.remove());
      const container = document.querySelector("[data-page-content]");
      if (container) {
        const clone = container.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-page-snapshot", "");
        clone.style.cssText = `position:fixed;top:${-window.scrollY}px;left:0;right:0;margin:0;z-index:0;pointer-events:none;`;
        document.body.appendChild(clone);
        window.__pageSnapshot = {
          node: clone,
          scrollY: window.scrollY,
        };
      }

      // Hide navbar
      window.dispatchEvent(new CustomEvent("nav-hide"));

      // Navigate after a brief delay to let navbar start hiding
      setTimeout(() => {
        router.push(href);
      }, 100);
    },
    [pathname, router]
  );

  return useMemo(
    () =>
      Object.assign(
        (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
          // Let external links pass through
          if (href.startsWith("http")) return;

          e.preventDefault();
          goTo(href);
        },
        { to: goTo }
      ) as PageNavigate,
    [goTo]
  );
}
