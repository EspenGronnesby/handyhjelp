import { forwardRef, ReactNode } from "react";
import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { transitions, transforms } from "@/lib/motionTokens";
import { cn } from "@/lib/utils";

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  /** Enable shine overlay effect on hover */
  withShine?: boolean;
}

/**
 * MotionCard - Premium animated card wrapper
 * 
 * Provides:
 * - whileTap: Subtle press feedback (mobile)
 * - whileHover: Gentle lift with optional shine (desktop)
 * - Respects prefers-reduced-motion
 */
const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, withShine = false, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    // If reduced motion, render plain div
    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        whileTap={transforms.pressLight}
        whileHover={transforms.hoverSubtle}
        transition={transitions.hover}
        className={cn("relative overflow-hidden", withShine && "group", className)}
        {...props}
      >
        {children}
        
        {/* Shine overlay on hover */}
        {withShine && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
            aria-hidden="true"
          />
        )}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export { MotionCard };
