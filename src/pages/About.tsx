import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Award, Shield, Clock, Users, CheckCircle2, Star } from "lucide-react";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { TeamMemberEditor } from "@/components/admin/TeamMemberEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import heroAboutImg from "@/assets/hero-caretaker.jpg";

const About = () => {
  const { heroImage, opacity, refetch: refetchHero } = useHeroImage('about', heroAboutImg);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const timeline = [
    { year: "2004", event: "HandyHjelp ble grunnlagt i Kristiansand" },
    { year: "2008", event: "Utvidet til å tilby blikkenslagertjenester" },
    { year: "2012", event: "Nådde milepælen med 100 fornøyde bedriftskunder" },
    { year: "2016", event: "Fikk sertifisering som godkjent entreprenør" },
    { year: "2020", event: "Lanserte faste vedlikeholdsavtaler for bedrifter" },
    { year: "2025", event: "Over 200 faste kunder og 20+ års erfaring" },
  ];

  const whyChooseUs = [
    {
      icon: Clock,
      title: "20+ års erfaring",
      description: "To tiår med profesjonell eiendomspleie i Kristiansand-regionen"
    },
    {
      icon: Shield,
      title: "Fullt forsikret",
      description: "Omfattende forsikringsdekning for alle typer oppdrag"
    },
    {
      icon: Award,
      title: "Sertifisert kvalitet",
      description: "Godkjent av Direktoratet for byggkvalitet (DiBK)"
    },
    {
      icon: Users,
      title: "Erfarne fagfolk",
      description: "Alle våre ansatte har fagbrev og dokumentert erfaring"
    },
    {
      icon: CheckCircle2,
      title: "100% tilfredsgaranti",
      description: "Vi står for arbeidet vårt og fikser eventuelle mangler kostnadsfritt"
    },
    {
      icon: Star,
      title: "Høy kundetilfredshet",
      description: "4.8/5 stjerner basert på 200+ kundeanmeldelser"
    },
  ];

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Om HandyHjelp - Din pålitelige partner for eiendomspleie</title>
        <meta name="description" content="HandyHjelp har levert profesjonell eiendomspleie og håndverkstjenester i Kristiansand siden 2004. Møt teamet og les om vår erfaring." />
      </Helmet>

      <Header />
      <BreadcrumbNavigation />
      
      <main>
        {/* Hero Section with Background Image */}
        <section 
          className="relative h-[500px] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-r from-black to-black"
            style={{ opacity: opacity * 0.7 }}
          ></div>
          <HeroImageEditor page="about" currentImageUrl={heroImage} onImageUpdate={refetchHero} />
          
          <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Om HandyHjelp
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Din pålitelige partner for eiendomspleie og håndverksarbeid
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Din pålitelige partner i 20+ år
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Fra små reparasjoner til store vedlikeholdsprosjekter - HandyHjelp har vært 
              Kristiansands foretrukne valg for eiendomspleie siden 2004.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/kontakt">
                <Button variant="cta" size="lg">Møt teamet</Button>
              </Link>
              <Link to="/#quote-form">
                <Button variant="cta-outline" size="lg">Få tilbud</Button>
              </Link>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-muted rounded-2xl p-12 mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Vår reise</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-20 text-right">
                      <span className="text-2xl font-bold text-primary">{item.year}</span>
                    </div>
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1 pb-8 border-l-2 border-border pl-6 -ml-2">
                      <p className="text-lg">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Hvorfor velge oss?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseUs.map((item, index) => (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <item.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section with Admin Editing */}
          <div className="bg-muted rounded-2xl p-12 mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">Møt teamet</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Våre erfarne fagfolk er klar til å hjelpe deg med alle dine eiendomsbehov
            </p>
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Laster teammedlemmer...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="relative group">
                    <TeamMemberEditor member={member} onUpdate={fetchTeamMembers} />
                    <CardContent className="pt-6 text-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                        <img 
                          src={member.image_url} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Team Member Card (Admin only) */}
                <TeamMemberEditor isNewMember onUpdate={fetchTeamMembers} />
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Sertifiseringer & Kvalifikasjoner</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <Award className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Offisielle godkjenninger</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Godkjent av Direktoratet for byggkvalitet (DiBK)</li>
                    <li>✓ Sertifisert elektriker med autorisasjon</li>
                    <li>✓ VVS-autorisasjon for sanitær og varme</li>
                    <li>✓ Miljøsertifisert for håndtering av avfall</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Forsikring & Garantier</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Fullverdig yrkesskadeforsikring</li>
                    <li>✓ Ansvarsforsikring opp til 10 mill. kr</li>
                    <li>✓ 5 års garanti på håndverksarbeid</li>
                    <li>✓ 2 års garanti på materialer og utstyr</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Klar til å komme i gang?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Kontakt oss i dag for en uforpliktende samtale om dine eiendomsbehov
            </p>
            <Link to="/kontakt">
              <Button variant="secondary" size="lg">
                Ta kontakt med oss
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
