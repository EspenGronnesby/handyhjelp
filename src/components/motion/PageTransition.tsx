import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motionTokens";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition - Wraps page content with enter/exit animations
 * 
 * Used with AnimatePresence for smooth route transitions
 * Respects prefers-reduced-motion
 */
export const PageTransition = ({ children }: PageTransitionProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
    >
      {children}
    </motion.div>
  );
};
