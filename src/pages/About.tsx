import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { TeamMemberEditor } from "@/components/admin/TeamMemberEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import heroAboutImg from "@/assets/hero-caretaker.jpg";
import { EditableHero } from "@/components/EditableHero";
import { EditableAboutContent } from "@/components/EditableAboutContent";
import { EditableTimeline } from "@/components/EditableTimeline";
import { EditableWhyUs } from "@/components/EditableWhyUs";
import { EditableCertifications } from "@/components/EditableCertifications";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";

const About = () => {
  const { heroImage } = useHeroImage('about', heroAboutImg);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <EditableHero 
          section="hero-om-oss"
          defaultHeading="Om HandyHjelp"
          defaultSubtext="Din pålitelige partner for eiendomspleie og håndverksarbeid"
          backgroundImage={heroImage}
          className="h-[500px]"
        />

        {/* Main Content */}
        <section className="container mx-auto px-4 py-20">
          <EditableAboutContent />

          {/* Timeline Section */}
          <EditableTimeline />

          {/* Why Choose Us Section */}
          <EditableWhyUs />

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
          <EditableCertifications />
        </section>

        {/* CTA Section */}
        <EditableBottomCTA />
      </main>

      <Footer />
    </div>
  );
};

export default About;
