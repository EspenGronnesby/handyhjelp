import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';

interface HeroImageEditorProps {
  page: string;
  currentImageUrl?: string;
  onImageUpdate?: () => void;
}

export const HeroImageEditor = ({ page, currentImageUrl, onImageUpdate }: HeroImageEditorProps) => {
  const { isAdmin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(85);

  if (!isAdmin) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Kun bildefiler er tillatt');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Filen er for stor. Maks 10MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById(`hero-upload-${page}`) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${page}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(uploadData.path);

      // Update or insert hero_images record
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from('hero_images')
        .upsert({
          page,
          image_url: publicUrl,
          opacity: opacity / 100, // Convert percentage to decimal (0-1)
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page'
        });

      if (dbError) throw dbError;

      toast.success('Hero-bildet er oppdatert!');
      setIsOpen(false);
      setPreviewUrl(null);
      onImageUpdate?.();
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast.error('Kunne ikke laste opp bildet');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 z-[100] p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all border border-border shadow-sm hover:shadow-md"
        title="Rediger hero-bilde"
      >
        <Camera className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rediger Hero-bilde</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : currentImageUrl ? (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img 
                  src={currentImageUrl} 
                  alt="Current hero" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                id={`hero-upload-${page}`}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor={`hero-upload-${page}`}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Klikk for å laste opp nytt bilde
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG eller WebP (maks 10MB)
                </p>
              </label>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="opacity-slider" className="text-sm font-medium">
                  Bakgrunns-opasitet (overlay)
                </Label>
                <span className="text-sm text-muted-foreground">{opacity}%</span>
              </div>
              <Slider
                id="opacity-slider"
                min={0}
                max={100}
                step={5}
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Justerer hvor mørk overlayen er over bakgrunnsbildet. Høyere verdi = mørkere.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!previewUrl || uploading}
                className="flex-1"
              >
                {uploading ? 'Laster opp...' : 'Lagre'}
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setPreviewUrl(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Avbryt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
