import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { SectionHeadingEditModal } from "./SectionHeadingEditModal";
import { ServiceBadge } from "@/lib/serviceIcons";
import { useScrollGridReveal } from "@/hooks/useScrollAnimation";
import { EditButton } from './ui/EditButton';
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
  category: string;
}

export const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [touchedProject, setTouchedProject] = useState<string | null>(null);
  const navigate = useNavigate();
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: heading } = useEditableContent('home-sections', 'projects-heading');
  const { content: subheading } = useEditableContent('home-sections', 'projects-subheading');
  
  const displayHeading = heading || 'Våre prosjekter';
  const displaySubheading = subheading || 'Se resultatet av vårt arbeid';
  const { ref, isInView: isVisible, getItemStyle } = useScrollGridReveal(3, 3);

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("completed_date", { ascending: false });

    if (error) {
      setProjects([]);
    } else {
      
      // Select 1 project from each category
      const selectedProjects: Project[] = [];
      const categories = ["vaktmester", "tomrer", "blikk", "takrennerens"];

      categories.forEach(category => {
        const categoryProject = data?.find(p => p.category === category && !selectedProjects.includes(p));
        if (categoryProject) {
          selectedProjects.push(categoryProject);
        }
      });

      // If we have less than 4 projects, fill with remaining projects
      if (selectedProjects.length < 4 && data) {
        const remaining = data.filter(p => !selectedProjects.includes(p));
        selectedProjects.push(...remaining.slice(0, 4 - selectedProjects.length));
      }

      // Show up to 4 projects
      setProjects(selectedProjects.slice(0, 4));
    }
  };

  const handleTouch = (projectId: string) => {
    setTouchedProject(touchedProject === projectId ? null : projectId);
  };

  const isShowingAfter = (projectId: string) => {
    return hoveredProject === projectId || touchedProject === projectId;
  };

  return (
    <section id="projects" className="py-12 md:py-16 bg-muted/30 section-mobile" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative mb-8 md:mb-12">
          {isAdmin && editMode && (
            <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger Våre prosjekter overskrift" />
          )}

          <SectionHeading
            icon={Briefcase}
            gradient="from-amber-500 via-orange-500 to-rose-600"
            title={displayHeading}
            subtitle={displaySubheading}
            align="center"
          />
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground">
            <p className="text-base md:text-lg">
              Vi legger snart ut bilder fra våre prosjekter
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Show 2 projects in larger cards, Desktop: 3 in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              {projects.slice(0, typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 3).map((project, index) => (
              <Link
                key={project.id}
                to={`/prosjekter/${project.id}`}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer card-hover-lift block perf-contain"
                style={getItemStyle(index)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onTouchStart={() => setTouchedProject(project.id)}
                onTouchEnd={() => setTouchedProject(null)}
              >
                {/* Image Container - Taller on mobile */}
                <div className="relative aspect-[4/3] md:aspect-[4/3] overflow-hidden">
                  {/* Before Image */}
                  <img
                    src={project.before_image_url}
                    alt={`${project.title} - før`}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      isShowingAfter(project.id) ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  {/* After Image */}
                  <img
                    src={project.after_image_url}
                    alt={`${project.title} - etter`}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      isShowingAfter(project.id) ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
                    <ServiceBadge 
                      serviceId={project.category} 
                      className="bg-background/90 backdrop-blur-sm text-xs"
                      showIcon={false}
                    />
                    <Badge
                      variant="secondary"
                      className="bg-background/90 backdrop-blur-sm text-foreground font-semibold text-xs"
                    >
                      {isShowingAfter(project.id) ? "ETTER" : "FØR"}
                    </Badge>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content - Compact on mobile */}
                <div className="p-3 md:p-4 bg-card">
                  <h3 className="font-heading font-bold text-base md:text-lg mb-1 md:mb-2 text-foreground line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-3 md:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px] md:max-w-none">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(project.completed_date).toLocaleDateString("nb-NO", {
                          year: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile tap hint */}
          <p className="text-center text-xs text-muted-foreground mb-4 md:hidden">
            Trykk på bildet for å se før/etter
          </p>

          <div className="text-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/prosjekter")}
              className="hover-scale px-6 md:px-8"
            >
              Se alle prosjekter →
            </Button>
          </div>
          </>
        )}
        </div>
      </div>
      
      <SectionHeadingEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="home-sections"
        currentData={{
          heading: displayHeading,
          subheading: displaySubheading
        }}
        sectionLabel="Våre prosjekter"
      />
    </section>
  );
};
