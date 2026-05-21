import { Sun, Waves } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type ThemeValue = 'light' | 'blue';

const themes: { value: ThemeValue; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Lys modus' },
  { value: 'blue', icon: Waves, label: 'Blå modus' },
];

// Full toggle with labels (for profile page)
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

// iOS-style switch — the thumb carries the active icon, the inactive icon
// sits on the opposite side as a hint of what the toggle leads to.
export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const isBlue = theme === 'blue';
  const ActiveIcon = isBlue ? Waves : Sun;
  const InactiveIcon = isBlue ? Sun : Waves;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isBlue}
      aria-label={isBlue ? 'Bytt til lys modus' : 'Bytt til blå modus'}
      onClick={() => setTheme(isBlue ? 'light' : 'blue')}
      className={cn(
        'relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-border/60 transition-colors',
        'bg-muted hover:bg-muted/80 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
    >
      <InactiveIcon
        className={cn(
          'absolute h-4 w-4 text-muted-foreground/60 transition-all',
          isBlue ? 'left-2.5' : 'right-2.5'
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-md transition-transform',
          isBlue ? 'translate-x-9' : 'translate-x-1'
        )}
      >
        <ActiveIcon
          className={cn(
            'h-3.5 w-3.5',
            isBlue ? 'text-blue-500' : 'text-amber-500'
          )}
        />
      </span>
    </button>
  );
};
