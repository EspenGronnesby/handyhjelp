/**
 * Gjenbrukbare funksjoner for dynamisk grid-beregning og kort-bredder
 * Brukes for å sentrere kort når noen er skjult
 */

/**
 * Returnerer responsive grid-klasser basert på antall synlige elementer
 * Brukes for grid-containere
 */
export const getResponsiveGridClass = (
  visibleCount: number, 
  maxColumns: number = 3
): string => {
  if (visibleCount === 0) return 'hidden';
  if (visibleCount === 1) return 'flex justify-center';
  if (visibleCount === 2) return 'flex flex-wrap justify-center gap-8';
  if (maxColumns >= 4 && visibleCount === 4) {
    return 'flex flex-wrap justify-center gap-8';
  }
  if (maxColumns >= 3 && visibleCount >= 3) {
    return 'flex flex-wrap justify-center gap-8';
  }
  return 'flex flex-wrap justify-center gap-8';
};

/**
 * Returnerer bredde-klasser for individuelle kort i flexbox-layout
 * Tilpasser bredden basert på antall synlige kort for optimal sentrering
 */
export const getCardWidthClass = (
  visibleCount: number,
  maxColumns: number = 3
): string => {
  if (visibleCount === 1) return 'w-full max-w-sm';
  if (visibleCount === 2) return 'w-full md:w-[calc(50%-1rem)] max-w-sm';
  if (maxColumns >= 4 && visibleCount === 4) {
    return 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm';
  }
  if (maxColumns >= 3) {
    return 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm';
  }
  return 'w-full md:w-[calc(50%-1rem)] max-w-sm';
};

/**
 * Sjekker om et element med tittel og beskrivelse er tomt (skjult)
 */
export const isItemEmpty = (title?: string, description?: string): boolean => {
  const titleEmpty = !title || title.trim() === '';
  const descEmpty = !description || description.trim() === '';
  return titleEmpty && descEmpty;
};

/**
 * Sjekker om en enkel streng er tom
 */
export const isStringEmpty = (value?: string): boolean => {
  return !value || value.trim() === '';
};

/**
 * Returnerer riktig visningsverdi basert på om feltet har blitt redigert
 * Hvis feltet er redigert i DB, bruk DB-verdien (selv om tom)
 * Hvis ikke redigert, bruk default-verdien
 */
export const getDisplayValue = (
  dbValue: string,
  hasBeenEdited: boolean,
  defaultValue: string
): string => {
  return hasBeenEdited ? dbValue : defaultValue;
};
