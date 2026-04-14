import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditButtonProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  variant?: 'default' | 'light' | 'onPrimary';
  position?: 'absolute' | 'inline';
}

/**
 * Delt blyant-knapp for redigeringsmodus.
 * - Minst 44x44px touch target
 * - z-30 (over vanlig innhold, under Dialog/header-dropdown)
 * - Tydelig kontrast mot alle bakgrunner
 */
export const EditButton = ({
  onClick,
  ariaLabel,
  className,
  variant = 'default',
  position = 'absolute',
}: EditButtonProps) => {
  const variantStyles = {
    default: 'bg-background text-primary border-2 border-primary',
    light: 'bg-white text-primary border-2 border-primary',
    onPrimary: 'bg-background text-primary border-2 border-primary-foreground',
  };

  const positionStyles = position === 'absolute' ? 'absolute top-3 right-3 z-30' : 'relative z-10';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        positionStyles,
        variantStyles[variant],
        'flex items-center justify-center',
        'min-h-[44px] min-w-[44px] rounded-full p-2.5',
        'shadow-lg hover:scale-110 active:scale-95 transition-transform',
        'touch-manipulation',
        className
      )}
    >
      <Pencil className="h-5 w-5" />
    </button>
  );
};
