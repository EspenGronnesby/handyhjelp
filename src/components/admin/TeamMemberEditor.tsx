import { useState } from 'react';
import { Edit2, Trash2, Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  image_url: string;
  display_order: number;
}

interface TeamMemberEditorProps {
  member?: TeamMember;
  onUpdate?: () => void;
  isNewMember?: boolean;
}

export const TeamMemberEditor = ({ member, onUpdate, isNewMember = false }: TeamMemberEditorProps) => {
  const { isAdmin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(member?.name || '');
  const [position, setPosition] = useState(member?.position || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Kun bildefiler er tillatt');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Filen er for stor. Maks 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name || !position) {
      toast.error('Navn og posisjon er påkrevd');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = member?.image_url || '';

      // Upload new image if selected
      const fileInput = document.getElementById(`team-upload-${member?.id || 'new'}`) as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `team-${member?.id || Date.now()}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('team-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('team-images')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      if (!imageUrl && isNewMember) {
        toast.error('Vennligst last opp et bilde');
        return;
      }

      // Save to database
      if (member?.id) {
        // Update existing
        const { error } = await supabase
          .from('team_members')
          .update({
            name,
            position,
            image_url: imageUrl,
          })
          .eq('id', member.id);

        if (error) throw error;
        toast.success('Teammedlem oppdatert!');
      } else {
        // Insert new
        const { error } = await supabase
          .from('team_members')
          .insert({
            name,
            position,
            image_url: imageUrl,
            display_order: 999, // Will be at the end
          });

        if (error) throw error;
        toast.success('Teammedlem lagt til!');
      }

      setIsOpen(false);
      setPreviewUrl(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Kunne ikke lagre teammedlem');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!member?.id) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      toast.success('Teammedlem slettet');
      setIsDeleteDialogOpen(false);
      setIsOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Kunne ikke slette teammedlem');
    }
  };

  if (isNewMember) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <Plus className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-primary">Legg til teammedlem</span>
        </button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Legg til teammedlem</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {previewUrl && (
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="team-upload-new"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="team-upload-new"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Last opp profilbilde
                  </p>
                </label>
              </div>

              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="F.eks. Espen Grønnesby"
                />
              </div>

              <div>
                <Label htmlFor="position">Posisjon</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="F.eks. Daglig leder"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? 'Lagrer...' : 'Lagre'}
                </Button>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    setPreviewUrl(null);
                    setName('');
                    setPosition('');
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
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all opacity-0 group-hover:opacity-100"
        title="Rediger teammedlem"
      >
        <Edit2 className="w-4 h-4 text-primary" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rediger teammedlem</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : member?.image_url ? (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={member.image_url} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                id={`team-upload-${member?.id}`}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor={`team-upload-${member?.id}`}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Endre profilbilde
                </p>
              </label>
            </div>

            <div>
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="position">Posisjon</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? 'Lagrer...' : 'Lagre'}
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Slett
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setPreviewUrl(null);
                }}
                variant="outline"
              >
                Avbryt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette teammedlemmet. Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
