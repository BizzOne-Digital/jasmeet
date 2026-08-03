"use client";

import dynamic from "next/dynamic";

const CinematicIntro = dynamic(
  () =>
    import("@/components/animations/CinematicIntro").then(
      (m) => m.CinematicIntro
    ),
  { ssr: false }
);

const PageTransition = dynamic(
  () =>
    import("@/components/animations/PageTransition").then(
      (m) => m.PageTransition
    ),
  { ssr: false }
);

/** Client-only motion shells (dynamic + ssr:false is not allowed in Server Components). */
export function PublicMotionEffects() {
  return (
    <>
      <CinematicIntro />
      <PageTransition />
    </>
  );
}
