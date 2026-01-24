import { forwardRef, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, LinkProps } from "react-router-dom";
import { transitions, transforms } from "@/lib/motionTokens";
import { cn } from "@/lib/utils";

interface MotionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  /** Use lighter press effect for nav items */
  variant?: "default" | "nav";
}

/**
 * MotionLink - Premium animated link wrapper
 * 
 * Provides:
 * - whileTap: Subtle press feedback (mobile-first)
 * - whileHover: Gentle lift on desktop
 * - Respects prefers-reduced-motion
 */
const MotionLink = forwardRef<HTMLAnchorElement, MotionLinkProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    const tapTransform = variant === "nav" ? transforms.pressLight : transforms.press;
    const hoverTransform = variant === "nav" 
      ? { scale: 1.02 } 
      : transforms.hoverSubtle;

    // If reduced motion, render plain link
    if (shouldReduceMotion) {
      return (
        <Link ref={ref} className={className} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <motion.div
        whileTap={tapTransform}
        whileHover={hoverTransform}
        transition={transitions.micro}
        className={cn("inline-block", className?.includes("block") && "block")}
      >
        <Link ref={ref} className={className} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }
);

MotionLink.displayName = "MotionLink";

export { MotionLink };
