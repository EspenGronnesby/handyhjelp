import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Minimum height reserved while the section is not mounted (prevents CLS). */
  minHeight?: string;
  /** Root margin for the IntersectionObserver — start loading slightly before in view. */
  rootMargin?: string;
  fallback?: ReactNode;
}

/**
 * Mounts children only when scrolled near the viewport. Combined with
 * React.lazy() on the child component, this defers both JS and data fetches
 * for below-the-fold sections.
 */
export const LazySection = ({
  children,
  minHeight = '400px',
  rootMargin = '300px',
  fallback = null,
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div ref={ref} style={!shouldRender ? { minHeight } : undefined}>
      {shouldRender ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};
