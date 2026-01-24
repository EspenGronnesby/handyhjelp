import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { ServiceBadge } from "@/lib/serviceIcons";

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
  category: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    setIsLoading(true);
    setNotFound(false);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setProject(data);
    }

    setIsLoading(false);
  };

  // Removed getCategoryLabel - now using ServiceBadge component

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <GoogleAnalytics />
        <Header />
        <BreadcrumbNavigation />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Laster prosjekt...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen">
        <GoogleAnalytics />
        <Header />
        <BreadcrumbNavigation />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-5xl">📸</span>
              </div>
              <h1 className="text-3xl font-bold mb-4 font-heading">
                Prosjekt ikke funnet
              </h1>
              <p className="text-muted-foreground mb-8">
                Dette prosjektet eksisterer ikke eller er ikke lenger tilgjengelig.
              </p>
              <Button onClick={() => navigate("/prosjekter")} variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tilbake til prosjekter
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{project.title} - HandyHjelp</title>
        <meta name="description" content={project.description} />
        <meta property="og:title" content={`${project.title} - HandyHjelp`} />
        <meta property="og:description" content={project.description} />
        <meta property="og:image" content={project.after_image_url} />
        <meta property="og:type" content="article" />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate("/prosjekter")}
            className="mb-6 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til prosjekter
          </Button>

          {/* Category Badge */}
          <ServiceBadge 
            serviceId={project.category}
            className="mb-4"
          />

          {/* Title */}
          <h1 className="heading-section font-heading mb-4">
            {project.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{project.location}</span>
            </div>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(project.completed_date).toLocaleDateString("nb-NO", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {/* Before/After Images */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Before Image */}
            <div className="relative">
              <div 
                className="relative rounded-2xl p-8 border border-white/40 h-[500px] md:h-[600px] w-full"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.8) 0%, rgba(240, 249, 255, 0.6) 50%, rgba(229, 246, 253, 0.7) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
              >
                <div className="relative flex items-center justify-center h-full w-full">
                  <img
                    src={project.before_image_url}
                    alt={`${project.title} - før`}
                    className="max-w-full max-h-full object-contain object-center rounded-lg"
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-semibold"
                >
                  FØR
                </Badge>
              </div>
            </div>

            {/* After Image */}
            <div className="relative">
              <div 
                className="relative rounded-2xl p-8 border border-white/40 h-[500px] md:h-[600px] w-full"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.8) 0%, rgba(240, 249, 255, 0.6) 50%, rgba(229, 246, 253, 0.7) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
              >
                <div className="relative flex items-center justify-center h-full w-full">
                  <img
                    src={project.after_image_url}
                    alt={`${project.title} - etter`}
                    className="max-w-full max-h-full object-contain object-center rounded-lg"
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-semibold"
                >
                  ETTER
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl font-bold mb-4 font-heading">
              Om prosjektet
            </h2>
            <p className="text-lg leading-relaxed text-foreground/90">
              {project.description}
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link to="/prosjekter">
              <Button variant="outline" size="lg">
                Se flere prosjekter
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
