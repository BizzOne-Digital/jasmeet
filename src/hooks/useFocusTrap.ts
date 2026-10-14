"use client";

import { useEffect, type RefObject } from "react";

/** Keep keyboard focus inside `container` while `active` is true. */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onEscape?: () => void
) {
  useEffect(() => {
    if (!active) return;
    const root = containerRef.current;
    if (!root) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef, onEscape]);
}
