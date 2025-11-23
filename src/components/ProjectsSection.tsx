import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
}

export const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [touchedProject, setTouchedProject] = useState<string | null>(null);
  const navigate = useNavigate();

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
      .order("display_order", { ascending: true })
      .order("completed_date", { ascending: false })
      .limit(6);

    if (!error && data) {
      setProjects(data);
    }
  };

  const handleTouch = (projectId: string) => {
    setTouchedProject(touchedProject === projectId ? null : projectId);
  };

  const isShowingAfter = (projectId: string) => {
    return hoveredProject === projectId || touchedProject === projectId;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-section font-heading mb-4">
            Våre prosjekter
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Se resultatet av vårt arbeid – før og etter bilder av våre siste prosjekter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer animate-fade-in"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              onClick={() => handleTouch(project.id)}
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

                {/* Badge */}
                <div className="absolute top-4 right-4 z-10">
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
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/prosjekter")}
            className="hover-scale"
          >
            Se alle prosjekter
          </Button>
        </div>
      </div>
    </section>
  );
};
