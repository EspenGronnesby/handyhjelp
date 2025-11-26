import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

  // Debug logging for admin status
  console.log('HeroImageEditor - isAdmin:', isAdmin, 'page:', page);

  if (!isAdmin) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Kun bildefiler er tillatt');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Filen er for stor. Maks 2MB.');
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
        className="absolute top-2 right-2 z-[100] p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all border border-border shadow-sm hover:shadow-md"
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
                  JPG, PNG eller WebP (maks 2MB)
                </p>
              </label>
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
