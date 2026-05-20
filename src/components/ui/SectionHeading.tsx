import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Typography-first section heading. Two alignment modes:
//
// - `align="left"` (default): vertical gradient bar to the left of h2.
//   Suits reading-flow sections inside `max-w-*` containers.
//
// - `align="center"`: short horizontal gradient pill stacked above a centered
//   h2. Suits hero-style centered section titles (Index, /tjenester).
//
// Both modes share the same gradient palette so the visual language stays
// consistent across the app. Icon is optional and rendered small + inline
// for subtle flavour — does not compete visually with gradient-card icons.
export interface SectionHeadingProps {
  icon?: LucideIcon;
  gradient: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeading = ({
  icon: Icon,
  gradient,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) => {
  if (align === "center") {
    return (
      <div className={cn("text-center mb-6 md:mb-8", className)}>
        <div
          className={cn(
            "mx-auto w-16 md:w-20 h-1 md:h-1.5 rounded-full bg-gradient-to-r mb-4",
            gradient
          )}
          aria-hidden="true"
        />
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight inline-flex items-center justify-center gap-2">
          {Icon && (
            <Icon
              className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/70 shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch gap-3 md:gap-4 mb-6 md:mb-8", className)}>
      <div
        className={cn(
          "shrink-0 w-1 md:w-1.5 rounded-full bg-gradient-to-b self-stretch min-h-[2.5rem]",
          gradient
        )}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground leading-tight inline-flex items-center gap-2">
          {Icon && (
            <Icon
              className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/70 shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
