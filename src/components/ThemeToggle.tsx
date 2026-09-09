import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type ThemeValue = 'light' | 'blue';

const themes: { value: ThemeValue; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Lys modus' },
  { value: 'blue', icon: Moon, label: 'Blå modus' },
];

/**
 * Rund iOS-bryter for tema — brukes i headeren.
 *
 * HELE sporet er én knapp: hvert trykk vipper til motsatt modus, uansett om du
 * treffer sola eller månen. Derfor role="switch", ikke radiogroup.
 *
 * Tommelen er `bg-primary` (teal), ikke `bg-background`. Den gamle varianten
 * brukte bakgrunnsfargen, som i blå modus er mørk navy mot et nesten like mørkt
 * spor — da var ikonfargen eneste signal om hva som var valgt. Teal har god
 * kontrast mot sporet i BEGGE modus.
 *
 * Bevegelse: translateX via bevegelses-tokenene (.claude/rules/bevegelse.md).
 */
export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const erBlaa = theme === 'blue';
  const AktivtIkon = erBlaa ? Moon : Sun;
  const PassivtIkon = erBlaa ? Sun : Moon;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={erBlaa}
      aria-label={erBlaa ? 'Bytt til lys modus' : 'Bytt til blå modus'}
      onClick={() => setTheme(erBlaa ? 'light' : 'blue')}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full border border-border',
        'bg-muted/70 hover:bg-muted',
        'transition-[background-color,transform] duration-fast ease-enter',
        'active:scale-[0.97] active:duration-micro active:ease-press',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'touch-manipulation',
        // 44px touch-mål på mobil, 40px på desktop (naboen Profil er 40px)
        'h-11 w-[4.25rem] lg:h-9 lg:w-[3.5rem]'
      )}
    >
      {/* Ikonet for modusen du bytter TIL — hint på motsatt side */}
      <PassivtIkon
        aria-hidden="true"
        className={cn(
          'absolute h-4 w-4 lg:h-3.5 lg:w-3.5 text-muted-foreground/70',
          erBlaa ? 'left-2.5 lg:left-2' : 'right-2.5 lg:right-2'
        )}
      />

      {/* Tommelen — bærer ikonet for modusen du er i nå */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-1 flex items-center justify-center rounded-full',
          'bg-primary shadow-sm ring-1 ring-primary-hover/40',
          'transition-transform duration-fast ease-enter',
          'h-9 w-9 lg:h-7 lg:w-7',
          // Vandring = sporbredde − tommel − 2×innsett.
          // Mobil:  68 − 36 − 8 = 24px (translate-x-6)
          // Desktop: 56 − 28 − 8 = 20px (translate-x-5)
          erBlaa ? 'translate-x-6 lg:translate-x-5' : 'translate-x-0'
        )}
      >
        <AktivtIkon className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-secondary" />
      </span>
    </button>
  );
};

/**
 * Med etiketter — brukes på profilsiden, der det er en innstillingsrad og
 * eksplisitte navn er tydeligere enn en bryter.
 */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const aktivIndex = theme === 'blue' ? 1 : 0;

  return (
    <div
      role="radiogroup"
      aria-label="Fargetema"
      className="relative inline-flex h-11 items-center rounded-lg border border-border bg-muted/60 p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md',
          'bg-primary/15 border border-primary/40 shadow-sm',
          'transition-transform duration-fast ease-enter'
        )}
        style={{ transform: `translateX(${aktivIndex * 100}%)` }}
      />
      {themes.map(({ value, icon: Icon, label }) => {
        const aktiv = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={aktiv}
            onClick={() => setTheme(value)}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md px-3',
              'text-sm font-medium whitespace-nowrap',
              'transition-[color,transform] duration-fast ease-enter',
              'active:scale-[0.97] active:duration-micro active:ease-press',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              aktiv ? 'text-primary-hover' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
