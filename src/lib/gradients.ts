/**
 * Dekorative gradienter — ÉN kilde til sannhet.
 *
 * Regelen i .claude/docs/design.md er «aldri hardkodede farger i komponenter».
 * Før dette lå de samme fargestrengene spredt på 126 steder i 37 filer.
 *
 * Verdiene er Tailwind-fargestopp (ikke hele klassen), fordi kallstedene selv
 * bestemmer retning — `bg-gradient-to-r`, `-to-br` eller `-to-b`.
 *
 * Skal du endre en farge: gjør det her, ikke i komponenten.
 */
export const GRADIENT = {
  /** Cyan → blå → indigo. Mest brukt: seksjonsstreker, primære kort. */
  hav: "from-cyan-500 via-blue-500 to-indigo-600",
  /** Emerald → teal → cyan. Tillit, garanti, «inkludert». */
  skog: "from-emerald-500 via-teal-500 to-cyan-600",
  /** Amber → oransje → rose. Varme, prosjekter, priser. */
  solnedgang: "from-amber-500 via-orange-500 to-rose-600",
  /** Fuchsia → lilla → indigo. Anmeldelser, tidslinje, innhold. */
  natt: "from-fuchsia-500 via-purple-500 to-indigo-600",
  /** Rose → rosa → fuchsia. Brukere. */
  rose: "from-rose-500 via-pink-500 to-fuchsia-600",
  /** Gul → amber → oransje. Redigering. */
  sol: "from-yellow-500 via-amber-500 to-orange-600",
  /** Nøytral grå. Sammenligning, «om»-seksjoner. */
  stein: "from-slate-500 via-zinc-600 to-gray-700",
  /** Nøytral grå, variant. Logg. */
  steinLys: "from-slate-500 via-gray-500 to-zinc-600",
  /** Mørk navy. Bakgrunn for CTA-seksjoner. */
  dyp: "from-slate-900 via-slate-800 to-slate-900",

  // Dypere varianter — admin-modaler
  havDyp: "from-cyan-600 via-blue-600 to-indigo-700",
  havDyp2: "from-cyan-500 via-blue-600 to-indigo-700",
  skogDyp: "from-emerald-600 via-teal-600 to-cyan-700",
  nattDyp: "from-fuchsia-600 via-purple-600 to-indigo-700",

  // To-farge-varianter — dashboard-ikoner og små flater
  havKort: "from-cyan-500 to-blue-500",
  himmelKort: "from-sky-500 to-blue-500",
  skogKort: "from-emerald-500 to-teal-500",
  skogKort2: "from-emerald-500 to-teal-600",
  skogKort3: "from-emerald-500 to-cyan-500",
  skogLys: "from-emerald-400 to-teal-500",
  solnedgangKort: "from-amber-500 to-orange-500",
  nattKort: "from-fuchsia-500 to-purple-500",
  lillaKort: "from-purple-500 to-violet-500",
  roseKort: "from-rose-500 to-pink-500",
} as const;

export type GradientNavn = keyof typeof GRADIENT;
