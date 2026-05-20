import { useMemo, useState } from "react";
import { EyeOff } from 'lucide-react';
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { TimelineEditModal } from "./TimelineEditModal";
import { RoadmapTimeline, type RoadmapMilestone } from "@/components/timeline/RoadmapTimeline";
import { EditButton } from './ui/EditButton';

export const EditableTimeline = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('about-timeline', 'heading');
  // New roadmap fields (title/description). We keep legacy `event_*` as fallback for description.
  const { content: year1 } = useEditableContent("about-timeline", "year_1");
  const { content: title1 } = useEditableContent("about-timeline", "title_1");
  const { content: desc1 } = useEditableContent("about-timeline", "desc_1");
  const { content: legacyEvent1 } = useEditableContent("about-timeline", "event_1");

  const { content: year2 } = useEditableContent("about-timeline", "year_2");
  const { content: title2 } = useEditableContent("about-timeline", "title_2");
  const { content: desc2 } = useEditableContent("about-timeline", "desc_2");
  const { content: legacyEvent2 } = useEditableContent("about-timeline", "event_2");

  const { content: year3 } = useEditableContent("about-timeline", "year_3");
  const { content: title3 } = useEditableContent("about-timeline", "title_3");
  const { content: desc3 } = useEditableContent("about-timeline", "desc_3");
  const { content: legacyEvent3 } = useEditableContent("about-timeline", "event_3");

  const { content: year4 } = useEditableContent("about-timeline", "year_4");
  const { content: title4 } = useEditableContent("about-timeline", "title_4");
  const { content: desc4 } = useEditableContent("about-timeline", "desc_4");
  const { content: legacyEvent4 } = useEditableContent("about-timeline", "event_4");

  const { content: year5 } = useEditableContent("about-timeline", "year_5");
  const { content: title5 } = useEditableContent("about-timeline", "title_5");
  const { content: desc5 } = useEditableContent("about-timeline", "desc_5");
  const { content: legacyEvent5 } = useEditableContent("about-timeline", "event_5");

  const { content: year6 } = useEditableContent("about-timeline", "year_6");
  const { content: title6 } = useEditableContent("about-timeline", "title_6");
  const { content: desc6 } = useEditableContent("about-timeline", "desc_6");
  const { content: legacyEvent6 } = useEditableContent("about-timeline", "event_6");

  const { content: year7 } = useEditableContent("about-timeline", "year_7");
  const { content: title7 } = useEditableContent("about-timeline", "title_7");
  const { content: desc7 } = useEditableContent("about-timeline", "desc_7");
  const { content: legacyEvent7 } = useEditableContent("about-timeline", "event_7");

  const { content: year8 } = useEditableContent("about-timeline", "year_8");
  const { content: title8 } = useEditableContent("about-timeline", "title_8");
  const { content: desc8 } = useEditableContent("about-timeline", "desc_8");
  const { content: legacyEvent8 } = useEditableContent("about-timeline", "event_8");

  const timeline = useMemo(
    () =>
      [
        {
          year: year1,
          title: title1,
          description: desc1 || legacyEvent1,
          defaults: {
            year: "2004",
            title: "Oppstart",
            description: "HandyHjelp ble grunnlagt i Kristiansand.",
          },
        },
        {
          year: year2,
          title: title2,
          description: desc2 || legacyEvent2,
          defaults: {
            year: "2008",
            title: "Utvidelse",
            description: "Utvidet tilbudet med flere fagområder og kapasitet.",
          },
        },
        {
          year: year3,
          title: title3,
          description: desc3 || legacyEvent3,
          defaults: {
            year: "2012",
            title: "Vekst",
            description: "Milepæl med over 100 fornøyde bedriftskunder.",
          },
        },
        {
          year: year4,
          title: title4,
          description: desc4 || legacyEvent4,
          defaults: {
            year: "2016",
            title: "Kvalitet",
            description: "Styrket kvalitetssystemer og dokumentasjon i leveransene.",
          },
        },
        {
          year: year5,
          title: title5,
          description: desc5 || legacyEvent5,
          defaults: {
            year: "2020",
            title: "Avtaler",
            description: "Lanserte faste vedlikeholdsavtaler for bedrifter.",
          },
        },
        {
          year: year6,
          title: title6,
          description: desc6 || legacyEvent6,
          defaults: {
            year: "2025",
            title: "I dag",
            description: "Over 200 faste kunder og 20+ års erfaring.",
          },
        },
        {
          year: year7,
          title: title7,
          description: desc7 || legacyEvent7,
          defaults: {
            year: "2026",
            title: "Neste steg",
            description: "Videreutvikler kundereisen og enda mer forutsigbar drift.",
          },
        },
        {
          year: year8,
          title: title8,
          description: desc8 || legacyEvent8,
          defaults: {
            year: "2027",
            title: "Fremover",
            description: "Skalerer leveransen med samme kvalitet og responstid.",
          },
        },
      ],
    [
      year1,
      title1,
      desc1,
      legacyEvent1,
      year2,
      title2,
      desc2,
      legacyEvent2,
      year3,
      title3,
      desc3,
      legacyEvent3,
      year4,
      title4,
      desc4,
      legacyEvent4,
      year5,
      title5,
      desc5,
      legacyEvent5,
      year6,
      title6,
      desc6,
      legacyEvent6,
      year7,
      title7,
      desc7,
      legacyEvent7,
      year8,
      title8,
      desc8,
      legacyEvent8,
    ]
  );

  const milestones: RoadmapMilestone[] = useMemo(
    () =>
      timeline.map((item) => {
        const year = item.year?.trim() || item.defaults.year;
        const title = item.title?.trim() || item.defaults.title;
        const description = item.description?.trim() || item.defaults.description;
        const hidden =
          (item.year?.trim() ?? "") === "" &&
          (item.title?.trim() ?? "") === "" &&
          (item.description?.trim() ?? "") === "";

        return { year, title, description, hidden };
      }),
    [timeline]
  );

  const visibleMilestones = isAdmin && editMode ? milestones : milestones.filter((m) => !m.hidden);

  // Hvis alle items er skjult og ikke i edit mode, skjul hele seksjonen
  if (visibleMilestones.length === 0 && (!isAdmin || !editMode)) {
    return null;
  }

  return (
    <>
      <div className="relative rounded-2xl p-6 md:p-12 mb-20 overflow-hidden bg-gradient-to-br from-cyan-50/60 via-indigo-50/40 to-fuchsia-50/40 dark:bg-muted dark:bg-none [.blue_&]:bg-muted [.blue_&]:bg-none">
        {/* Subtil dot-pattern på lys tema, gjemt på dark/blue der bg-muted holder */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none dark:opacity-0 [.blue_&]:opacity-0"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger Vår reise" />
        )}

        {isAdmin && editMode && milestones.some((m) => m.hidden) && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" />
            <span>Skjulte punkter vises i redigeringsmodus</span>
          </div>
        )}

        {/* Give the section enough scroll range for scrollytelling */}
        <div style={{ minHeight: `${Math.max(900, visibleMilestones.length * 220)}px` }}>
          <div className="sticky top-24">
            <RoadmapTimeline heading={heading || "Vår reise"} milestones={visibleMilestones} />
          </div>
        </div>
      </div>

      <TimelineEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="about-timeline"
        currentData={{
          heading: heading || "Vår reise",
          timeline: milestones.map((m) => ({
            year: m.year,
            title: m.title,
            description: m.description,
          })),
        }}
      />
    </>
  );
};
