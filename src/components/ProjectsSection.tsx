import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Pencil } from "lucide-react";
import { useEditableContent } from "@/hooks/useEditableContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { SectionHeadingEditModal } from "./SectionHeadingEditModal";
import { ServiceBadge } from "@/lib/serviceIcons";

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
  const displaySubheading = subheading || 'Se resultatet av vårt arbeid – før og etter bilder av våre siste prosjekter';

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
    console.log("🔍 Fetching projects for homepage...");
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("completed_date", { ascending: false });

    if (error) {
      console.error("❌ Error fetching projects:", error);
      setProjects([]);
    } else {
      console.log("✅ All projects loaded:", data?.length || 0);
      
      // Select 1 project from each category (vaktmester, tomrer, blikk)
      const selectedProjects: Project[] = [];
      const categories = ["vaktmester", "tomrer", "blikk"];
      
      categories.forEach(category => {
        const categoryProject = data?.find(p => p.category === category && !selectedProjects.includes(p));
        if (categoryProject) {
          selectedProjects.push(categoryProject);
        }
      });
      
      // If we have less than 3 projects, fill with remaining projects
      if (selectedProjects.length < 3 && data) {
        const remaining = data.filter(p => !selectedProjects.includes(p));
        selectedProjects.push(...remaining.slice(0, 3 - selectedProjects.length));
      }
      
      console.log("📊 Selected projects for homepage:", selectedProjects.length);
      setProjects(selectedProjects.slice(0, 3)); // Ensure max 3 projects
    }
  };

  const handleTouch = (projectId: string) => {
    setTouchedProject(touchedProject === projectId ? null : projectId);
  };

  const isShowingAfter = (projectId: string) => {
    return hoveredProject === projectId || touchedProject === projectId;
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12">
        <div className="relative text-center mb-12">
          {isAdmin && editMode && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-0 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
              aria-label="Rediger Våre prosjekter overskrift"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </button>
          )}
          
          <h2 className="heading-section font-heading mb-4">
            {displayHeading}
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {displaySubheading}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">
              Vi legger snart ut bilder fra våre prosjekter
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {projects.map((project) => (
              <Link
                key={project.id}
                to={`/prosjekter/${project.id}`}
                className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer animate-fade-in hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onTouchStart={() => setTouchedProject(project.id)}
                onTouchEnd={() => setTouchedProject(null)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
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
                  <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                    <ServiceBadge 
                      serviceId={project.category} 
                      className="bg-background/90 backdrop-blur-sm"
                    />
                    <Badge
                      variant="secondary"
                      className="bg-background/90 backdrop-blur-sm text-foreground font-semibold"
                    >
                      {isShowingAfter(project.id) ? "ETTER" : "FØR"}
                    </Badge>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4 bg-card">
                  <h3 className="font-heading font-bold text-lg mb-2 text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.location}</span>
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

          <div className="text-center mt-8">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/prosjekter")}
              className="hover-scale px-8"
            >
              Se alle våre prosjekter →
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
