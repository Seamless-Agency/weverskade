"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus-trap voor dialogen (fullscreen menu, lightbox). Zolang `active` waar
 * is: focus springt naar het eerste focusbare element in de container, Tab en
 * Shift-Tab blijven binnen de container rondlopen en Escape roept `onEscape`
 * aan. Bij het sluiten keert de focus terug naar het element dat de dialoog
 * opende. De ref hoort op het dialoog-element zelf.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape?: () => void
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const vorigeFocus = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    focusables()[0]?.focus();

    const opToets = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;
      const eerste = items[0];
      const laatste = items[items.length - 1];
      const huidig = document.activeElement;

      if (e.shiftKey) {
        if (huidig === eerste || !el.contains(huidig)) {
          e.preventDefault();
          laatste.focus();
        }
      } else if (huidig === laatste || !el.contains(huidig)) {
        e.preventDefault();
        eerste.focus();
      }
    };

    document.addEventListener("keydown", opToets);
    return () => {
      document.removeEventListener("keydown", opToets);
      vorigeFocus?.focus?.();
    };
  }, [active]);

  return ref;
}
