import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { transitions, transforms, getReducedMotionProps } from "@/lib/motionTokens";

interface MotionButtonProps extends ButtonProps {
  /** Disable motion effects while keeping the button functional */
  disableMotion?: boolean;
}

/**
 * MotionButton - Premium animated button wrapper
 * 
 * Provides:
 * - whileTap: Subtle press feedback (mobile-first)
 * - whileHover: Gentle lift on desktop
 * - Respects prefers-reduced-motion
 */
const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, disableMotion, className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    // If reduced motion or explicitly disabled, render plain button
    if (shouldReduceMotion || disableMotion) {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <motion.div
        whileTap={transforms.press}
        whileHover={transforms.hoverLift}
        transition={transitions.micro}
        className="inline-block"
        style={{ width: className?.includes("w-full") ? "100%" : "auto" }}
      >
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

MotionButton.displayName = "MotionButton";

export { MotionButton };
