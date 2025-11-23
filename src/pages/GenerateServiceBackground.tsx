import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GenerateServiceBackground = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Create a professional, high-quality background image for a handyman and property maintenance services website. The image should show:
- A modern Norwegian building exterior with clean, well-maintained appearance
- Professional handymen or caretakers in work uniforms (blue work clothes)
- Tool belts with professional tools visible
- Bright, natural daylight with slightly overcast Norwegian sky
- Professional and trustworthy atmosphere
- Subtle depth of field to allow text overlay
- Colors: Professional blues, grays, and natural tones that convey reliability
- Wide angle, landscape orientation suitable as a website background
- No faces clearly visible to maintain professional neutrality
- Clean, organized work environment
Style: Photorealistic, professional, bright, welcoming, Nordic aesthetic`;

      const { data, error } = await supabase.functions.invoke('generate-service-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        toast.success("Bilde generert! Høyreklikk og last ned bildet.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Kunne ikke generere bilde");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Generer Tjenester Bakgrunnsbilde</h1>
        
        <Button 
          onClick={generateImage} 
          disabled={isGenerating}
          size="lg"
          className="w-full"
        >
          {isGenerating ? "Genererer..." : "Generer Nytt Bilde"}
        </Button>

        {imageUrl && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Høyreklikk på bildet og velg "Lagre bilde som..." for å laste det ned.
              Erstatt deretter filen i src/assets/hero-services-background.png
            </p>
            <img 
              src={imageUrl} 
              alt="Generated service background" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateServiceBackground;
