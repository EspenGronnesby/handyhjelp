import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { EditableHero } from "@/components/EditableHero";
import { Helmet } from "react-helmet";

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
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("completed_date", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
      setFilteredProjects(data || []);
    }
    
    setIsLoading(false);
  };

  const handleCategoryFilter = (category: string | null) => {
    setActiveCategory(category);
    if (category === null) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((p) => p.category === category);
      setFilteredProjects(filtered);
    }
  };

  const isShowingAfter = (projectId: string) => {
    return hoveredProject === projectId || touchedProject === projectId;
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Våre prosjekter | HandyHjelp</title>
        <meta name="description" content="Se før- og etterbilder fra våre prosjekter. Kvalitetsarbeid innen vaktmester, tømrer og blikkenslagerarbeid." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Våre prosjekter | HandyHjelp" />
        <meta property="og:description" content="Se før- og etterbilder fra våre prosjekter. Kvalitetsarbeid innen vaktmester, tømrer og blikkenslagerarbeid." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/prosjekter" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Våre prosjekter | HandyHjelp" />
        <meta name="twitter:description" content="Se før- og etterbilder fra våre prosjekter. Kvalitetsarbeid innen vaktmester, tømrer og blikkenslagerarbeid." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <EditableHero
            section="hero-prosjekter"
            defaultHeading="Våre prosjekter"
            defaultSubtext="Se hvordan vi transformerer eiendom med kvalitetsarbeid – før og etter bilder fra våre beste prosjekter"
            className="mb-12"
          />

          {/* Category Filter */}
          {projects.length > 0 && (
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-2 md:gap-3 mb-6 md:mb-8">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                onClick={() => handleCategoryFilter(null)}
                aria-label="Filtrer etter alle kategorier"
                className="flex-shrink-0 px-4 md:px-6 min-h-[44px]"
              >
                Alle ({projects.length})
              </Button>
              <Button
                variant={activeCategory === "vaktmester" ? "default" : "outline"}
                onClick={() => handleCategoryFilter("vaktmester")}
                aria-label="Filtrer etter vaktmester"
                className="flex-shrink-0 px-4 md:px-6 min-h-[44px]"
              >
                🔧 Vaktmester ({projects.filter(p => p.category === "vaktmester").length})
              </Button>
              <Button
                variant={activeCategory === "tomrer" ? "default" : "outline"}
                onClick={() => handleCategoryFilter("tomrer")}
                aria-label="Filtrer etter tømrer"
                className="flex-shrink-0 px-4 md:px-6 min-h-[44px]"
              >
                🔨 Tømrer ({projects.filter(p => p.category === "tomrer").length})
              </Button>
              <Button
                variant={activeCategory === "blikk" ? "default" : "outline"}
                onClick={() => handleCategoryFilter("blikk")}
                aria-label="Filtrer etter blikk"
                className="flex-shrink-0 px-4 md:px-6 min-h-[44px]"
              >
                💧 Blikk ({projects.filter(p => p.category === "blikk").length})
              </Button>
            </div>
          )}

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
                    </Link>
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
