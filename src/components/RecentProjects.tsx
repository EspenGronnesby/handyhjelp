import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const RecentProjects = () => {
  const projects = [
    {
      id: 1,
      title: "Terrasseutskifting - Søgne",
      category: "Tømrer",
      description: "Komplett utskifting av 35 kvm terrasse med nye bjelker og terrassebord. Inkludert rekkverk og trapp.",
      image: "/placeholder.svg",
      duration: "5 dager"
    },
    {
      id: 2,
      title: "Takrenner - Borettslag Lund",
      category: "Blikk",
      description: "Montering av nye takrenner og nedløp på borettslag med 12 leiligheter. Full utskifting av gammelt system.",
      image: "/placeholder.svg",
      duration: "3 dager"
    },
    {
      id: 3,
      title: "Fast vaktmester - Bedriftseiendom",
      category: "Vaktmester",
      description: "Månedlig vaktmesteravtale for større bedriftseiendom. Inkluderer renhold, småreprasjoner og sesongbasert vedlikehold.",
      image: "/placeholder.svg",
      duration: "Løpende avtale"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Se våre siste prosjekter
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kvalitetsarbeid som taler for seg selv
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  {project.category}
                </Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{project.duration}</span>
                  <Button variant="link" className="p-0 h-auto">
                    Les mer →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/prosjekter">
            <Button variant="cta-outline" size="lg">
              Se alle prosjekter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
