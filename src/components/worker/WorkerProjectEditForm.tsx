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
import { ImageDropZone } from '@/components/ui/ImageDropZone';
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

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  completed_date: string;
  before_image_url: string;
  after_image_url: string;
}

interface WorkerProjectEditFormProps {
  project: Project | null;
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

export const WorkerProjectEditForm = ({ project, open, onClose }: WorkerProjectEditFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const initialFormData = {
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'vaktmester',
    location: project?.location || '',
    completed_date: project?.completed_date?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
  
  // Use draft hooks for persistent storage with project-specific key
  const draftKey = project ? `worker-project-edit-${project.id}` : 'worker-project-edit-new';
  
  const { 
    data: formData, 
    setData: setFormData, 
    hasDraft: hasFormDraft, 
    clearDraft: clearFormDraft 
  } = useFormDraft({
    key: draftKey,
    initialData: initialFormData,
    userId: user?.id,
    enabled: open && !!project,
  });
  
  const {
    previews,
    setPreview,
    clearPreview,
    clearAllPreviews,
    hasDraft: hasImageDraft,
  } = useImageDraft({
    key: draftKey,
    userId: user?.id,
    enabled: open && !!project,
  });
  
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Get previews from draft, state, or project
  const beforePreview = previews.before || project?.before_image_url || '';
  const afterPreview = previews.after || project?.after_image_url || '';
  
  const hasDraft = hasFormDraft || hasImageDraft;

  // Pre-fill form when project changes (only if no draft exists)
  useEffect(() => {
    if (project && !hasFormDraft) {
      setFormData({
        title: project.title,
        description: project.description,
        category: project.category,
        location: project.location,
        completed_date: project.completed_date.split('T')[0],
      });
    }
  }, [project, hasFormDraft]);

  // Restore File objects from base64 drafts when dialog opens
  useEffect(() => {
    const convertBase64ToFile = async (base64: string, filename: string): Promise<File> => {
      const response = await fetch(base64);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    };

    const restoreImagesFromDraft = async () => {
      if (previews.before && !beforeImage) {
        try {
          const file = await convertBase64ToFile(previews.before, 'before-draft.jpg');
          setBeforeImage(file);
        } catch (e) {
          console.error('Error restoring before image:', e);
        }
      }
      if (previews.after && !afterImage) {
        try {
          const file = await convertBase64ToFile(previews.after, 'after-draft.jpg');
          setAfterImage(file);
        } catch (e) {
          console.error('Error restoring after image:', e);
        }
      }
    };

    if (open && hasImageDraft) {
      restoreImagesFromDraft();
    }
  }, [open, hasImageDraft, previews.before, previews.after]);

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

  const updateProject = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error('No project to update');

      setUploading(true);
      
      // Only upload new images if they were changed
      let beforeUrl = project.before_image_url;
      let afterUrl = project.after_image_url;
      
      if (beforeImage) {
        beforeUrl = await uploadImage(beforeImage, 'before');
      }
      if (afterImage) {
        afterUrl = await uploadImage(afterImage, 'after');
      }

      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          completed_date: formData.completed_date,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
          status: 'pending_approval',
          submitted_at: new Date().toISOString(),
          rejection_reason: null,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq('id', project.id);

      if (error) throw error;

      // Send notification to all admins and owners
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'platform_owner']);

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          user_id: admin.user_id,
          title: 'Redigert prosjekt til godkjenning',
          message: `${user?.email || 'En worker'} har sendt inn prosjektet "${formData.title}" på nytt`,
          type: 'content_submission',
        }));

        await supabase.from('notifications').insert(notifications);
      }

      // Send email notification (fire-and-forget)
      supabase.functions.invoke('send-content-notification', {
        body: { type: 'project', title: formData.title, submitterEmail: user?.email, isEdit: true },
      }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pending-projects'] });
      toast({ title: 'Innsendt', description: 'Prosjektet er sendt til godkjenning på nytt.' });
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
    if (hasDraft) {
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
  const isFormValid = isTitleValid && isDescriptionValid && beforePreview;

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
    updateProject.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger prosjekt</DialogTitle>
          <DialogDescription>
            Gjør endringer og send inn på nytt til godkjenning
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
                <ImageDropZone
                  onFileSelect={(file) => handleImageChange('before', file)}
                  preview={beforePreview}
                  onRemove={() => {
                    setBeforeImage(null);
                    clearPreview('before');
                  }}
                  onError={(message) => toast({ title: 'Feil', description: message, variant: 'destructive' })}
                  disabled={uploading}
                  className="h-40"
                  previewClassName="h-40"
                  label="Last opp før-bilde"
                />
              </div>
            </div>
            <div>
              <Label>Etter-bilde *</Label>
              <div className="mt-2">
                <ImageDropZone
                  onFileSelect={(file) => handleImageChange('after', file)}
                  preview={afterPreview}
                  onRemove={() => {
                    setAfterImage(null);
                    clearPreview('after');
                  }}
                  onError={(message) => toast({ title: 'Feil', description: message, variant: 'destructive' })}
                  disabled={uploading}
                  className="h-40"
                  previewClassName="h-40"
                  label="Last opp etter-bilde"
                />
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
              disabled={uploading || !isFormValid || !afterPreview || updateProject.isPending}
            >
              {(uploading || updateProject.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send inn på nytt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
