import { ReactNode } from "react";

/**
 * Sideovergang i ren CSS.
 *
 * Erstattet framer-motion 2026-09-09: biblioteket kostet 39 kB gzip i
 * hoved-chunken — som HVER besøkende laster — for denne effekten pluss
 * MotionButton. Begge lot seg gjøre i CSS.
 *
 * Animasjonen spilles på nytt ved hver navigasjon fordi <Routes> i App.tsx
 * har key={location.pathname} og dermed remonteres.
 *
 * Merk: exit-animasjonen (opacity → 0, y −6) er borte. CSS kan ikke animere
 * et element som allerede er fjernet fra DOM-en, og med lazy-lastede ruter
 * rakk den sjelden å spille rent uansett.
 *
 * prefers-reduced-motion håndteres globalt i index.css.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <div className="page-enter">{children}</div>
);
