import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, FileText, Trash2 } from 'lucide-react';
import { useFormDraft, useImageDraft } from '@/hooks/useFormDraft';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkerProjectFormProps {
  open: boolean;
  onClose: () => void;
}

const categoryOptions = [
  { value: 'vaktmester', label: 'Vaktmester' },
  { value: 'tomrer', label: 'Tømrer' },
  { value: 'blikk', label: 'Blikk' },
  { value: 'takrennerens', label: 'Takrennerens' },
  { value: 'annet', label: 'Annet' },
];

const initialFormData = {
  title: '',
  description: '',
  category: 'vaktmester',
  location: '',
  completed_date: new Date().toISOString().split('T')[0],
};

export const WorkerProjectForm = ({ open, onClose }: WorkerProjectFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use draft hooks for persistent storage
  const { 
    data: formData, 
    setData: setFormData, 
    hasDraft: hasFormDraft, 
    clearDraft: clearFormDraft 
  } = useFormDraft({
    key: 'worker-project-form',
    initialData: initialFormData,
    userId: user?.id,
    enabled: open,
  });
  
  const {
    previews,
    setPreview,
    clearPreview,
    clearAllPreviews,
    hasDraft: hasImageDraft,
  } = useImageDraft({
    key: 'worker-project-form',
    userId: user?.id,
    enabled: open,
  });
  
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Get previews from draft or state
  const beforePreview = previews.before || '';
  const afterPreview = previews.after || '';
  
  const hasDraft = hasFormDraft || hasImageDraft;

  const handleImageChange = (type: 'before' | 'after', file: File | null) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Feil', description: 'Bildet kan ikke være større enn 10 MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'before') {
        setBeforeImage(file);
        setPreview('before', base64);
      } else {
        setAfterImage(file);
        setPreview('after', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, prefix: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const submitProject = useMutation({
    mutationFn: async () => {
      if (!beforeImage || !afterImage) {
        throw new Error('Begge bilder må lastes opp');
      }

      setUploading(true);
      
      const beforeUrl = await uploadImage(beforeImage, 'before');
      const afterUrl = await uploadImage(afterImage, 'after');

      const { data: project, error } = await supabase
        .from('projects')
        .insert([{
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          completed_date: formData.completed_date,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
          status: 'pending_approval',
          submitted_by: user?.id,
          submitted_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notification to all admins and owners
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'platform_owner']);

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          user_id: admin.user_id,
          title: 'Nytt prosjekt til godkjenning',
          message: `${user?.email || 'En worker'} har sendt inn prosjektet "${formData.title}"`,
          type: 'content_submission',
        }));

        await supabase.from('notifications').insert(notifications);
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
      toast({ title: 'Innsendt', description: 'Prosjektet er sendt til godkjenning.' });
      handleSuccessClose();
    },
    onError: (error: any) => {
      toast({ title: 'Feil', description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const clearAllDrafts = () => {
    clearFormDraft();
    clearAllPreviews();
    setBeforeImage(null);
    setAfterImage(null);
  };

  // Called only on successful submission - clear drafts
  const handleSuccessClose = () => {
    clearAllDrafts();
    onClose();
  };

  // Called when user explicitly clicks "Avbryt"
  const handleCancel = () => {
    const hasData = formData.title !== '' || 
                   formData.description !== '' || 
                   formData.location !== '' ||
                   beforePreview !== '' || 
                   afterPreview !== '';
    
    if (hasData) {
      if (!confirm('Du har et utkast lagret. Vil du slette utkastet og avbryte?')) {
        return;
      }
      clearAllDrafts();
    }
    onClose();
  };

  // Called on dialog backdrop click or escape - just close, keep draft
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const isTitleValid = formData.title.length >= 5 && formData.title.length <= 100;
  const isDescriptionValid = formData.description.length >= 10 && formData.description.length <= 200;
  const isFormValid = isTitleValid && isDescriptionValid && (beforeImage || beforePreview) && (afterImage || afterPreview);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTitleValid) {
      toast({ title: 'Feil', description: 'Tittel må være mellom 5 og 100 tegn', variant: 'destructive' });
      return;
    }
    if (!isDescriptionValid) {
      toast({ title: 'Feil', description: 'Beskrivelse må være mellom 10 og 200 tegn', variant: 'destructive' });
      return;
    }
    if (!beforeImage && !beforePreview) {
      toast({ title: 'Feil', description: 'Du må laste opp et før-bilde', variant: 'destructive' });
      return;
    }
    if (!afterImage && !afterPreview) {
      toast({ title: 'Feil', description: 'Du må laste opp et etter-bilde', variant: 'destructive' });
      return;
    }
    submitProject.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nytt prosjekt</DialogTitle>
          <DialogDescription>
            Fyll ut informasjon og last opp før/etter bilder
          </DialogDescription>
        </DialogHeader>
        
        {hasDraft && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <FileText className="h-4 w-4" />
              <span>Utkast lastet inn automatisk</span>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={clearAllDrafts}
              className="text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Slett utkast
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Tittel (5-100 tegn)"
              maxLength={100}
            />
            <p className={`text-xs mt-1 ${isTitleValid ? 'text-muted-foreground' : 'text-destructive'}`}>
              {formData.title.length}/100 tegn (minimum 5)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Beskrivelse *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Beskriv arbeidet som ble utført (10-200 tegn)"
              maxLength={200}
            />
            <p className={`text-xs mt-1 ${isDescriptionValid ? 'text-muted-foreground' : 'text-destructive'}`}>
              {formData.description.length}/200 tegn (minimum 10)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Sted *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="F.eks. Oslo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="completed_date">Fullført dato *</Label>
            <Input
              id="completed_date"
              type="date"
              value={formData.completed_date}
              onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Før-bilde *</Label>
              <div className="mt-2">
                {beforePreview ? (
                  <div className="relative">
                    <img src={beforePreview} alt="Før" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setBeforeImage(null);
                        clearPreview('before');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Last opp før-bilde</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange('before', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Etter-bilde *</Label>
              <div className="mt-2">
                {afterPreview ? (
                  <div className="relative">
                    <img src={afterPreview} alt="Etter" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setAfterImage(null);
                        clearPreview('after');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Last opp etter-bilde</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange('after', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Avbryt
            </Button>
            <Button 
              type="submit" 
              variant="cta"
              disabled={uploading || !isFormValid || submitProject.isPending}
            >
              {(uploading || submitProject.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send til godkjenning
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
