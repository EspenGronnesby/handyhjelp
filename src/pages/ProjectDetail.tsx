import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, BookOpen } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Helmet } from "react-helmet";
import { SEO_CONFIG, getCanonicalUrl, getOgImageUrl } from "@/config/seo";
import { ServiceBadge } from "@/lib/serviceIcons";
import { ProjectDetailSkeleton } from "@/components/ui/skeleton-loaders";

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
            <ProjectDetailSkeleton />
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
        <title>{project.title} | Prosjekt - HandyHjelp</title>
        <meta name="description" content={project.description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={getCanonicalUrl(`/prosjekter/${project.id}`)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={getCanonicalUrl(`/prosjekter/${project.id}`)} />
        <meta property="og:title" content={`${project.title} | Prosjekt - HandyHjelp`} />
        <meta property="og:description" content={project.description} />
        <meta property="og:image" content={project.after_image_url} />
        <meta property="og:locale" content={SEO_CONFIG.locale} />
        <meta name="twitter:card" content={SEO_CONFIG.twitterCard} />
        <meta name="twitter:title" content={`${project.title} | Prosjekt - HandyHjelp`} />
        <meta name="twitter:description" content={project.description} />
        <meta name="twitter:image" content={project.after_image_url} />
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

          {/* Before/After Images — dark-glass-stil som matcher hero-bakgrunnen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
            {/* Before Image */}
            <div className="relative">
              <div className="relative rounded-2xl p-3 md:p-8 h-[320px] md:h-[600px] w-full overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-2xl backdrop-saturate-150 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                {/* Top gradient-stripe — visuell signatur */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 pointer-events-none"
                  aria-hidden="true"
                />
                {/* Dot-pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-center h-full w-full">
                  <img
                    src={project.before_image_url}
                    alt={`${project.title} - før`}
                    className="max-w-full max-h-full object-contain object-center rounded-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-semibold z-10"
                >
                  FØR
                </Badge>
              </div>
            </div>

            {/* After Image */}
            <div className="relative">
              <div className="relative rounded-2xl p-3 md:p-8 h-[320px] md:h-[600px] w-full overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-2xl backdrop-saturate-150 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-center h-full w-full">
                  <img
                    src={project.after_image_url}
                    alt={`${project.title} - etter`}
                    className="max-w-full max-h-full object-contain object-center rounded-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-semibold z-10"
                >
                  ETTER
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-3xl mb-12">
            <SectionHeading
              icon={BookOpen}
              gradient="from-slate-500 via-zinc-600 to-gray-700"
              title="Om prosjektet"
            />
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
