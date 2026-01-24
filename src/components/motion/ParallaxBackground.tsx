import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { parallax } from "@/lib/motionTokens";
import { cn } from "@/lib/utils";

interface ParallaxBackgroundProps {
  /** Background image URL */
  imageUrl: string;
  /** CSS classes for the container */
  className?: string;
  /** Background position (default: center 30%) */
  backgroundPosition?: string;
  /** Parallax intensity: 'subtle' | 'normal' */
  intensity?: "subtle" | "normal";
  /** Children to render over the background */
  children?: React.ReactNode;
}

/**
 * ParallaxBackground - Subtle parallax effect for hero backgrounds
 * 
 * Mobile-safe: Uses transform only, respects reduced motion
 * Performance: GPU-accelerated, no layout thrashing
 */
export const ParallaxBackground = ({
  imageUrl,
  className,
  backgroundPosition = "center 30%",
  intensity = "normal",
  children,
}: ParallaxBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yRange = intensity === "subtle" 
    ? parallax.decorative.yRange 
    : parallax.hero.yRange;

  const y = useTransform(scrollYProgress, [0, 1], [yRange[0], yRange[1]]);

  // Static background for reduced motion
  if (shouldReduceMotion) {
    return (
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden", className)}
      >
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition,
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition,
          y,
        }}
      />
      {children}
    </div>
  );
};
