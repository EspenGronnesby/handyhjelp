import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Clock, Award } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Rask respons og profesjonelt arbeid. Vårt borettslag har hatt fast avtale i 3 år og er meget fornøyde. Alt fra snømåking til mindre reparasjoner løses raskt og effektivt.",
      name: "Kari Nilsen",
      location: "Kristiansand",
      project: "Fast vaktmesteravtale",
      rating: 5
    },
    {
      quote: "Helt fantastisk håndverk! Terrassen vår ble som ny, og prisen var helt grei. De ryddet perfekt opp etter seg, og kvaliteten på arbeidet er upåklagelig. Anbefaler sterkt!",
      name: "Thomas Andersen",
      location: "Søgne",
      project: "Terrasseutskifting",
      rating: 5
    },
    {
      quote: "Fikk utbedret taklekkasje samme dag. Veldig fornøyd med både service og pris. De tok seg tid til å forklare problemet og løsningen grundig. Føler meg trygg på at jobben er gjort riktig.",
      name: "Linda Berg",
      location: "Vennesla",
      project: "Akutt taklekkasje",
      rating: 5
    }
  ];

  const trustBadges = [
    {
      icon: Shield,
      title: "Forsikret og sertifisert",
      description: "Full yrkesskadeforsikring"
    },
    {
      icon: Award,
      title: "100% tilfredsgaranti",
      description: "Vi gjør jobben riktig"
    },
    {
      icon: Clock,
      title: "Rask respons",
      description: "Svarer innen 2 timer"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Hva kundene sier
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Over 200 fornøyde kunder i Kristiansand-regionen
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {testimonial.project}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {trustBadges.map((badge, index) => (
            <div key={index} className="text-center p-6 bg-card rounded-lg">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <badge.icon className="h-6 w-6 text-success" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
