import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

interface AnimatedNumberProps {
  /** Sluttverdien tallet skal telle opp til */
  value: number;
  /** Hvordan tallet formatteres (default: rått tall) */
  formatter?: (n: number) => string;
  /** Varighet i millisekunder */
  durationMs?: number;
  className?: string;
}

/**
 * AnimatedNumber - teller mykt opp fra 0 til `value`.
 * Respekterer prefers-reduced-motion (viser sluttverdien direkte).
 */
export const AnimatedNumber = ({
  value,
  formatter = (n) => String(Math.round(n)),
  durationMs = 900,
  className,
}: AnimatedNumberProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [value, durationMs, shouldReduceMotion]);

  return <span className={className}>{formatter(display)}</span>;
};

export default AnimatedNumber;
