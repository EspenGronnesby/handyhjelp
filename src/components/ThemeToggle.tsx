import { Moon, Sun, Waves } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeValue = 'light' | 'blue' | 'dark';

const themes: { value: ThemeValue; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Lys modus' },
  { value: 'blue', icon: Waves, label: 'Blå modus' },
  { value: 'dark', icon: Moon, label: 'Mørk modus' },
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

// Compact icon button (for header) — cycles through themes
export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const order: ThemeValue[] = ['light', 'blue', 'dark'];
    const idx = order.indexOf(theme as ThemeValue);
    setTheme(order[(idx + 1) % 3]);
  };

  const current = themes.find((t) => t.value === theme) ?? themes[0];
  const Icon = current.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={current.label}
      className="min-h-[44px] min-w-[44px] text-foreground hover:text-primary"
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
};
