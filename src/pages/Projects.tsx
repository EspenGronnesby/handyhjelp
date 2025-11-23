import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  category: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [touchedProject, setTouchedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("projects-gallery-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          console.log("🔄 Projects changed, refetching...");
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    console.log("🔍 [Projects Page] Fetching projects...");
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("completed_date", { ascending: false });

    if (error) {
      console.error("❌ [Projects Page] Error fetching projects:", error);
      console.error("❌ [Projects Page] Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
    } else {
      console.log("✅ [Projects Page] Projects loaded:", data?.length || 0);
      console.log("📊 [Projects Page] Projects data:", data);
      setProjects(data || []);
      setFilteredProjects(data || []);
    }
    
    setIsLoading(false);
  };

  const handleCategoryFilter = (category: string | null) => {
    console.log("🔍 [Projects Page] Filtering by category:", category);
    setActiveCategory(category);
    if (category === null) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((p) => p.category === category);
      console.log(`📊 [Projects Page] Filtered ${filtered.length} projects for category ${category}`);
      setFilteredProjects(filtered);
    }
  };

  const handleTouch = (projectId: string) => {
    setTouchedProject(touchedProject === projectId ? null : projectId);
  };

  const isShowingAfter = (projectId: string) => {
    return hoveredProject === projectId || touchedProject === projectId;
  };

  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="heading-section font-heading mb-4">
              Våre prosjekter
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Se hvordan vi transformerer eiendom med kvalitetsarbeid – før og etter bilder fra våre beste prosjekter
            </p>

            {/* Category Filter */}
            {projects.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Button
                  variant={activeCategory === null ? "default" : "outline"}
                  onClick={() => handleCategoryFilter(null)}
                  className="px-6"
                >
                  Alle ({projects.length})
                </Button>
                <Button
                  variant={activeCategory === "vaktmester" ? "default" : "outline"}
                  onClick={() => handleCategoryFilter("vaktmester")}
                  className="px-6"
                >
                  🔧 Vaktmester ({projects.filter(p => p.category === "vaktmester").length})
                </Button>
                <Button
                  variant={activeCategory === "tomrer" ? "default" : "outline"}
                  onClick={() => handleCategoryFilter("tomrer")}
                  className="px-6"
                >
                  🔨 Tømrer ({projects.filter(p => p.category === "tomrer").length})
                </Button>
                <Button
                  variant={activeCategory === "blikk" ? "default" : "outline"}
                  onClick={() => handleCategoryFilter("blikk")}
                  className="px-6"
                >
                  💧 Blikk ({projects.filter(p => p.category === "blikk").length})
                </Button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Laster prosjekter...</p>
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-5xl">📸</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 font-heading">
                      {projects.length === 0 
                        ? "Prosjekter kommer snart"
                        : "Ingen prosjekter i denne kategorien"}
                    </h3>
                    <p className="text-muted-foreground">
                      {projects.length === 0
                        ? "Vi jobber med å legge til bilder av våre beste prosjekter. Kom tilbake snart!"
                        : "Vi har ikke publisert noen prosjekter i denne kategorien ennå."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer animate-fade-in hover:shadow-2xl transition-shadow duration-300"
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

                        {/* Badges */}
                        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                          <Badge
                            variant="secondary"
                            className="bg-background/90 backdrop-blur-sm text-foreground font-semibold"
                          >
                            {project.category === "vaktmester" ? "🔧 Vaktmester" : 
                             project.category === "tomrer" ? "🔨 Tømrer" : "💧 Blikk"}
                          </Badge>
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
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
