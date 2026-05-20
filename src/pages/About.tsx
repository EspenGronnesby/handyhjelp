import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamMemberEditor } from "@/components/admin/TeamMemberEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import { supabase } from "@/integrations/supabase/client";
import { PageSEO } from "@/components/SEO/PageSEO";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import heroAboutImg from "@/assets/hero-caretaker.jpg";
import { EditableHero } from "@/components/EditableHero";
import { EditableTimeline } from "@/components/EditableTimeline";
import { EditableWhyUs } from "@/components/EditableWhyUs";
import { EditableCertifications } from "@/components/EditableCertifications";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";
import { TrustStripe } from "@/components/TrustStripe";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useFadeInUp, useStaggeredGridReveal } from "@/hooks/useScrollAnimation";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { SectionEditModal } from "@/components/SectionEditModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Users } from "lucide-react";

const About = () => {
  const { heroImage, opacity, refetch: refetchHero } = useHeroImage('about', heroAboutImg);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { editMode, isAdmin } = useEditMode();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const { content: teamHeading } = useEditableContent('about-team', 'heading');
  const { content: teamSubtext } = useEditableContent('about-team', 'subtext');
  const displayTeamHeading = teamHeading || 'Møt teamet';
  const displayTeamSubtext = teamSubtext || 'Våre erfarne fagfolk er klar til å hjelpe deg med alle dine eiendomsbehov';

  // Scroll animations
  const { ref: whyUsRef, style: whyUsStyle } = useFadeInUp({ threshold: 0.1 });
  const { ref: teamRef, isVisible: teamVisible, getItemStyle: getTeamItemStyle } = useStaggeredGridReveal(8, 4, { threshold: 0.1 });
  const { ref: certRef, style: certStyle } = useFadeInUp({ threshold: 0.1 });

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
      <PageSEO path="/om-oss" />

      <Header />
      <BreadcrumbNavigation />
      
      <main>
        {/* Hero Section with Background Image */}
        <div className="relative">
          <HeroImageEditor page="about" currentImageUrl={heroImage} onImageUpdate={refetchHero} />
          <EditableHero
            section="hero-om-oss"
            defaultHeading="Om HandyHjelp"
            defaultSubtext="Din pålitelige partner for eiendomspleie og håndverksarbeid"
            backgroundImage={heroImage}
            className="h-[500px]"
            contentPosition="lower"
          >
            <div className="flex gap-4 justify-center">
              <a href="#team" onClick={(e) => { e.preventDefault(); document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <Button variant="cta" size="lg" className="md:text-lg md:px-8">Møt teamet</Button>
              </a>
              <Link to="/#quote-form">
                <Button variant="cta-outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20 md:text-lg md:px-8">Få tilbud</Button>
              </Link>
            </div>
          </EditableHero>
        </div>

        {/* Trust-stripe rett under hero (Mr. Handyman-mønster) */}
        <TrustStripe />

        {/* Main Content */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          {/* Timeline Section */}
          <EditableTimeline />

          {/* Why Choose Us Section */}
          <div ref={whyUsRef} style={whyUsStyle}>
            <EditableWhyUs />
          </div>

          {/* Team Section with Admin Editing */}
          <div id="team" className="bg-muted/40 rounded-2xl p-8 md:p-12 mb-20 scroll-mt-24 relative" ref={teamRef}>
            {isAdmin && editMode && (
              <EditButton
                onClick={() => setIsTeamModalOpen(true)}
                ariaLabel="Rediger team-overskrift"
              />
            )}
            <div className={`max-w-4xl mx-auto mb-10 md:mb-12 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <SectionHeading
                icon={Users}
                gradient="from-amber-500 via-orange-500 to-rose-600"
                title={displayTeamHeading}
                subtitle={displayTeamSubtext}
              />
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Laster teammedlemmer...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="glass-card relative group p-6 text-center" style={getTeamItemStyle(index)}>
                    <TeamMemberEditor member={member} onUpdate={fetchTeamMembers} />
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                  </div>
                ))}

                {/* Add New Team Member Card (Admin only) */}
                <TeamMemberEditor isNewMember onUpdate={fetchTeamMembers} />
              </div>
            )}
          </div>

          {/* Vår garanti — Mr. Handyman-stil "Done Right Promise" */}
          <div className="-mx-4 mb-16">
            <GuaranteeSection />
          </div>

          {/* Certifications Section */}
          <div ref={certRef} style={certStyle}>
            <EditableCertifications />
          </div>
        </section>

        {/* CTA Section */}
        <EditableBottomCTA />
      </main>

      <Footer />

      <SectionEditModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Rediger team-seksjon"
        fields={[
          {
            section: 'about-team',
            contentKey: 'heading',
            label: 'Overskrift',
            value: displayTeamHeading,
            maxLength: 60,
            placeholder: 'Møt teamet',
          },
          {
            section: 'about-team',
            contentKey: 'subtext',
            label: 'Undertekst',
            value: displayTeamSubtext,
            multiline: true,
            maxLength: 200,
            placeholder: 'Våre erfarne fagfolk...',
          },
        ]}
      />
    </div>
  );
};

export default About;
