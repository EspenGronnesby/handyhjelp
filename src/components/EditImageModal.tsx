import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageKey: string;
  currentImageUrl: string;
  onSave: (newImageUrl: string) => Promise<boolean>;
  label?: string;
}

export const EditImageModal = ({
  isOpen,
  onClose,
  imageKey,
  currentImageUrl,
  onSave,
  label
}: EditImageModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Valider filtype
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Ugyldig filtype",
        description: "Kun JPG, PNG og WebP er tillatt",
        variant: "destructive"
      });
      return;
    }

    // Valider størrelse (max 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "Filen er for stor",
        description: "Maksimal størrelse er 10 MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      // Upload til Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${imageKey}-${Date.now()}.${fileExt}`;
      const filePath = `site-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Få offentlig URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      // Lagre URL i database via onSave
      const success = await onSave(publicUrl);

      if (success) {
        toast({
          title: "✅ Bilde lastet opp",
          description: "Det nye bildet er lagret",
        });
        onClose();
        setFile(null);
        setPreview(null);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Feil ved opplasting",
        description: error?.message || "Prøv igjen",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Rediger bilde: {label || imageKey}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nåværende bilde:</Label>
            <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Ingen bilde
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Last opp nytt bilde:</Label>
            
            {preview ? (
              <div className="relative">
                <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Klikk eller dra og slipp
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  JPG, PNG eller WebP (maks 10 MB)
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Laster opp...
              </>
            ) : (
              <>💾 Lagre</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
