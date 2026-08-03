"use client";

import dynamic from "next/dynamic";
import { CinematicIntro } from "@/components/animations/CinematicIntro";

const PageTransition = dynamic(
  () =>
    import("@/components/animations/PageTransition").then(
      (m) => m.PageTransition
    ),
  { ssr: false }
);

/** Intro is imported sync so a black blocker SSRs and covers the page first. */
export function PublicMotionEffects() {
  return (
    <>
      <CinematicIntro />
      <PageTransition />
    </>
  );
}
