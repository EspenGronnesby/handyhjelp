import { useMemo, useRef } from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

export type RoadmapMilestone = {
  year: string;
  title: string;
  description: string;
  hidden?: boolean;
};

type RoadmapTimelineProps = {
  heading: string;
  milestones: RoadmapMilestone[];
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function MilestoneCard({
  milestone,
  index,
  total,
  progress,
  side,
}: {
  milestone: RoadmapMilestone;
  index: number;
  total: number;
  progress: MotionValue<number>;
  side: "left" | "right";
}) {
  const prefersReducedMotion = useReducedMotion();

  const start = useMemo(() => index / Math.max(1, total), [index, total]);
  const end = useMemo(() => (index + 1) / Math.max(1, total), [index, total]);

  // Reveal based on actual scroll progress through the section (not time).
  // We add a small overlap so the transition feels continuous.
  const opacity = prefersReducedMotion
    ? 1
    : useTransform(progress, [start - 0.05, start + 0.2], [0, 1]);

  const yFrom = side === "left" ? -18 : 18;
  const y = prefersReducedMotion ? 0 : useTransform(progress, [start - 0.05, start + 0.2], [yFrom, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      <div className="p-5 md:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-primary">{milestone.year}</p>
        </div>
        <h3 className="mt-2 text-lg md:text-xl font-semibold">{milestone.title}</h3>
        <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
          {milestone.description}
        </p>
      </div>
    </motion.div>
  );
}

export function RoadmapTimeline({ heading, milestones }: RoadmapTimelineProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const visible = useMemo(() => milestones.filter((m) => !m.hidden), [milestones]);
  const total = visible.length;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Start animating when section enters, finish when it leaves
    offset: ["start 0.85", "end 0.15"],
  });

  // Progressive line fill
  const lineScaleY = prefersReducedMotion
    ? 1
    : useTransform(scrollYProgress, (v) => clamp01(v));

  // Subtle parallax background elements
  const parallaxY1 = prefersReducedMotion ? 0 : useTransform(scrollYProgress, [0, 1], [0, -24]);
  const parallaxY2 = prefersReducedMotion ? 0 : useTransform(scrollYProgress, [0, 1], [0, 18]);

  return (
    <section ref={sectionRef} className="relative">
      {/* Background accents (subtle, non-distracting) */}
      <motion.div
        aria-hidden="true"
        style={{ y: parallaxY1 }}
        className="pointer-events-none absolute -top-6 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        style={{ y: parallaxY2 }}
        className="pointer-events-none absolute -bottom-10 left-6 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4">
        <header className="text-center">
          <h2 className="heading-section font-heading">{heading}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            En kort oversikt over viktige milepæler – og hvor vi er på vei.
          </p>
        </header>

        <div className="mt-10 md:mt-14">
          {/*
            Mobile: line on the left + cards to the right.
            Desktop: central line + alternating left/right cards.
          */}
          <div className="relative">
            {/* Central line (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/60" />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: lineScaleY, transformOrigin: "top" }}
              className="hidden md:block absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary"
            />

            {/* Left line (mobile) */}
            <div className="md:hidden absolute left-3 top-0 h-full w-px bg-border/60" />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: lineScaleY, transformOrigin: "top" }}
              className="md:hidden absolute left-3 top-0 h-full w-px bg-primary"
            />

            <div className="space-y-6 md:space-y-10">
              {visible.map((milestone, index) => {
                const isLeft = index % 2 === 0;
                const side: "left" | "right" = isLeft ? "left" : "right";

                return (
                  <div key={`${milestone.year}-${index}`} className="relative">
                    {/* Dot + year label */}
                    <div className="md:hidden absolute left-3 top-6 -translate-x-1/2">
                      <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    </div>

                    <div className="hidden md:block absolute left-1/2 top-7 -translate-x-1/2">
                      <div className="h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-background" />
                    </div>

                    {/* Layout */}
                    <div className="md:grid md:grid-cols-[1fr_72px_1fr] md:items-start">
                      {/* Left column */}
                      <div className={isLeft ? "md:pr-10" : "md:pr-10 md:opacity-0"}>
                        {isLeft ? (
                          <MilestoneCard
                            milestone={milestone}
                            index={index}
                            total={total}
                            progress={scrollYProgress}
                            side="left"
                          />
                        ) : null}
                      </div>

                      {/* Middle spacer (line lives here) */}
                      <div />

                      {/* Right column */}
                      <div className={!isLeft ? "md:pl-10" : "md:pl-10 md:opacity-0"}>
                        {!isLeft ? (
                          <MilestoneCard
                            milestone={milestone}
                            index={index}
                            total={total}
                            progress={scrollYProgress}
                            side="right"
                          />
                        ) : null}
                      </div>

                      {/* Mobile card (always) */}
                      <div className="md:hidden pl-10">
                        <MilestoneCard
                          milestone={milestone}
                          index={index}
                          total={total}
                          progress={scrollYProgress}
                          side="right"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
