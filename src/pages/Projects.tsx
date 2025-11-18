import { Header } from "@/components/Header";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Projects = () => {
  // Placeholder for future projects from database
  const projects: any[] = [];

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
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Se hvordan vi transformerer eiendom med kvalitetsarbeid
            </p>
          </div>

          {/* Service Filter Tabs */}
          <Tabs defaultValue="alle" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
              <TabsTrigger value="alle">Alle</TabsTrigger>
              <TabsTrigger value="vaktmester">Vaktmester</TabsTrigger>
              <TabsTrigger value="tømrer">Tømrer</TabsTrigger>
              <TabsTrigger value="blikk">Blikk</TabsTrigger>
            </TabsList>

            <TabsContent value="alle" className="mt-8">
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-5xl">📸</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 font-heading">Prosjekter kommer snart</h3>
                    <p className="text-muted-foreground">
                      Vi jobber med å legge til bilder av våre beste prosjekter. Kom tilbake snart!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {/* Image comparison will go here */}
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            Før/Etter bilder
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{project.service_category}</Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-2">{project.project_name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {project.description}
                          </p>
                          {project.customer_testimonial && (
                            <blockquote className="border-l-4 border-primary pl-3 py-2 bg-muted/30 rounded-r">
                              <p className="text-sm italic mb-1">"{project.customer_testimonial}"</p>
                              <cite className="text-xs text-muted-foreground">
                                - {project.customer_name}
                              </cite>
                            </blockquote>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="vaktmester" className="mt-8">
              <div className="text-center py-16 text-muted-foreground">
                Ingen vaktmesterprosjekter lagt til ennå.
              </div>
            </TabsContent>

            <TabsContent value="tømrer" className="mt-8">
              <div className="text-center py-16 text-muted-foreground">
                Ingen tømrerprosjekter lagt til ennå.
              </div>
            </TabsContent>

            <TabsContent value="blikk" className="mt-8">
              <div className="text-center py-16 text-muted-foreground">
                Ingen blikkprosjekter lagt til ennå.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} HandyHjelp. Alle rettigheter reservert.</p>
        </div>
      </footer>
    </div>
  );
};

export default Projects;
