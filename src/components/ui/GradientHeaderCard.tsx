import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared visual primitive used across /tjenester and / for any "info card"
// that needs the gradient-header + content-below layout.
//
// The visual is intentionally simple and static (no tilt, no continuous
// scroll-driven motion) — the parent decides reveal animation, if any.
export interface GradientHeaderCardProps {
  icon: LucideIcon;
  gradient: string;
  title: string;
  subtitle?: string;
  badge?: string;
  highlight?: boolean;
  highlightColor?: string;
  children?: ReactNode;
  className?: string;
}

export const GradientHeaderCard = ({
  icon: Icon,
  gradient,
  title,
  subtitle,
  badge,
  highlight = false,
  highlightColor = "border-success",
  children,
  className,
}: GradientHeaderCardProps) => {
  return (
    <div
      className={cn(
        "glass-card relative h-full !overflow-visible group flex flex-col",
        highlight && `!${highlightColor} !border-2`,
        className
      )}
    >
      {/* Badge floating above the card (e.g. "Anbefalt", "Populær") */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-md">
          {badge}
        </div>
      )}

      {/* Gradient header */}
      <div
        className={cn(
          "relative w-full aspect-[5/3] rounded-xl overflow-hidden mb-4 bg-gradient-to-br",
          gradient
        )}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon
            className="text-white/95 drop-shadow-lg w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 pt-0 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 font-heading">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
        )}
        {children && <div className="flex-1 flex flex-col">{children}</div>}
      </div>
    </div>
  );
};
