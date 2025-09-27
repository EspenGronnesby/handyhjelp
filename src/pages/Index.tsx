import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProcessSection } from "@/components/ProcessSection";
import { QuoteForm } from "@/components/QuoteForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Integrated Quote Form */}
      <HeroSection />
      
      {/* How It Works Process Section */}
      <div id="process-section">
        <ProcessSection />
      </div>

      {/* Standalone Quote Form Section for Mobile/Additional Access */}
      <section className="py-16 bg-muted/30" id="quote-standalone">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="heading-section">Ready to Get Started?</h2>
              <p className="text-muted-foreground text-lg">
                Submit your request and connect with professional caretakers in your area.
              </p>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
